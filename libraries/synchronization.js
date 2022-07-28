let AsyncUtil = module.exports = {};
const model = require('../db.js')
const config = require("config")
const nearConfig = config.get('nearWallet')
const constants = config.get('constants');


AsyncUtil.add_user = async function (m, timestamp){
    try {
        let row = {
            ...m,
            create_at: timestamp,
            data: m
        }
        let log = model['log'];
        let update = await log.updateOrInsertRow({
            method_name: m.method_name,
            block_height: block_height,
            create_at: row.create_at
        }, row)
        if (m.account_id) {
            let User = model['user'];
            let join = model['join'];
            let u = await User.updateOrInsertRow({account_id: m.account_id}, {account_id: m.account_id})
            let update = await join.updateOrInsertRow(
                {community_id: constants.MAIN_CONTRACT, account_id: m.account_id},
                {
                    community_id: constants.MAIN_CONTRACT,
                    account_id: m.account_id,
                    create_at: timestamp,
                    weight: timestamp,
                    join_flag: false,
                    creator: 0
                })
        }

    } catch (e) {
        console.log(e);
    }
}

AsyncUtil.add_post = async function (m, timestamp) {

    try {
        if (m.method_name == 'add_content') {
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
                create_at: timestamp,
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
        if (m.method_name == 'add_encrypt_content' && m.status.SuccessValue) {
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
                create_at: timestamp,
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
        if (m.method_name == 'add_content') {
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
                commentPostId = await getPostId(Comment, Post, {post_id: d.target_hash})
            } else {
                commentPostId = d.target_hash
            }

            let row = {
                ...d,
                ...m,
                options:options,
                ...text,
                target_hash: m.status.SuccessValue,
                post_id: d.target_hash,
                comment_post_id: commentPostId,
                create_at: timestamp,
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
        if (m.method_name == 'add_encrypt_content' && m.status.SuccessValue) {
            let d = JSON.parse(m.args)
            let text = d.encrypt_args
            let hierarchies = d.hierarchies
            let h = hierarchies[hierarchies.length - 1]
            let Post = model['post'];
            let Comment = model['comment'];
            let commentPostId = null
            let post = await Post.getRow({target_hash: d.target_hash})
            if (!post) {
                commentPostId = await getPostId(Comment, Post, {post_id: d.target_hash})
            } else {
                commentPostId = d.target_hash
            }
            let row = {
                ...d,
                ...m,
                ...text,
                target_hash: m.status.SuccessValue,
                post_id: d.target_hash,
                comment_post_id: commentPostId,
                create_at: timestamp,
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
        if (m.method_name == 'del_content') {
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
            let update = await like.updateRows({target_hash: h.target_hash}, {like_flag: true,options:"del_content"})

        }
    } catch (e) {
        console.log(e);
    }
}

AsyncUtil.like = async function (m, timestamp) {
    try {
        if (m.method_name == 'like') {

            let d = JSON.parse(m.args)
            let hierarchies = JSON.parse(m.args).hierarchies
            let h = hierarchies[hierarchies.length - 1]
            let row = {
                ...d,
                ...m,
                target_hash: h.target_hash,
                create_at: timestamp,
                data: m,
                like_flag: false,
            }
            let like = model['like'];
            let update = await like.updateOrInsertRow({account_id: m.account_id, target_hash: h.target_hash}, row)

        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.unlike = async function (m, timestamp) {
    try {
        if (m.method_name == 'unlike') {

            let d = JSON.parse(m.args)
            let hierarchies = JSON.parse(m.args).hierarchies
            let h = hierarchies[hierarchies.length - 1]
            let row = {
                ...d,
                ...m,
                target_hash: h.target_hash,
                create_at: timestamp,
                data: m,
                like_flag: true,
            }
            let like = model['like'];
            let update = await like.updateOrInsertRow({account_id: m.account_id, target_hash: h.target_hash}, row)

        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.report = async function (m, timestamp) {
    try {
        if (m.method_name == 'report') {

            let d = JSON.parse(m.args)
            let hierarchies = JSON.parse(m.args).hierarchies
            let h = hierarchies[hierarchies.length - 1]
            let row = {
                ...d,
                ...m,
                target_hash: h.target_hash,
                create_at: timestamp,
                data: m,
                report_flag: false,
            }
            let Report = model['report'];

            let update = await Report.updateOrInsertRow({account_id: m.account_id, target_hash: h.target_hash}, row)

        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.quit = async function (m, timestamp) {
    try {
        if (m.method_name == 'quit') {
            //  console.log(" load join", m);
            let d = JSON.parse(m.args)
            let row = {
                ...d,
                ...m,
                community_id: m.receiver_id,
                // target_hash: m.status.SuccessValue,
                create_at: timestamp,
                // weight:timestamp,
                data: m,
                join_flag: true,
                //creator:0

            }
            let join = model['join'];
            let update = await join.updateOrInsertRow({community_id: m.receiver_id, account_id: m.account_id}, row)

        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.join = async function (m, timestamp) {
    try {
        if (m.method_name == 'join') {
            //  console.log(" load join", m);
            let d = JSON.parse(m.args)
            let row = {
                ...d,
                ...m,
                community_id: m.receiver_id,
                // target_hash: m.status.SuccessValue,
                create_at: timestamp,
                weight: timestamp,
                data: m,
                join_flag: false,
                creator: 0

            }
            let join = model['join'];
            let update = await join.updateOrInsertRow({community_id: m.receiver_id, account_id: m.account_id}, row)

        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.deploy_community = async function (m, timestamp) {
    try {
        if (m.method_name == 'deploy_community') {
            // console.log(" load deploy_community", m);
            let d = JSON.parse(m.args)
            let row = {
                ...d,
                ...m,
                community_id: d.name + '.' + m.receiver_id,
                create_at: timestamp,
                data: m,
                follow_flag: false,
                deleted: false,

            }
            let communities = model['communities'];
            let Join = model['join'];
            let update = await communities.updateOrInsertRow({
                community_id: row.community_id,
                account_id: row.account_id
            }, row)

            let u = await Join.updateOrInsertRow({
                community_id: row.community_id,
                account_id: row.account_id
            }, {
                community_id: row.community_id,
                account_id: row.account_id,
                create_at: timestamp,
                weight: timestamp,
                creator: 1,
                join_flag: false
            })


        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.deploy_community_by_owner = async function (m, timestamp) {
    try {
        if (m.method_name == 'deploy_community_by_owner') {
            // console.log(" load deploy_community", m);
            let d = JSON.parse(m.args)
            let row = {
                ...d,
                ...m,
                community_id: d.name + '.' + m.receiver_id,
                account_id:d.creator_id,
                by_owner:m.account_id,
                create_at: timestamp,
                data: m,
                follow_flag: false,
                deleted: false,
            }
            let communities = model['communities'];
            let Join = model['join'];
            let update = await communities.updateOrInsertRow({
                community_id: row.community_id,
                account_id: row.account_id
            }, row)

            let u = await Join.updateOrInsertRow({
                community_id: row.community_id,
                account_id: row.account_id
            }, {
                community_id: row.community_id,
                account_id: row.account_id,
                create_at: timestamp,
                weight: timestamp,
                creator: 1,
                join_flag: false
            })


            if (d.creator_id) {
                let User = model['user'];
                let u = await User.updateOrInsertRow({account_id:d.creator_id}, {account_id: d.creator_id})
                let update = await Join.updateOrInsertRow(
                    {community_id: constants.MAIN_CONTRACT, account_id:d.creator_id},
                    {
                        community_id: constants.MAIN_CONTRACT,
                        account_id:d.creator_id,
                        create_at: timestamp,
                        weight: timestamp,
                        join_flag: false,
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
        if (m.method_name == 'set_owner') {
            // console.log(" load deploy_community", m);
            let d = JSON.parse(m.args)
            let row = {
                ...d,
                ...m,
                community_id:  m.receiver_id,
                account_id:d.account_id,
                set_owner:m.account_id,
              //  create_at: timestamp,
                data: m,
                follow_flag: false,
                deleted: false,
            }
            let communities = model['communities'];
            let Join = model['join'];
            let update = await communities.updateOrInsertRow({
                community_id: row.community_id,
                account_id: row.set_owner
            }, row)

            await Join.updateOrInsertRow({
                community_id: row.community_id,
                account_id: row.account_id
            }, {
                community_id: row.community_id,
                account_id: row.account_id,
                create_at: timestamp,
                weight: timestamp,
                creator: 1,
                join_flag: false
            })

           await Join.updateOrInsertRow({
                community_id: row.community_id,
                account_id: row.set_owner
            }, {
                community_id: row.community_id,
                account_id: row.set_owner,
                create_at: timestamp,
                weight: timestamp,
                creator: 0,
                join_flag: false
            })


            if (d.account_id) {
                let User = model['user'];
                let u = await User.updateOrInsertRow({account_id:d.account_id}, {account_id: d.account_id})
                let update = await Join.updateOrInsertRow(
                    {community_id: constants.MAIN_CONTRACT, account_id:d.account_id},
                    {
                        community_id: constants.MAIN_CONTRACT,
                        account_id:d.account_id,
                        create_at: timestamp,
                        weight: timestamp,
                        join_flag: false,
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
        if (m.method_name == 'unfollow') {
            //  console.log(" load unfollow", m);
            let d = JSON.parse(m.args)
            let row = {
                ...d,
                ...m,
                account_id_passive:d.account_id,
                // target_hash: m.status.SuccessValue,
                create_at: timestamp,
                data: m,
                follow_flag: true,

            }
            let follow = model['follow'];
            let update = await follow.updateOrInsertRow({account_id: m.account_id, account_id_passive: d.account_id}, row)

        }
    } catch (e) {
        console.log(e);
    }

}

AsyncUtil.follow = async function (m, timestamp) {

    try {
        if (m.method_name == 'follow') {
            // console.log(" load follow", timestamp, m);
            let d = JSON.parse(m.args)
            let row = {
                ...d,
                ...m,
                account_id_passive:d.account_id,
                // target_hash: m.status.SuccessValue,
                create_at: timestamp,
                data: m,
                follow_flag: false,

            }
            let follow = model['follow'];
            let update = await follow.updateOrInsertRow({account_id: m.account_id, account_id_passive: d.account_id}, row)

        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.add_item = async function (m, timestamp) {

    try {
        if (m.method_name == 'add_item' && m.status.SuccessValue) {
            // let d = JSON.parse(m.args)
            let d = JSON.parse(JSON.parse(m.args).args)
            let row = {
                ...d,
                // ...text,
                ...m,
                predecessor_id: m.receipt.predecessor_id,
                target_hash: m.status.SuccessValue,
                create_at: timestamp,
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
        if (m.method_name == 'share') {

            let d = JSON.parse(m.args)
            let hierarchies = JSON.parse(m.args).hierarchies
            let h = hierarchies[hierarchies.length - 1]
            let row = {
                ...d,
                ...m,
                target_hash: h.target_hash,
                account_id_passive:h.account_id,
                create_at: timestamp,
                data: m,
                like_flag: true,
            }
            let Share = model['share'];
            let update = await Share.updateOrInsertRow({account_id: m.account_id, target_hash: h.target_hash,account_id_passive:h.account_id}, row)
        }
    } catch (e) {
        console.log(e);
    }


}

AsyncUtil.insertNotifications = async function (m, timestamp) {
    let Comment = model['comment'];
    let Post = model['post'];
    let Notification = model['notification'];

    if (m.method_name == 'add_content' || m.method_name == 'add_encrypt_content') {
        let hierarchies = JSON.parse(m.args).hierarchies
        if (hierarchies.length > 0) {
            let comment = await Comment.getRow({target_hash: m.status.SuccessValue})
            if (comment) {
                delete comment['data']
                delete comment['text_sign']
                let cPost = await Post.getRow({target_hash: comment.post_id})
                if (cPost) {
                    delete cPost['data']
                    delete cPost['text_sign']
                }

                let mainPost = await Post.getRow({target_hash: comment.comment_post_id})
                if (mainPost&&(comment.comment_post_id!=comment.post_id)) {
                    delete mainPost['data']
                    delete mainPost['text_sign']
                    let doc = {
                        account_id: comment.account_id,
                        account_id_passive: m.account_id,
                        target_hash: m.status.SuccessValue,
                        comment: comment,
                        options:comment.options,
                        comment_content: mainPost,
                        method_name: m.method_name,
                        type: "mainPost",
                        create_at: timestamp,
                    }
                    await Notification.createRow(doc)
                }

                let cComment = await Comment.getRow({target_hash: comment.post_id})
                if (cComment) {
                    delete cComment['data']
                    delete cComment['text_sign']
                }
                let doc = {
                    account_id: comment.account_id,
                    account_id_passive: m.account_id,
                    target_hash: m.status.SuccessValue,
                    comment: comment,
                    options:comment.options,
                    comment_content: cComment ? cComment : cPost,
                    method_name: m.method_name,
                    type: "comment",
                    create_at: timestamp,
                }
                await Notification.createRow(doc)
                await Notification.updateRow({target_hash:doc.target_hash,"$or": [{type: "comment"}, {type: "post"}]}, {create_at: timestamp})

            } else {
                console.log(m.method_name, " : ", m.status.SuccessValue);
            }
        } else {
            let post = await Post.getRow({target_hash: m.status.SuccessValue})
            if (post) {
                delete post['data']
                delete post['text_sign']

                let doc = {
                    account_id: post.account_id,
                    account_id_passive: m.account_id,
                    target_hash: m.status.SuccessValue,
                    post: post,
                    options:post.options,
                    comment: {},
                    comment_content: {},
                    method_name: m.method_name,
                    type: "post",
                    create_at: timestamp,
                }
                await Notification.createRow(doc)
            } else {
                console.log(m.method_name, " : ", m.status.SuccessValue);
            }

        }


    }
    if (m.method_name == 'like') {
        let d = JSON.parse(m.args)
        let hierarchies = JSON.parse(m.args).hierarchies
        let h = hierarchies[hierarchies.length - 1]
        let doc = {
            ...d,
            account_id: m.account_id,
            target_hash: h.target_hash,
            method_name: m.method_name,
            type: "like",
            create_at: timestamp,
        }

        await Notification.updateRow({target_hash:h.target_hash,"$or": [{type: "comment"}, {type: "post"}]}, {create_at: timestamp})
        await Notification.updateOrInsertRow({
            account_id: m.account_id,
            target_hash: h.target_hash,
            method_name: m.method_name
        }, doc)

    }
    if (m.method_name == 'follow') {
        let d = JSON.parse(m.args)
        let doc = {
            ...d,
            account_id: m.account_id,
            account_id_passive: d.account_id,
            method_name: m.method_name,
            type: "follow",
            create_at: timestamp,
        }
        await Notification.updateOrInsertRow({
            account_id: m.account_id,
            account_id_passive: d.account_id,
            method_name: m.method_name,
        }, doc)

    }

}

async function getPostId(Comment, Post, comment) {

    let comments = await Comment.getRow({target_hash: comment.post_id})
    if (comments) {

        return await getPostId(Comment, Post, comments)

    } else {

        let post = await Post.getRow({target_hash: comment.post_id})
        if (post) {

            return post.target_hash
        } else {
            return null
        }
    }

}
