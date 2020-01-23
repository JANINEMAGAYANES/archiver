var express = require("express");
var router  = express.Router();
var Archiver = require("../models/archiver");
var User = require("../models/user");
var Transaction = require("../models/transaction");
var Duplicate = require("../models/duplicate");
var Link = require("../models/link");
var middleware = require("../middleware");
var Arweave = require('arweave/node');
var b64UrlToString = require('arweave/node/lib/utils').b64UrlToString;

var instance = Arweave.init({
    host: 'arweave.net',
    port: 443,
    logging: true,
    protocol: 'https'
});

router.get("/", middleware.isLoggedIn, function(req, res){
    res.render("transaction/show", {username : req.user.username, message: ""}); 
 });

router.get("/:name/:category", function(req, res){
            res.render("transaction/new", {username : req.user.username, email: req.user.email, category: req.params.category}); 
 });

 router.post("/", async function(req, res){
    // Get data from form and add to documents array
      var name = req.body.name;
      var email= req.body.email;
      var round= req.body.round;
      var category = req.body.category;
      var nominated= req.body.nominated;
      var whitelisted = req.body.whitelisted;
      var author = {
        id: req.user._id,
      username: req.user.username,
    };
    
      var transaction = await instance.transactions.get(req.body.id); 
      var tags = formatTags(transaction.tags);
      var blockHash = (await instance.api.get(`tx/${req.body.id}/status`)).data.block_indep_hash
      var block = (await instance.api.get(`block/hash/${blockHash}`)).data
      var timestamp = block.timestamp
      var url = new URL(tags['page:url'][0]);
      var link = url.href
      var domain = url.hostname

        Duplicate.find({duplicateurl: link}, function(err, duplicate){
          console.log(duplicate)
          if(duplicate.length > 0){
            req.flash("warning", "This link has been uploaded before")
            res.redirect("/transaction/"+name+"/"+category);    
            } else {
                var url = new URL(link)
                console.log(url)
                var domain = url.hostname
                console.log(domain)
                Link.find({invalidurl: domain}, function(err, blacklisted){
                  if(err){
                    console.log(err);
                    res.redirect("/transaction/"+name+"/"+category); 
                } else {
                    if (blacklisted.length > 0) {
                    req.flash("warning", "This domain has copyright issues.") 
                    res.redirect("/transaction/"+name+"/"+category)
                  }    else {

                    var id = transaction.id;
                    var url = new URL(tags['page:url'][0]);
                    var link = url.href
                    var name = req.body.name;
                    var round= req.body.round;
                    var email = req.body.email;
                    var category = req.body.category;
                    var nominated= req.body.nominated;
                    var whitelisted = req.body.whitelisted;
                    var remarks = req.body.remarks;
                    var author = {
                    id: req.user._id,
                    username: req.user.username,
                    };
                    var newTransaction = {name: name,round:round, email: email, category: category, id:id, nominated:nominated, url: link, 
                    domain: domain, whitelisted:whitelisted, remarks: remarks}
                    console.log(newTransaction)

                      Transaction.create(newTransaction, function(err, newlyCreated){
                             if(err){
                               console.log(err);
                               req.flash("warning", "Please enter a valid transaction.") 
                             } else {
                              req.flash("warning", "The entry has been successfully submitted.") 
                               res.redirect("/transaction/"+name+"/"+category);
                             }
                            }) 
                  }
                }
              })
            } 
           });       
          });
        

function formatTags(tags) {
    return tags.reduce(
      (tags, current) => {
        try {
          const decodedKey = b64UrlToString(current.name);
          const decodedValue = b64UrlToString(current.value);
          if (typeof decodedKey == 'string' && typeof decodedValue == 'string') {
            if (tags.hasOwnProperty(decodedKey)) {
              tags[decodedKey].push(decodedValue);
            } else {
              tags[decodedKey] = [decodedValue];
            }
          }
        } catch (error) {
          return tags;
        }
        return tags;
      },
      {}
    );
  }
  
  

  
  

module.exports = router;
