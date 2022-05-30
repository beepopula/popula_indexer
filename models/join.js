let schema = require('./base/model')({
    communityId: {type: String, default: ''},
    accountId: {type: String, default: ''},
    joinFlag: {type: Boolean, default: false},
    data: {type: {}, default: {}},
    createAt: {type: Number, default: 0},
    weight: {type: Number, default: 0},
    creator: {type: Number, default: 0},
    asyncTime: {type: Date, default: Date.now}
}, "join");

schema.index({accountId: 1})
schema.index({communityId: 1})
schema.index({joinFlag: 1})
module.exports = schema
