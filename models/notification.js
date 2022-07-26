let schema = require('./base/model')({
    account_id: {type: String, default: ''},
    target_hash: {type: String, default: ''},
    account_id_passive: {type: String, default: ''},
    comment_id: {type: String, default: ''},
    method_name: {type: String, default: ''},
    operation: {type: Boolean, default: false},
    type: {type: String, default: ''},
    comment: {type: {}, default: {}},
    post: {type: {}, default: {}},
    options: {type: [], default: []},
    comment_content: {type: {}, default: {}},
    data: {type: {}, default: {}},
    create_at: {type: Number, default: 0},
    async_time: {type: Date, default: Date.now}
}, "notifications");

schema.index({account_id: 1})

module.exports = schema
