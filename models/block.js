let schema = require('./base/model')({
    name: {type : String, default : ''},
    final_block_height: {type : Number, default : 0},
    block_height: {type : Number, default : 0},
    counter: {type : Number, default : 0},
    async_flag: { type : Boolean, default : false},
    debug: { type : Boolean, default : false},
    createAt: {type: Date, default: Date.now}
}, "blocks");

schema.index({createAt: 1})

module.exports = schema
