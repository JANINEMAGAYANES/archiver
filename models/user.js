var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose")

// LOG IN USER MODEL
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    ethadd: String,
    arwallet: String,
    description: String,
    referral: String,
    referrer: String,
    refadd: String,
    pmtmode: String,
    notes: String,
    discordun: String,
    balance: String,
    status: String,
    round: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"

        },
        username: String,
    },

});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);