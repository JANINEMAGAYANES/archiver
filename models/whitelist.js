var mongoose = require("mongoose");
var mongoosastic = require("mongoosastic");
var Schema = mongoose.Schema;

// LOG IN USER MODEL
var WhitelistSchema = new mongoose.Schema({
    validurl: String,
});

WhitelistSchema.plugin(mongoosastic, {
    hosts: [
        "localhost:9200"
    ]
});


module.exports = mongoose.model("Whitelist", WhitelistSchema);