var mongoose = require("mongoose");
var mongoosastic = require("mongoosastic");
var Schema = mongoose.Schema;

// LOG IN USER MODEL
var BlacklistSchema = new mongoose.Schema({
    invalidurl: String,
});

BlacklistSchema.plugin(mongoosastic, {
    hosts: [
        "localhost:9200"
    ]
});


module.exports = mongoose.model("Blacklist", BlacklistSchema);