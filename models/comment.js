let schema = require('./base/model')({
    predecessor_id: {type: String, default: ''},
    text: {type: String, default: ''},
    imgs: {type: [], default: []},
    options: {type: [], default: []},
    video: {type: String, default: ''},
    audio: {type: String, default: ''},
    target_hash: {type: String, default: ''},
    hierarchies: {type: [], default: []},
    post_id: {type: String, default: ''},
    comment_post_id: {type: String, default: ''},
    encrypt_args: {type: String, default: ''},
    access: {type: {}, default: {}},
    text_sign: {type: String, default: ''},
    contract_id_sign: {type: String, default: ''},
    transaction_hash: {type: String, default: ''},
    gas_used: {type: {}, default: {}},
    account_id: {type: String, default: ''},
    receipt_id: {type: String, default: ''},
    receiver_id: {type: String, default: ''},
    type: {type: String, default: ''},
    data: {type: {}, default: {}},
    method: {type: {}, default: {}},
    deleted: {type: Boolean, default: false},
    score: {type: Number, default: 0},
    create_at: {type: Number, default: 0},
    async_time: {type: Date, default: Date.now}
}, "comments");

schema.index({post_id: 1})
schema.index({target_hash: 1})
schema.index({account_id: 1})
module.exports = schema
