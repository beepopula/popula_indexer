let schema = require('./base/model')({
    predecessor_id: {type: String, default: ''},
    target_hash: {type: String, default: ''},
    like_flag: {type: Boolean, default: false},
    hierarchies: {type: [], default: []},
    receipt_id: {type: String, default: ''},
    account_id: {type: String, default: ''},
    options: {type: String, default: ''},
    receiver_id: {type: String, default: ''},
    data: {type: {}, default: {}},
    method_name:{type: String, default: ''},
    create_at: {type: Number, default: 0},
    async_time: {type: Date, default: Date.now}
}, "likes");

schema.index({target_hash: 1})
schema.index({account_id: 1})
schema.index({like_flag: 1})

module.exports = schema
