let schema = require('./base/model')({
    community_id: {type: String, default: ''},
    account_id: {type: String, default: ''},
    join_flag: {type: Boolean, default: false},
    data: {type: {}, default: {}},
    create_at: {type: Number, default: 0},
    weight: {type: Number, default: 0},
    creator: {type: Number, default: 0},
    method_name:{type: String, default: ''},
    async_time: {type: Date, default: Date.now}
}, "join");

schema.index({account_id: 1})
schema.index({community_id: 1})
schema.index({join_flag: 1})
module.exports = schema
