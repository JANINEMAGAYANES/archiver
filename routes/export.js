var express = require("express");
var router = express.Router();
var Archiver = require("../models/archiver");
var User = require("../models/user");
var Transaction = require("../models/transaction");
var Duplicate = require("../models/duplicate");
var Blacklist = require("../models/blacklist");
var middleware = require("../middleware");
var Arweave = require('arweave/node');
var b64UrlToString = require('arweave/node/lib/utils').b64UrlToString;

//EXPORT CSV / JSON FILE FROM TABLE
router.get("/", middleware.isLoggedIn, function (req, res) {
    Transaction.find({}, function(err, transactions){
        if(err){
            console.log(err)
        } else {
            res.render("export/index", {transactions: transactions });
        }
    })
    
  });

  module.exports = router;