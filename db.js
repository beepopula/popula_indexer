const config = require("config")
const mongoose = require('mongoose');
const glob = require("glob")
let mongodb_conf = config.get('constants');
console.log(mongodb_conf.MONGO_URL);
mongoose.connect(mongodb_conf.MONGO_URL);
let db = mongoose.connection;

mongoose.Promise = global.Promise;

db.on('error', function(){
    console.log('error');
});
db.on('open', function(){
    console.log('success');
});

let dir = __dirname + '/models';
let schemas = dir + (dir.lastIndexOf('/') === (dir.length - 1) ? '' : '/')
let files = glob.sync(schemas + '/*.js')
let middleware = {}
files.map(file => {
    let path = require('path');
    let model = path.basename(file, '.js').toLowerCase();
    let schema = require(file)
    middleware[model] = mongoose.model(model, schema)
});



const model = {
    ...middleware,
};

module.exports = model;
