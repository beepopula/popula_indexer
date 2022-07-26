let schema = require('./base/model')({
    predecessor_id: {type: String, default: ''},
    account_id: {type: String, default: ''},
    account_id_passive: {type: String, default: ''},
    follow_flag: {type: Boolean, default: false},
    receipt_id: {type: String, default: ''},
    receiver_id: {type: String, default: ''},
    data: {type: {}, default: {}},
    gas_used: {type: {}, default: {}},
    create_at: {type: Number, default: 0},
    async_time: {type: Date, default: Date.now}
}, "follows");

schema.index({account_id: 1})
schema.index({follow_flag: 1})

module.exports = schema
