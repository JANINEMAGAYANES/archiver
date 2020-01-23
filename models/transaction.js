var mongoose = require("mongoose");

// TRANSASCTION MODEL
var transactionSchema = mongoose.Schema({
    username: String,
    name: String,
    round: String,
    category: String,
    report: { type: Date, default: Date.now },
    id: { type: String, unique: true },
    url: String,
    nominated: String,
    domain: String,
    whitelisted: String,
    initial: String,
    final: String,
    point: Number, 
    email: String,
    remarks: String,
    reviewer: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        username: String,
    }
});

module.exports = mongoose.model("Transaction", transactionSchema);