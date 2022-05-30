let schema = require('./base/model')({
  name: {type: String, default: ''},
  account_id: {type: String, default: ''},
  imgs: {type: [], default: []},
  public_key: {type: String, default: ''},
  avatar: {type: String, default: ''},
  bio: {type: String, default: ''},
  background: {type: String, default: ''},
  email: {type: String, default: ''},
  token_id: {type: {}, default: {}},
  data: {type: {}, default: {}},
  methodName: {type: String, default: String},
  type: {type: String, default: ''},
  gas_used: {type: String, default: String},
  createAt: {type: Number, default: 0},
  asyncTime: {type: Date, default: Date.now}
}, "users");

schema.index({account_id: 1})

module.exports = schema
