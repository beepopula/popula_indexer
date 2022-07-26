let schema = require('./base/model')({
    name: {type : String, default : ''},
    final_block_height: {type : Number, default : 0},
    block_height: {type : Number, default : 0},
    counter: {type : Number, default : 0},
    async_flag: { type : Boolean, default : false},
    debug: { type : Boolean, default : false},
    create_at: {type: Date, default: Date.now}
}, "blocks");

schema.index({create_at: 1})
module.exports = schema
