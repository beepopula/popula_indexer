let schema = require('./base/model')({
    accountId: {type: String, default: ''},
    target_hash: {type: String, default: ''},
    account_id: {type: String, default: ''},
    commentId: {type: String, default: ''},
    methodName: {type: String, default: ''},
    operation: {type: Boolean, default: false},
    type: {type: String, default: ''},
    comment: {type: {}, default: {}},
    post: {type: {}, default: {}},
    options: {type: [], default: []},
    commentContent: {type: {}, default: {}},
    data: {type: {}, default: {}},
    createAt: {type: Number, default: 0},
    asyncTime: {type: Date, default: Date.now}
}, "notifications");

schema.index({account_id: 1})

module.exports = schema
