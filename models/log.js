let schema = require('./base/model')({
    block_height:{type: Number, default: 0},
    method_name:{type: String, default: ''},
    data: {type: {}, default: {}},
    create_at:{type: Number, default: 0},
    async_time: {type: Date, default: Date.now}
}, "logs");

schema.index({create_at: 1})
module.exports = schema
