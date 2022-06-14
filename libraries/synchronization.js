let AsyncUtil = module.exports = {};
const model = require('../db.js')
AsyncUtil.add_post = async function (m, timestamp) {

    try {
        if (m.methodName == 'add_content' ) {
            // console.log(" load add_post", m);
            let d = JSON.parse(JSON.parse(m.args).args)
            let hierarchies = JSON.parse(m.args).hierarchies
            let row = {
                ...d,
                ...m,
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
        if (m.methodName == 'add_content' && m.status.SuccessValue) {
            let d = JSON.parse(m.args)
            let text = JSON.parse(d.encrypt_args)
            let hierarchies = JSON.parse(m.args).hierarchies
            // console.log('d ', d);
            let row = {
                ...d,
                ...text,
                ...m,
                target_hash: m.status.SuccessValue,
                hierarchies:hierarchies,
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
        if (m.methodName == 'add_content' ) {
            // console.log(" load add_comment", m);
            let d = JSON.parse(m.args)
            let hierarchies = JSON.parse(m.args).hierarchies
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
        if (m.methodName == 'add_content' && m.status.SuccessValue) {
            let d = JSON.parse(m.args)
            let text = JSON.parse(d.encrypt_args)
            let hierarchies = JSON.parse(m.args).hierarchies
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
                hierarchies:hierarchies,
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
        if (m.methodName == 'del_content' ) {
            // console.log(" load add_comment", m);
            let d = JSON.parse(m.args)
            let hierarchies = JSON.parse(m.args).hierarchies
            let h = hierarchies[hierarchies.length - 1]

            let Post = model['post'];
            let Comment = model['comment'];

            let post = await Post.getRow({target_hash: h.target_hash})
            if (post){
                let update = await Post.updateOrInsertRow({target_hash: h.target_hash}, {deleted:true})

            }
            let comment = await Comment.getRow({target_hash: h.target_hash})
            if (comment){
                let update = await Comment.updateOrInsertRow({target_hash: h.target_hash}, {deleted:true})
            }
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
