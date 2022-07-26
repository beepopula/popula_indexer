let timer = module.exports = {};
let schedule = require("node-schedule");
const model = require('../../db.js')
const moment = require('moment')

timer.get_final_block_height= function () {
    let blocks = model['block'];
    schedule.scheduleJob('20 * * * * *', async function (ctx) {
        let Post = model["post"]
        let Like = model["like"]
        let Comment = model["comment"]
        let posts = await Post.getRows({})
        for (let i = 0; i < posts.length; i++) {
            let likeCount = await Like.getRowsCount({target_hash: posts[i]['target_hash'], like_flag: false});
            let commentCount = await Comment.getRowsCount({post_id: posts[i]['target_hash']});
            let commentItems = await Comment.getRows({post_id: posts[i]['target_hash']});
            let users =[]
            let likes =0
            for (let i=0;i<commentItems.length;i++){
                if (users.indexOf(commentItems[i].account_id)==-1) {
                    users.push()
                }
                let likeItems = await Like.getRowsCount({target_hash: commentItems[i]['target_hash'], like_flag: false});
                likes=likes+likeItems
            }

            let S =likeCount+2*users.length+0.1*commentCount+0.05*likes
            let T = Math.pow(Math.E, (1))

            let score = S/T

            await Post.updateRow({target_hash: posts[i]['target_hash']}, {score: score})
        }
    });

    schedule.scheduleJob('30 * * * * *', async function (ctx) {

        let Like = model["like"]
        let Comment = model["comment"]
        let comments = await Comment.getRows({})
        for (let i = 0; i < comments.length; i++) {
            let likeCount = await Like.getRowsCount({target_hash: comments[i]['target_hash'], like_flag: false});
            let commentCount = await Comment.getRowsCount({post_id: comments[i]['target_hash']});
            let commentItems = await Comment.getRows({post_id: comments[i]['target_hash']});
            let users =[]
            let likes =0
            for (let i=0;i<commentItems.length;i++){
                if (users.indexOf(commentItems[i].account_id)==-1) {
                    users.push()
                }
                let likeItems = await Like.getRowsCount({target_hash: commentItems[i]['target_hash'], like_flag: false});
                likes=likes+likeItems
            }

            let S =likeCount+2*users.length+0.1*commentCount+0.05*likes
            let T = Math.pow(Math.E, (1))
            let score = S/T
            await Comment.updateRow({target_hash: comments[i]['target_hash']}, {score: score})
        }
    });

    schedule.scheduleJob('40 * * * * *', async function (ctx) {

        let Communities = model["communities"]
        let Join = model["join"]
        let rows =await  Communities.getRows({})
        for (let i =0 ;i<rows.length;i++){
            let members = await Join.getRowsCount({community_id: rows[i].community_id, join_flag: false});
            await  Communities.updateRow({community_id: rows[i].community_id}, {score: members})
        }
    });

}
