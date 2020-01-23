var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Reward    = require("../models/reward");
var middleware = require("../middleware");
var Transaction = require("../models/transaction");

//SHOW PROFILE
router.get("/", middleware.isLoggedIn, function(req, res){
    var user = req.user
    console.log(user)
    Reward.find({name: user.username}, function(req,rewards){
        console.log(rewards)
        res.render("user/index", {user: user, rewards: rewards}); 

 });

 //SHOW USER REWARD
router.get("/:name/summary/:round", middleware.isLoggedIn, function(req, res){
    round = req.params.round
    console.log(round)
    Reward.findOne({name: req.params.name, round: round}, function(err, user){
        console.log(Object.keys(user))
        res.render("user/show", {user: user});
    });
});
 });

 
 
//CREATE - ADD NEW USER
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to documents array
    var name = req.body.name;
    var Timestamp = req.body.Timestamp;
    var email = req.body.email;
    var ethadd= req.body.ethadd;
    var arwallet = req.body.arwallet;
    var description = req.body.description;
    var referral = req.body.referral;
    var refadd = req.body.refadd;
    var pmtmode = req.body.pmtmode;
    var notes = req.body.notes;
    var discordun = req.body.discordun;
    var balance = req.body.balance;
    
    var author = {
        id: req.user._id,
        username: req.user.username,
    }
    var newArchiver= {name: name, Timestamp:Timestamp, email: email, ethadd: ethadd, arwallet: arwallet, description: description, referral: referral, refadd: refadd, pmtmode: pmtmode, notes:notes, discordun: discordun, balance: balance, author: author}
    // CREATE NEW AND SAVE TO DB
    Archiver.create(newArchiver, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            // REDIRECT
            res.redirect("/transaction/new");
        }
    });
});

//SHOW SEARCH USER
router.get("/:name/", function(req, res){
    round = req.query.round
    Reward.findOne({name: req.params.name, round: round}, function(err, reward){
        if(err){
            console.log(err);
        } else {
            console.log(req.params.name)
            console.log(round)
            Transaction.find({name: req.params.name, round: round}, function(err, transaction){
                console.log(reward.round)
                res.render("round/index", {reward: reward, name: req.params.name, round: req.query.round, transaction: transaction});
       
        })
    }
    })
});

// SHOW ALL USERS TRANSACTION
router.get("/transactions/:name/", function(req, res){
    round = req.query.round
    Transaction.find({name: req.params.name, round: round}, function(err, transactions){
        if(err){
            console.log(err);
        } else {
                res.render("round/transaction", {transactions: transactions});
    }
    })
});


module.exports = router;