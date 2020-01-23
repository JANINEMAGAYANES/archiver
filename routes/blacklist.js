var express = require("express");
var router  = express.Router();
var Duplicate = require("../models/duplicate");
var Link = require("../models/link");
var middleware = require("../middleware");

//INDEX - SHOW ALL
router.get("/", function(req, res){
    var noLink = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // GET ALL FROM DB
        Link.find({invalidurl: regex}, function(err, allLinks){
           if(err){
               console.log(err);
           } else {
              if(allLinks.length < 1) {
                  noLink= "Nothing matches that query, please try again.";
              }
              res.render("link",{links:allLinks, noLink: noLink});
           }
        });
    } else {
        // GET ALL FROM DB
        Link.find({}, function(err, allLinks){
           if(err){
               console.log(err);
           } else {
              res.render("link",{links:allLinks, noLink: noLink});
           }
        });
    }
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;