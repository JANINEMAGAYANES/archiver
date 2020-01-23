var mongoose = require("mongoose");

//USER MODEL
var archiverSchema = new mongoose.Schema({
    Timestamp: String,
    name: String,
    email: String,
    ethadd: String,
    arwallet: String,
    description: String,
    referral: String,
    refadd: String,
    pmtmode: String,
    notes: String,
    discordun: String,
    balance: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"

        },
        username: String,
    },

});
module.exports = mongoose.model("Archiver", archiverSchema);