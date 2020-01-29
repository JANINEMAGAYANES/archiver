var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Archiver= require("../models/archiver");
var Duplicate = require("../models/duplicate");
var Blacklist = require("../models/blacklist");

var verifyArWalletSignature = require('../middleware/ar-wallet-auth').verifyArWalletSignature

//ROOT ROUTE
router.get("/", function(req, res){
    // if(req.query.search){
    //     Duplicate.findOne({duplicateurl: req.query.search}, function(err, duplicate){
    //         if(duplicate){
    //         res.render("landing", {duplicate: duplicate, message: "That link has been uploaded before"});    
    //         } else {
    //             try {
    //                 const url = new URL(req.query.search);
    //                 const domain = url.hostname.startsWith('www.') ? url.hostname.substring(4) : url.hostname
    //                 Blacklist.find({invalidurl: domain}, function(err, blacklisted){
    //                     if(err){
    //                         console.log(err);
    //                         res.render("landing")
    //                     } else {
    //                         console.log(blacklisted);  if (blacklisted.length > 0) {
    //                             res.render("landing",{message:"The domain has copyright issues."} )
    //                         } else {
    //                             res.render("landing",{message:"The URL may be valid"} )
    //                         }
    //                     }
    //                 })  
    //             } catch (error) {
    //                 console.log("c");
    //                 res.render("landing", {message: "The URL is not valid."});
    //             }
    //         }
    //     })
    // } else {
    //     console.log("e");
        res.render("landing", {message: ""});
    // }
    
});


// SHOW REGISTRATION FORM
router.get("/register", function(req, res){
    res.render("register"); 
});

//SIGN UP LOGIC
router.post("/register", async function(req, res) {

    var public_key = req.body.public_key;
    var signature = req.body.signature;
    var loginResult = await verifyArWalletSignature({ public_key, signature });
      
    if (!loginResult.verified) {
        // Wallet sig verification failed, set error response and finish.
        req.flash("error", 'Invalid wallet');
        return res.render("register");
    }

    // Check for existence of a user with that username already. 
    let findExistingUserName = await User.find({ username: req.body.username }).exec();
    if (findExistingUserName.length > 0) {
        // Already exists, set error response and finish
        req.flash("error", 'Username already exists');
        return res.render("register");   
    }

    // Check for existence of a user with that wallet already. 
    let findExistingWallet = await User.find({ arwallet: loginResult.arwallet }).exec();
    if (findExistingWallet.length > 0) {
        // Already exists, set error response and finish
        req.flash("error", 'Wallet already exists');
        return res.render("register");
    }

    var newUser = new User({username: req.body.username, 
        name: req.body.name,
        email: req.body.email, 
        ethadd: req.body.ethadd, 
        arwallet: loginResult.arwallet, 
        description: req.body.description, 
        referral: req.body.referral, 
        refadd: req.body.refadd,
        pmtmode: req.body.pmtmode, 
        notes:req.body.notes,
        discordun: req.body.discordun, 
        balance: req.body.balance, 
        author: req.body.author });

    const saveUserResult = await newUser.save();
    console.log(`Saved new user, username: ${saveUserResult.username}, address: ${saveUserResult.arwallet}`);
    
    passport.authenticate('ar-custom')(req, res, function(){
        console.log('AUTHENTICATED');
        req.flash("success", `Welcome to Arweave ${newUser.username} (${newUser.arwallet}) !`);
        res.redirect("/profile"); 
        return;
    })
    
});

//SHOW LOGIN FORM
router.get("/login", function(req, res){
    res.render("login"); 
});

//HANDLE LOGIC
router.post("/login", passport.authenticate("ar-custom", 
{
    successRedirect: "/profile",
    failureRedirect: "/login"
}), function(req, res) {
});

// LOG OUT ROUTE
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out.");
    return res.redirect("/");
});
// REGEX FUNCTION
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//MIDDLE WARE
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}



module.exports = router;