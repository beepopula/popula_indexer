let AsyncUtil = module.exports = {};
const model = require('../db.js')
AsyncUtil.add_post = async function (m,timestamp) {

    try {
        if (m.methodName == 'add_content' && m.status.SuccessValue) {
            // console.log(" load add_post", m);
            let d = JSON.parse(JSON.parse(m.args).args)
            let hierarchies =JSON.parse(m.args).hierarchies
            let row = {
                ...d,
                ...m,
                target_hash: m.status.SuccessValue,
                createAt: timestamp,
                data: m,
                hierarchies:hierarchies,
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

AsyncUtil.add_encrypt_post = async function (m,timestamp) {


}



AsyncUtil.add_comment = async function (m,timestamp) {
    try {
        if (m.methodName == 'add_content' && m.status.SuccessValue) {
            // console.log(" load add_comment", m);
            let d = JSON.parse(m.args)
            let hierarchies =JSON.parse(m.args).hierarchies
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
                hierarchies:hierarchies,
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

AsyncUtil.add_encrypt_comment = async function (m,timestamp) {


}