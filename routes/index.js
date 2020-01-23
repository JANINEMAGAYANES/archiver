var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Archiver= require("../models/archiver");
var Duplicate = require("../models/duplicate");
var Blacklist = require("../models/blacklist");


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
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username, 
        name: req.body.name,
        email: req.body.email, 
        ethadd: req.body.ethadd, 
        arwallet: req.body.arwallet, 
        description: req.body.description, 
        referral: req.body.referral, 
        refadd: req.body.refadd, 
        pmtmode: req.body.pmtmode, 
        notes:req.body.notes, 
        discordun: req.body.discordun, 
        balance: req.body.balance, 
        author: req.body.author });

    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("register");      
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Arweave " + user.username + "!");
            res.redirect("/profile"); 
        });
    });
});

//SHOW LOGIN FORM
router.get("/login", function(req, res){
    res.render("login"); 
});

//HANDLE LOGIC
router.post("/login", passport.authenticate("local", 
{
    successRedirect: "/profile",
    failureRedirect: "/login"
}), function(req, res){
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