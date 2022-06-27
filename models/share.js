let schema = require('./base/model')({
    account_id: {type: String, default: ''},
    predecessor_id: {type: String, default: ''},
    target_hash: {type: String, default: ''},
    hierarchies: {type: [], default: []},
    receiptId: {type: String, default: ''},
    accountId: {type: String, default: ''},
    options: {type: String, default: ''},
    receiverId: {type: String, default: ''},
    data: {type: {}, default: {}},
    method: {type: {}, default: {}},
    asyncTime: {type: Date, default: Date.now},
  createAt: {type: Number, default: Date.now},
}, "share");

schema.index({target_hash: 1})

module.exports = schema
