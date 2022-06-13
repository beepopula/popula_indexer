let schema = require('./base/model')({
    predecessor_id: {type: String, default: ''},
    text: {type: String, default: ''},
    imgs: {type: [], default: []},
    options: {type: [], default: []},
    video: {type: String, default: ''},
    audio: {type: String, default: ''},
    target_hash: {type: String, default: ''},
    hierarchies: {type: [], default: []},
    postId: {type: String, default: ''},
    commentPostId: {type: String, default: ''},
    encrypt_args: {type: String, default: ''},
    access: {type: {}, default: {}},
    text_sign: {type: String, default: ''},
    contract_id_sign: {type: String, default: ''},
    transaction_hash: {type: String, default: ''},
    gas_used: {type: {}, default: {}},
    accountId: {type: String, default: ''},
    receiptId: {type: String, default: ''},
    receiverId: {type: String, default: ''},
    type: {type: String, default: ''},
    data: {type: {}, default: {}},
    method: {type: {}, default: {}},
    deleted: {type: Boolean, default: false},
    score: {type: Number, default: 0},
    createAt: {type: Number, default: 0},
    asyncTime: {type: Date, default: Date.now}
}, "comments");

schema.index({postId: 1})
schema.index({target_hash: 1})
schema.index({accountId: 1})
module.exports = schema
