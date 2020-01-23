var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Archiver= require("../models/archiver");
var Duplicate = require("../models/duplicate");
var Blacklist = require("../models/blacklist");
var Whitelist = require("../models/whitelist");
var Transaction = require("../models/transaction");
var middleware = require("../middleware");
var Arweave = require('arweave/node');
var b64UrlToString = require('arweave/node/lib/utils').b64UrlToString;


//INDEX - MAIN PAGE TO NAVIGATE COMPUTATIONS
router.get("/", function (req, res) {
    Transaction.find({}, function (err, transaction) {
        res.render("./computation/index");
    });
});

// NEW - VERIFY THE POINTS FOR EACH TRANSACTION
router.get("/round/", function (req, res) {
    round = req.query.round
    console.log(round)
    Transaction.find({round: round}, function (err, transaction) {
        console.log(transaction)
        Blacklist.find({}, function(err, blacklists){
            myblacklist = []
            blacklists.forEach(function(blacklist){
                myblacklist.push(blacklist.invalidurl)
             })
            Whitelist.find({}, function(err, whitelists){
                whitelist = []
                whitelists.forEach(function(white){
                    whitelist.push(white.validurl)
                })
                
                res.render("./computation/new",{ transaction: transaction, blacklist: myblacklist, whitelist: whitelist, round: req.params.round, name: "All" });
            })
        })
    });
});

//EDIT - EDIT TRANSACTION DETAILS
router.get("/:id/edit", middleware.isLoggedIn, function(req, res){
    Transaction.findById(req.params.id, function(err, foundTransaction){
        if (err) {
            res.redirect("back");
        } else {
          console.log(foundTransaction)
            res.render("./computation/edit", {transaction : foundTransaction});
        }
    }); 
  });

  //EDIT - SAVE EDIT ON ARCHIVER DETAILS
router.put("/:transaction_id", middleware.isLoggedIn, function(req, res){
    var round = req.body.transaction.round
    Transaction.findByIdAndUpdate(req.params.transaction_id, req.body.transaction, function(err, transaction){
        if(err) {
            res.redirect("back");
        } else {
            req.flash("success", "Successfully Updated!");
            res.redirect("/computation/admin/arweave/final/?round="+ round);
        }
    });
});   


//SHOW - FINAL COMPUTATIONS
router.get("/final/", function (req, res) {
    var round = req.query.round
    Transaction.find({round: round}, function (err, transactions) {
        res.render("./computation/show", {transactions:transactions, round:round});
    });
});


//EDIT - EDIT COMPUTATION FOR EACH TRANSACTION
// router.get("/round/:id/edit", function (req, res) {
//     Transaction.findById(req.params.id, function (err, transaction) {
//             Blacklist.find({}, function(err, blacklists){
//                 myblacklist = []
//                 blacklists.forEach(function(blacklist){
//                     myblacklist.push(blacklist.invalidurl)
//                 })
//                 Whitelist.find({}, function(err, whitelists){
//                     whitelist = []
//                     whitelists.forEach(function(white){
//                         whitelist.push(white.validurl)
//                     })
//                     res.render("./computation/edit", { transaction: transaction, blacklist: myblacklist, whitelist: whitelist });
//                 })
//     });
// });
// });

function paginatedResults(model) {
    return async (req, res, next) => {
      const page = parseInt(req.query.page)
      const limit = parseInt(req.query.limit)
  
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
  
      const results = {}
  
      if (endIndex < await model.countDocuments().exec()) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }
      try {
        results.results = await model.find().limit(limit).skip(startIndex).exec()
        res.paginatedResults = results
        next()
      } catch (e) {
        res.status(500).json({ message: e.message })
      }
    }
  }

module.exports = router;