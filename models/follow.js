let schema = require('./base/model')({
    predecessor_id: {type: String, default: ''},
    accountId: {type: String, default: ''},
    account_id: {type: String, default: ''},
    followFlag: {type: Boolean, default: false},
    receiptId: {type: String, default: ''},
    receiverId: {type: String, default: ''},
    data: {type: {}, default: {}},
    gas_used: {type: {}, default: {}},
    createAt: {type: Number, default: 0},
    asyncTime: {type: Date, default: Date.now}
}, "follows");

schema.index({account_id: 1})
schema.index({followFlag: 1})

module.exports = schema
