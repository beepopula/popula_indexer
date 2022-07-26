let schema = require('./base/model')({
    account_id: {type: String, default: ''},
    predecessor_id: {type: String, default: ''},
    target_hash: {type: String, default: ''},
    hierarchies: {type: [], default: []},
    receipt_id: {type: String, default: ''},
    account_id_passive: {type: String, default: ''},
    options: {type: String, default: ''},
    receiver_id: {type: String, default: ''},
    data: {type: {}, default: {}},
    method_name: {type: String, default: ''},
    async_time: {type: Date, default: Date.now},
    create_at: {type: Number, default: Date.now},
}, "share");
schema.index({target_hash: 1})
module.exports = schema
