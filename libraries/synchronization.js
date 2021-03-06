let AsyncUtil = module.exports = {};
const model = require('../db.js')
const config = require("config")
const nearConfig = config.get('nearWallet')
const constants = config.get('constants');


AsyncUtil.add_user = async function (m, timestamp){
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
}

AsyncUtil.add_post = async function (m, timestamp) {

    try {
        if (m.methodName == 'add_content') {
            // console.log(" load add_post", m);
            let d = JSON.parse(JSON.parse(m.args).args)
            console.log("d : ",d);
            let hierarchies = JSON.parse(m.args).hierarchies
            let options = JSON.parse(m.args).options

            let row = {
                ...d,
                ...m,
                options:options,
                target_hash: m.status.SuccessValue,
                createAt: timestamp,
                data: m,
                hierarchies: hierarchies,
                transaction_hash: m.tx.transaction.hash,
                deleted: false

            }
            let post = model['post'];
            let update = await post.updateOrInsertRow({target_hash: m.status.SuccessValue}, row)

        }
    } catch (e) {
        console.log(e);
    }
}

AsyncUtil.add_encrypt_post = async function (m, timestamp) {
    try {
        if (m.methodName == 'add_encrypt_content' && m.status.SuccessValue) {
            let d = JSON.parse(m.args)
            console.log("d :", d);
            let text = JSON.parse(d.encrypt_args)
            console.log("text", text);
            let hierarchies = d.hierarchies
            // console.log('d ', d);
            let row = {
                ...d,
                ...text,
                ...m,
                target_hash: m.status.SuccessValue,
                hierarchies: hierarchies,
                createAt: timestamp,
                data: m,
                transaction_hash: m.tx.transaction.hash,
                type: 'encrypt',
                deleted: false

            }
            let post = model['post'];
            let update = await post.updateOrInsertRow({target_hash: m.status.SuccessValue}, row)

        }
    } catch (e) {
        console.log(e);
    }

}

AsyncUtil.add_comment = async function (m, timestamp) {
    try {
        if (m.methodName == 'add_content') {
            // console.log(" load add_comment", m);
            let d = JSON.parse(m.args)
            let hierarchies = JSON.parse(m.args).hierarchies
            let options = JSON.parse(m.args).options
            let h = hierarchies[hierarchies.length - 1]
            let text = JSON.parse(d.args)
            let Post = model['post'];
            let Comment = model['comment'];
            let commentPostId = null
            let post = await Post.getRow({target_hash: d.target_hash})
            if (!post) {
                commentPostId = await getPostId(Comment, Post, {postId: d.target_hash})
            } else {
                commentPostId = d.target_hash
            }

            let row = {
                ...d,
                ...m,
                options:options,
                ...text,
                target_hash: m.status.SuccessValue,
                postId: d.target_hash,
                commentPostId: commentPostId,
                createAt: timestamp,
                hierarchies: hierarchies,
                data: m,
                deleted: false,
                transaction_hash: m.tx.transaction.hash,

            }

            let update = await Comment.updateOrInsertRow({target_hash: m.status.SuccessValue}, row)

        }
    } catch (e) {
        console.log(e);
    }

}

AsyncUtil.add_encrypt_comment = async function (m, timestamp) {
    try {
        if (m.methodName == 'add_encrypt_content' && m.status.SuccessValue) {
            let d = JSON.parse(m.args)
            let text = d.encrypt_args
            let hierarchies = d.hierarchies
            let h = hierarchies[hierarchies.length - 1]
            let Post = model['post'];
            let Comment = model['comment'];
            let commentPostId = null
            let post = await Post.getRow({target_hash: d.target_hash})
            if (!post) {
                commentPostId = await getPostId(Comment, Post, {postId: d.target_hash})
            } else {
                commentPostId = d.target_hash
            }
            let row = {
                ...d,
                ...m,
                ...text,
                target_hash: m.status.SuccessValue,
                postId: d.target_hash,
                commentPostId: commentPostId,
                createAt: timestamp,
                hierarchies: hierarchies,
                data: m,
                type: 'encrypt',
                deleted: false,
                transaction_hash: m.tx.transaction.hash,

            }

            let update = await Comment.updateOrInsertRow({target_hash: m.status.SuccessValue}, row)

        }
    } catch (e) {
        console.log(e);
    }
}

AsyncUtil.del_content = async function (m, timestamp) {

    try {
        if (m.methodName == 'del_content') {
            // console.log(" load add_comment", m);
            let d = JSON.parse(m.args)
            let hierarchies = JSON.parse(m.args).hierarchies
            let h = hierarchies[hierarchies.length - 1]

            let Post = model['post'];
            let Comment = model['comment'];

            let post = await Post.getRow({target_hash: h.target_hash})
            if (post) {
                let update = await Post.updateOrInsertRow({target_hash: h.target_hash}, {deleted: true})

            }
            let comment = await Comment.getRow({target_hash: h.target_hash})
            if (comment) {
                let update = await Comment.updateOrInsertRow({target_hash: h.target_hash}, {deleted: true})
            }
            let like = model['like'];
            let update = await like.updateRows({target_hash: h.target_hash}, {likeFlag: true,options:"del_content"})

        }
    } catch (e) {
        console.log(e);
    }
}

AsyncUtil.like = async function (m, timestamp) {
    try {
        if (m.methodName == 'like') {

            let d = JSON.parse(m.args)
            let hierarchies = JSON.parse(m.args).hierarchies
            let h = hierarchies[hierarchies.length - 1]
            let row = {
                ...d,
                ...m,
                target_hash: h.target_hash,
                createAt: timestamp,
                data: m,
                likeFlag: false,
            }
            let like = model['like'];
            let update = await like.updateOrInsertRow({accountId: m.accountId, target_hash: h.target_hash}, row)

        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.unlike = async function (m, timestamp) {
    try {
        if (m.methodName == 'unlike') {

            let d = JSON.parse(m.args)
            let hierarchies = JSON.parse(m.args).hierarchies
            let h = hierarchies[hierarchies.length - 1]
            let row = {
                ...d,
                ...m,
                target_hash: h.target_hash,
                createAt: timestamp,
                data: m,
                likeFlag: true,
            }
            let like = model['like'];
            let update = await like.updateOrInsertRow({accountId: m.accountId, target_hash: h.target_hash}, row)

        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.report = async function (m, timestamp) {
    try {
        if (m.methodName == 'report') {

            let d = JSON.parse(m.args)
            let hierarchies = JSON.parse(m.args).hierarchies
            let h = hierarchies[hierarchies.length - 1]
            let row = {
                ...d,
                ...m,
                target_hash: h.target_hash,
                createAt: timestamp,
                data: m,
                reportFlag: false,
            }
            let Report = model['report'];

            let update = await Report.updateOrInsertRow({accountId: m.accountId, target_hash: h.target_hash}, row)

        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.quit = async function (m, timestamp) {
    try {
        if (m.methodName == 'quit') {
            //  console.log(" load join", m);
            let d = JSON.parse(m.args)
            let row = {
                ...d,
                ...m,
                communityId: m.receiverId,
                // target_hash: m.status.SuccessValue,
                createAt: timestamp,
                // weight:timestamp,
                data: m,
                joinFlag: true,
                //creator:0

            }
            let join = model['join'];
            let update = await join.updateOrInsertRow({communityId: m.receiverId, accountId: m.accountId}, row)

        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.join = async function (m, timestamp) {
    try {
        if (m.methodName == 'join') {
            //  console.log(" load join", m);
            let d = JSON.parse(m.args)
            let row = {
                ...d,
                ...m,
                communityId: m.receiverId,
                // target_hash: m.status.SuccessValue,
                createAt: timestamp,
                weight: timestamp,
                data: m,
                joinFlag: false,
                creator: 0

            }
            let join = model['join'];
            let update = await join.updateOrInsertRow({communityId: m.receiverId, accountId: m.accountId}, row)

        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.deploy_community = async function (m, timestamp) {
    try {
        if (m.methodName == 'deploy_community') {
            // console.log(" load deploy_community", m);
            let d = JSON.parse(m.args)
            let row = {
                ...d,
                ...m,
                communityId: d.name + '.' + m.receiverId,
                createAt: timestamp,
                data: m,
                followFlag: false,
                deleted: false,

            }
            let communities = model['communities'];
            let Join = model['join'];
            let update = await communities.updateOrInsertRow({
                communityId: row.communityId,
                accountId: row.accountId
            }, row)

            let u = await Join.updateOrInsertRow({
                communityId: row.communityId,
                accountId: row.accountId
            }, {
                communityId: row.communityId,
                accountId: row.accountId,
                createAt: timestamp,
                weight: timestamp,
                creator: 1,
                joinFlag: false
            })


        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.deploy_community_by_owner = async function (m, timestamp) {
    try {
        if (m.methodName == 'deploy_community_by_owner') {
            // console.log(" load deploy_community", m);
            let d = JSON.parse(m.args)
            let row = {
                ...d,
                ...m,
                communityId: d.name + '.' + m.receiverId,
                accountId:d.creator_id,
                by_owner:m.accountId,
                createAt: timestamp,
                data: m,
                followFlag: false,
                deleted: false,
            }
            let communities = model['communities'];
            let Join = model['join'];
            let update = await communities.updateOrInsertRow({
                communityId: row.communityId,
                accountId: row.accountId
            }, row)

            let u = await Join.updateOrInsertRow({
                communityId: row.communityId,
                accountId: row.accountId
            }, {
                communityId: row.communityId,
                accountId: row.accountId,
                createAt: timestamp,
                weight: timestamp,
                creator: 1,
                joinFlag: false
            })


            if (d.creator_id) {
                let User = model['user'];
                let u = await User.updateOrInsertRow({account_id:d.creator_id}, {account_id: d.creator_id})
                let update = await Join.updateOrInsertRow(
                    {communityId: constants.MAIN_CONTRACT, accountId:d.creator_id},
                    {
                        communityId: constants.MAIN_CONTRACT,
                        accountId:d.creator_id,
                        createAt: timestamp,
                        weight: timestamp,
                        joinFlag: false,
                        creator: 0
                    })
            }

        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.set_owner = async function (m, timestamp) {
    try {
        if (m.methodName == 'set_owner') {
            // console.log(" load deploy_community", m);
            let d = JSON.parse(m.args)
            let row = {
                ...d,
                ...m,
                communityId:  m.receiverId,
                accountId:d.account_id,
                set_owner:m.accountId,
              //  createAt: timestamp,
                data: m,
                followFlag: false,
                deleted: false,
            }
            let communities = model['communities'];
            let Join = model['join'];
            let update = await communities.updateOrInsertRow({
                communityId: row.communityId,
                accountId: row.set_owner
            }, row)

            await Join.updateOrInsertRow({
                communityId: row.communityId,
                accountId: row.accountId
            }, {
                communityId: row.communityId,
                accountId: row.accountId,
                createAt: timestamp,
                weight: timestamp,
                creator: 1,
                joinFlag: false
            })

           await Join.updateOrInsertRow({
                communityId: row.communityId,
                accountId: row.set_owner
            }, {
                communityId: row.communityId,
                accountId: row.set_owner,
                createAt: timestamp,
                weight: timestamp,
                creator: 0,
                joinFlag: false
            })


            if (d.account_id) {
                let User = model['user'];
                let u = await User.updateOrInsertRow({account_id:d.account_id}, {account_id: d.account_id})
                let update = await Join.updateOrInsertRow(
                    {communityId: constants.MAIN_CONTRACT, accountId:d.account_id},
                    {
                        communityId: constants.MAIN_CONTRACT,
                        accountId:d.account_id,
                        createAt: timestamp,
                        weight: timestamp,
                        joinFlag: false,
                        creator: 0
                    })
            }

        }
    } catch (e) {
        console.log(e);
    }


}
AsyncUtil.unfollow = async function (m, timestamp) {
    try {
        if (m.methodName == 'unfollow') {
            //  console.log(" load unfollow", m);
            let d = JSON.parse(m.args)
            let row = {
                ...d,
                ...m,
                // target_hash: m.status.SuccessValue,
                createAt: timestamp,
                data: m,
                followFlag: true,

            }
            let follow = model['follow'];
            let update = await follow.updateOrInsertRow({accountId: m.accountId, account_id: d.account_id}, row)

        }
    } catch (e) {
        console.log(e);
    }

}

AsyncUtil.follow = async function (m, timestamp) {

    try {
        if (m.methodName == 'follow') {
            // console.log(" load follow", timestamp, m);
            let d = JSON.parse(m.args)
            let row = {
                ...d,
                ...m,
                // target_hash: m.status.SuccessValue,
                createAt: timestamp,
                data: m,
                followFlag: false,

            }
            let follow = model['follow'];
            let update = await follow.updateOrInsertRow({accountId: m.accountId, account_id: d.account_id}, row)

        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.add_item = async function (m, timestamp) {

    try {
        if (m.methodName == 'add_item' && m.status.SuccessValue) {
            // let d = JSON.parse(m.args)
            let d = JSON.parse(JSON.parse(m.args).args)
            let row = {
                ...d,
                // ...text,
                ...m,
                predecessor_id: m.receipt.predecessor_id,
                target_hash: m.status.SuccessValue,
                createAt: timestamp,
                data: m,
                transaction_hash: m.tx.transaction.hash,
                type: 'nft',
                deleted: false
            }
            let post = model['post'];
            let update = await post.updateOrInsertRow({target_hash: m.status.SuccessValue}, row)

        }
    } catch (e) {
        console.log(e);
    }


}


AsyncUtil.share_view = async function (m, timestamp) {
    try {
        if (m.methodName == 'share') {

            let d = JSON.parse(m.args)
            let hierarchies = JSON.parse(m.args).hierarchies
            let h = hierarchies[hierarchies.length - 1]
            let row = {
                ...d,
                ...m,
                target_hash: h.target_hash,
                account_id:h.account_id,
                createAt: timestamp,
                data: m,
                likeFlag: true,
            }
            let Share = model['share'];
            let update = await Share.updateOrInsertRow({accountId: m.accountId, target_hash: h.target_hash,account_id:h.account_id}, row)
        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.insertNotifications = async function (m, timestamp) {
    let Comment = model['comment'];
    let Post = model['post'];
    let Notification = model['notification'];

    if (m.methodName == 'add_content' || m.methodName == 'add_encrypt_content') {
        let hierarchies = JSON.parse(m.args).hierarchies
        if (hierarchies.length > 0) {
            let comment = await Comment.getRow({target_hash: m.status.SuccessValue})
            if (comment) {
                delete comment['data']
                delete comment['text_sign']
                let cPost = await Post.getRow({target_hash: comment.postId})
                if (cPost) {
                    delete cPost['data']
                    delete cPost['text_sign']
                }

                let mainPost = await Post.getRow({target_hash: comment.commentPostId})
                if (mainPost&&(comment.commentPostId!=comment.postId)) {
                    delete mainPost['data']
                    delete mainPost['text_sign']
                    let doc = {
                        accountId: comment.accountId,
                        account_id: m.accountId,
                        target_hash: m.status.SuccessValue,
                        comment: comment,
                        options:comment.options,
                        commentContent: mainPost,
                        methodName: m.methodName,
                        type: "mainPost",
                        createAt: timestamp,
                    }
                    await Notification.createRow(doc)
                }

                let cComment = await Comment.getRow({target_hash: comment.postId})
                if (cComment) {
                    delete cComment['data']
                    delete cComment['text_sign']
                }
                let doc = {
                    accountId: comment.accountId,
                    account_id: m.accountId,
                    target_hash: m.status.SuccessValue,
                    comment: comment,
                    options:comment.options,
                    commentContent: cComment ? cComment : cPost,
                    methodName: m.methodName,
                    type: "comment",
                    createAt: timestamp,
                }
                await Notification.createRow(doc)
                await Notification.updateRow({target_hash:doc.target_hash,"$or": [{type: "comment"}, {type: "post"}]}, {createAt: timestamp})

            } else {
                console.log(m.methodName, " : ", m.status.SuccessValue);
            }
        } else {
            let post = await Post.getRow({target_hash: m.status.SuccessValue})
            if (post) {
                delete post['data']
                delete post['text_sign']

                let doc = {
                    accountId: post.accountId,
                    account_id: m.accountId,
                    target_hash: m.status.SuccessValue,
                    post: post,
                    options:post.options,
                    comment: {},
                    commentContent: {},
                    methodName: m.methodName,
                    type: "post",
                    createAt: timestamp,
                }
                await Notification.createRow(doc)
            } else {
                console.log(m.methodName, " : ", m.status.SuccessValue);
            }

        }


    }
    if (m.methodName == 'like') {
        let d = JSON.parse(m.args)
        let hierarchies = JSON.parse(m.args).hierarchies
        let h = hierarchies[hierarchies.length - 1]
        let doc = {
            ...d,
            accountId: m.accountId,
            target_hash: h.target_hash,
            methodName: m.methodName,
            type: "like",
            createAt: timestamp,
        }

        await Notification.updateRow({target_hash:h.target_hash,"$or": [{type: "comment"}, {type: "post"}]}, {createAt: timestamp})
        await Notification.updateOrInsertRow({
            accountId: m.accountId,
            target_hash: h.target_hash,
            methodName: m.methodName
        }, doc)

    }
    if (m.methodName == 'follow') {
        let d = JSON.parse(m.args)
        let doc = {
            accountId: m.accountId,
            account_id: d.account_id,
            methodName: m.methodName,
            type: "follow",
            ...d,
            createAt: timestamp,
        }
        await Notification.updateOrInsertRow({
            accountId: m.accountId,
            account_id: d.account_id,
            methodName: m.methodName,
        }, doc)

    }

}

async function getPostId(Comment, Post, comment) {

    let comments = await Comment.getRow({target_hash: comment.postId})
    if (comments) {

        return await getPostId(Comment, Post, comments)

    } else {

        let post = await Post.getRow({target_hash: comment.postId})
        if (post) {

            return post.target_hash
        } else {
            return null
        }
    }

}
