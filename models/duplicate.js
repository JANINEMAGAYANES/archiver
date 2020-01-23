var mongoose = require("mongoose");

// LOG IN USER MODEL
var DuplicateSchema = new mongoose.Schema({
    duplicateurl: String,
});

module.exports = mongoose.model("Duplicate", DuplicateSchema);