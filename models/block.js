let schema = require('./base/model')({
    name: {type : String, default : ''},
    finalBlockHeight: {type : Number, default : 0},
    blockHeight: {type : Number, default : 0},
    counter: {type : Number, default : 0},
    asyncFlag: { type : Boolean, default : false},
    debug: { type : Boolean, default : false},
    createAt: {type: Date, default: Date.now}
}, "blocks");

schema.index({createAt: 1})

module.exports = schema
