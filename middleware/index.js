var Archiver = require("../models/archiver");
var Transaction = require("../models/transaction");
var Blacklist = require("../models/blacklist");
var middlewareObj = {};


// CHECK IF USER IS LOGGED IN
middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in.")
  res.redirect("/login");
}

// CHECK IF DATA IS NOT DUPLICATE
//middlewareObj.isNotDuplicate = function(req, res, next{
//  var id = req.body.id
//})
module.exports = middlewareObj
