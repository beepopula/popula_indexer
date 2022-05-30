let schema = require('./base/model')({
    blockHeight:{type: Number, default: 0},
    methodName:{type: String, default: ''},
    data: {type: {}, default: {}},
    createAt:{type: Number, default: 0},
    asyncTime: {type: Date, default: Date.now}
}, "logs");

schema.index({createAt: 1})
module.exports = schema
