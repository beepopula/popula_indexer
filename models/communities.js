let schema = require('./base/model')({
    predecessor_id: {type: String, default: ''},
    community_id :{type: String, default: ''},
    name: {type: String, default: ''},
    cover: {type: String, default: ''},
    avatar: {type: String, default: ''},
    info: {type: String, default: ''},
    information: {type: String, default: ''},
    governance: {type: String, default: ''},
    website: {type: {}, default: {}},
    twitter: {type: {}, default: {}},
    discord: {type: {}, default: {}},
    contributor: {type: [], default: []},
    community_type: {type: String, default: ''},
    gas_used: {type: String, default: ''},
    receipt_id: {type: String, default: ''},
    account_id: {type: String, default: ''},
    by_owner: {type: String, default: ''},
    set_owner: {type: String, default: ''},
    data: {type: {}, default: {}},
    method: {type: {}, default: {}},
    deleted: {type: Boolean, default: false},
    score: {type: Number, default: 0},
    create_at: {type: Number, default: 0},
    async_time: {type: Date, default: Date.now}
}, "communities");

schema.index({community_id: 1})
schema.index({account_id: 1})

module.exports = schema
