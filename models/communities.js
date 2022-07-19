let schema = require('./base/model')({
    predecessor_id: {type: String, default: ''},
    communityId :{type: String, default: ''},
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
    receiptId: {type: String, default: ''},
    accountId: {type: String, default: ''},
    by_owner: {type: String, default: ''},
    data: {type: {}, default: {}},
    method: {type: {}, default: {}},
    deleted: {type: Boolean, default: false},
    score: {type: Number, default: 0},
    createAt: {type: Number, default: 0},
    asyncTime: {type: Date, default: Date.now}
}, "communities");

schema.index({communityId: 1})
schema.index({accountId: 1})

module.exports = schema
