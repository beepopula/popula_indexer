const nearAPI = require('near-api-js')
const config = require("config")
const nearConfig = config.get('nearWallet')
const constants = config.get('constants');
const model = require('./db.js')
const timer = require('./libraries/schedule/timerMethod');
let schedule = require("node-schedule");
let asyncUtil = require("./libraries/synchronization")
const provider = new nearAPI.providers.JsonRpcProvider(nearConfig.nodeUrl);
//const {Pool} = require('pg')
//const pool = new Pool({connectionString: constants.INDEXER})
// const BN = require('bn.js')
// const js_sha256 = require('js-sha256')

let txMap = []
let txPerBlock = []
let blockAsyncFlag = true
let breakWhile = false

async function main() {
    await asyncUserToPopula();
    await initBlockModel();
    let blockModel = model['block'];
    schedule.scheduleJob('*/1 * * * * *', async function () {
        const block = await provider.block({finality: 'optimistic'});
        let final_block_height = block.header.height
        let update = await blockModel.updateRow({name: 'optimistic'}, {finalBlockHeight: final_block_height})
        let row = await blockModel.getRow({"name": "optimistic"})
        if (row.blockHeight < row.finalBlockHeight) {
            console.log('blockAsyncFlag:', blockAsyncFlag);
            if (blockAsyncFlag) {
                blockAsyncFlag = false
                blockAsyncFlag = await resolveNewBlock()
            }
        }
    });

    schedule.scheduleJob('*/1 * * * * *', async function () {
        let row = await blockModel.getRow({"name": "optimistic_b"})
        if (row.debug){
            let update = await blockModel.updateRow({name: 'optimistic_b'}, {debug: false})
            await asyncSectionData()
        }
    });

    let asyncBlock = 0
    schedule.scheduleJob('30 * * * * *', async function () {
        let row = await blockModel.getRow({"name": "optimistic"})
        if (asyncBlock == row.blockHeight) {
            blockAsyncFlag = true
        } else {
            asyncBlock = row.blockHeight
        }
    });
}

async function resolveNewBlock() {
    console.log('call function ..');
    let blockModel = model['block'];
    let row = await blockModel.getRow({"name": "optimistic"})
    let block_height = row.blockHeight ? row.blockHeight : block_height
    let final_block_height = row.finalBlockHeight
    console.log(`fetched block height: ${block_height}, final block height: ${final_block_height}`)
    try {
        while (final_block_height > block_height) {
            console.log(block_height);
            block_height += 1
            let update = await blockModel.updateRow({name: 'optimistic'}, {blockHeight: block_height})
            let block = {}
            try {
                block = await provider.block({blockId: block_height})
            } catch (e) {
                continue
            }

            let transactions = []
            let receipts = []
            for (let chunk of block.chunks) {
                let chunkData = await provider.chunk(chunk.chunk_hash)
                transactions = transactions.concat(chunkData.transactions)
                receipts = receipts.concat(chunkData.receipts)
            }
            let receiptsResolved = await resolveReceipts(receipts)
            await resolveTxs(transactions)
            await storeReceipts(receiptsResolved, block.header.timestamp, block_height, "block")  //TODO
        }
    } catch (e) {
        console.log(e);
        return true
    }

    return true
}

async function resolveTxs(transactions) {
    if (txPerBlock.length >= 10) {
        for (let txs of txPerBlock[0]) {
            for (let tx of txs) {
                delete txMap[tx]
            }
        }
    }
    let blockTxs = []
    for (let tx of transactions) {
        let signerId = tx.signer_id
        blockTxs.push(signerId)
        if (!txMap[signerId]) {
            txMap[signerId] = []
        }
        txMap[signerId].push(tx)

    }
    txPerBlock.push(blockTxs)
}

async function resolveReceipts(receipts) {
    let receiptsResolved = []
    for (let receipt of receipts) {


        if (receipt.receiver_id.includes(constants.MAIN_ACCOUNT) && receipt.receipt.Action && receipt.receipt.Action.actions[0].FunctionCall) {

            let functionCall = receipt.receipt.Action.actions[0].FunctionCall
            let txDigest = txMap[receipt.receipt.Action.signer_id]
            if (!txDigest || !txDigest[txDigest.length - 1]) {

                continue
            }
            let tx = await provider.txStatus(txDigest[txDigest.length - 1].hash, txDigest[txDigest.length - 1].signer_id)
            let receiptId = receipt.receipt_id
            let accountId = tx.transaction.signer_id;
            let receiverId = receipt.receiver_id
            let methodName = functionCall.method_name
            let args = Buffer.from(functionCall.args, 'base64').toString();
            let gas_used = 0
            let status = {}
            for (let outcome of tx.receipts_outcome) {
                if (outcome.id == receiptId) {
                    gas_used = outcome.outcome.tokens_burnt
                    status = outcome.outcome.status
                    break
                }
            }
            if (status.SuccessValue) {
                let d = Buffer.from(status.SuccessValue, 'base64').toString()
                let decode = d.replace(new RegExp(/\"/, "gm"), '')
                status.SuccessValue = decode
            }
            receiptsResolved.push({
                receiptId,
                accountId,
                receiverId,
                methodName,
                args,
                gas_used,
                status,
                tx,
                receipt: receipt,
            })

        }
    }
    return receiptsResolved
}

async function storeReceipts(receiptsResolved, timestamp, block_height, type) {

    for (m of receiptsResolved) {
        if (type == 'block') {
            timestamp = parseInt(timestamp / 1000000)
        }
        if (m.status && m.status.Failure) {
            continue
        }
        console.log(' methodName and timestamp:', timestamp, ' : ', m.methodName);
        try {
            let row = {
                ...m,
                createAt: timestamp,
                data: m
            }
            let log = model['log'];
            let update = await log.updateOrInsertRow({
                methodName: m.methodName,
                blockHeight: block_height,
                createAt: row.createAt
            }, row)
            if (m.accountId) {
                let User = model['user'];
                let join = model['join'];
                let u = await User.updateOrInsertRow({account_id: m.accountId}, {account_id: m.accountId})
                let update = await join.updateOrInsertRow(
                    {communityId: constants.MAIN_CONTRACT, accountId: m.accountId},
                    {
                        communityId: constants.MAIN_CONTRACT,
                        accountId: m.accountId,
                        createAt: timestamp,
                        weight: timestamp,
                        joinFlag: false,
                        creator: 0
                    })
            }

        } catch (e) {
            console.log(e);
        }
        try {
            if (m.methodName == 'add_content' && m.status.SuccessValue) {
                let hierarchies = JSON.parse(m.args).hierarchies
                if (hierarchies.length > 0) {
                    await asyncUtil.add_comment(m, timestamp)
                } else {
                    await asyncUtil.add_post(m, timestamp)
                }

            }
        } catch (e) {
            console.log(e);
        }

        try {
            if (m.methodName == 'add_encrypt_content' && m.status.SuccessValue) {
                let d = JSON.parse(m.args)
                let hierarchies = d.hierarchies
                if (hierarchies.length > 0) {
                    await asyncUtil.add_encrypt_comment(m, timestamp)
                } else {
                    await asyncUtil.add_encrypt_post(m, timestamp)
                }

            }
        } catch (e) {
            console.log(e);
        }

        try {
            await asyncUtil.del_content(m, timestamp)
            await asyncUtil.report(m, timestamp)
            await asyncUtil.deploy_community(m, timestamp)
            await asyncUtil.like(m, timestamp)
            await asyncUtil.unlike(m, timestamp)
            await asyncUtil.follow(m, timestamp)
            await asyncUtil.unfollow(m, timestamp)
            await asyncUtil.join(m, timestamp)
            await asyncUtil.quit(m, timestamp)
            await asyncUtil.add_item(m, timestamp)
            await asyncUtil.insertNotifications(m, timestamp)
        } catch (e) {
            console.log(e);
        }
    }
}

async function updateDateFromLogs() {

    let Notification = model['notification'];
    await Notification.deleteRow({})

    let Log = model['log'];
    let logs = await Log.getRows()
    for (let i = 0; i < logs.length; i++) {
        console.log("updateDateFromLogs : ", i, " : ", logs[i].methodName);
        await storeReceipts([logs[i].data], logs[i].createAt, logs[i].blockHeight, "log")
    }
}

async function asyncUserToPopula() {
    let Communities = model['communities'];
    let row = await Communities.updateOrInsertRow({
        "accountId": constants.MAIN_ACCOUNT,
        "communityId": constants.MAIN_CONTRACT,
    }, {"accountId": constants.MAIN_ACCOUNT, "communityId": constants.MAIN_CONTRACT, name: "popula", "deleted": false,})
    let User = model['user'];
    let Join = model['join'];
    let users = await User.getRows({})
    for (let i = 0; i < users.length; i++) {
        let update = await Join.updateOrInsertRow(
            {communityId: constants.MAIN_CONTRACT, accountId: users[i]['account_id']},
            {
                communityId: constants.MAIN_CONTRACT,
                accountId: users[i]['account_id'],
                createAt: Date.now(),
                weight: Date.now(),
                joinFlag: false,
                creator: 0
            })
    }
}

async function initBlockModel() {
    let blockModel = model['block'];
    let row = await blockModel.getRow({"name": "optimistic"})
    if (!row) {
        const block = await provider.block({finality: 'optimistic'});
        let final_block_height = block.header.height
        await blockModel.updateOrInsertRow({"name": "optimistic"}, {
            "name": "optimistic",
            finalBlockHeight: final_block_height,
            blockHeight: final_block_height
        })
        await blockModel.updateOrInsertRow({"name": "optimistic_b"}, {
            "name": "optimistic_b",
            finalBlockHeight: final_block_height,
            blockHeight: final_block_height,
            debug: false
        })
    }
}

async function asyncSectionData() {

    let blockModel = model['block'];
    let row = await blockModel.getRow({"name": "optimistic_b"})
    let final_block_height = row.finalBlockHeight
    let block_height = row.blockHeight

    try {
        while (final_block_height > block_height) {
            block_height += 1
            let update = await blockModel.updateRow({name: 'optimistic_b'}, {blockHeight: block_height})
            let block = {}
            try {
                block = await provider.block({blockId: block_height})
            } catch (e) {
                continue
            }
            let transactions = []
            let receipts = []
            for (let chunk of block.chunks) {
                let chunkData = await provider.chunk(chunk.chunk_hash)
                transactions = transactions.concat(chunkData.transactions)
                receipts = receipts.concat(chunkData.receipts)
            }
            let receiptsResolved = await resolveReceipts(receipts)
            await resolveTxs(transactions)
            await storeReceipts(receiptsResolved, block.header.timestamp, block_height, "block")  //TODO
        }
    } catch (e) {
        console.log(e);
        return true
    }

    return true
}

updateDateFromLogs()


main()
timer.get_final_block_height(model)
