let schema = require('./base/model')({
    predecessor_id: {type: String, default: ''},
    target_hash: {type: String, default: ''},
    likeFlag: {type: Boolean, default: false},
    hierarchies: {type: [], default: []},
    receiptId: {type: String, default: ''},
    accountId: {type: String, default: ''},
    receiverId: {type: String, default: ''},
    data: {type: {}, default: {}},
    method: {type: {}, default: {}},
    createAt: {type: Number, default: 0},
    asyncTime: {type: Date, default: Date.now}
}, "likes");

schema.index({target_hash: 1})
schema.index({accountId: 1})
schema.index({likeFlag: 1})

module.exports = schema
