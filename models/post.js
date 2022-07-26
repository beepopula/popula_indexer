let schema = require('./base/model')({
    account_id: {type: String, default: ''},
    predecessor_id: {type: String, default: ''},
    token_series_id: {type: String, default: ''},
    text: {type: String, default: ''},
    imgs: {type: [], default: []},
    options: {type: [], default: []},
    hierarchies: {type: [], default: []},
    video: {type: String, default: ''},
    audio: {type: String, default: ''},
    encrypt_args: {type: String, default: ''},
    access: {type: {}, default: {}},
    text_sign: {type: String, default: ''},
    contract_id_sign: {type: String, default: ''},
    transaction_hash: {type: String, default: ''},
    score: {type: Number, default: 0},
    blur_imgs: {type: {}, default: {}},
    target_hash: {type: String, default: ''},
    receipt_id: {type: String, default: ''},
    receiver_id: {type: String, default: ''},
    data: {type: {}, default: {}},
    token_metadata: {type: {}, default: {}},
    method_name: {type: String, default: String},
    type: {type: String, default: ''},
    gas_used: {type: String, default: String},
    deleted: {type: Boolean, default: false},
    create_at: {type: Number, default: 0},
    async_time: {type: Date, default: Date.now}
}, "posts");

schema.index({account_id: 1})
schema.index({target_hash: 1})

module.exports = schema
