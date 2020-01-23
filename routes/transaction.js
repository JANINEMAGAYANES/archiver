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

var instance = Arweave.init({
  host: 'arweave.net',
  port: 443,
  logging: true,
  protocol: 'https'
});

// SHOW - SHOW CONFIRMATION AFTER TRANSACTION HAS BEEN UPLOADED
router.get("/", middleware.isLoggedIn, function (req, res) {
  res.render("transaction/show", { username: req.user.username, message: "" });
});

// NEW - UPLOAD TRANSACTIONS
router.get("/:name/:category", function (req, res) {
  res.render("transaction/new", { username: req.user.username, email: req.user.email, category: req.params.category });
});

// NEW - SAVE TRANSACTIONS ON DB
router.post("/", async function (req, res) {
  // Get data from form and add to documents array
  var name = req.body.name;
  var email = req.body.email;
  var round = req.body.round;
  var category = req.body.category;
  var nominated = req.body.nominated;
  var initial = req.body.initial;
  var author = {
    id: req.user._id,
    username: req.user.username,
  };
  var idlist = req.body.id
  var links = []
  var messages = []
  var obj = {"a":"1"}
  idlist.forEach(async function (tx) {
    var transaction = await instance.transactions.get(tx);
    var tags = formatTags(transaction.tags);
    var blockHash = (await instance.api.get(`tx/${req.body.id}/status`)).data.block_indep_hash
    var block = (await instance.api.get(`block/hash/${blockHash}`)).data
    var timestamp = block.timestamp
    var url = new URL(tags['page:url'][0]);
    var link = url.href
    //links.push(link)
    var domain = url.hostname
    Transaction.find({ url: link }, function (err, duplicate) {
      if (duplicate.length > 0) {
        var a = "duplicate"
        obj[link] = a
      } else {
        var url = new URL(link)
        var domain = url.hostname
        Blacklist.find({ invalidurl: domain }, function (err, blacklisted) {
          if (err) {
            console.log(err);
          } else {
            if (blacklisted.length > 0) {
              var b = "blacklisted"
              messages.push(b)
              obj[domain] = b
            } else {
              var id = transaction.id;
              var url = new URL(tags['page:url'][0]);
              var link = url.href
              var name = req.body.name;
              var round = req.body.round;
              var email = req.body.email;
              var category = req.body.category;
              var nominated = req.body.nominated;
              var initial = req.body.initial;
              var remarks = req.body.remarks;
              var author = {
                id: req.user._id,
                username: req.user.username,
              };
              var newTransaction = {
                name: name, round: round, email: email, category: category, id: id, nominated: nominated, url: link,
                domain: domain, initial: initial, remarks: remarks
              }
              Transaction.create(newTransaction, function (err, newlyCreated) {
                if (err) {
                  console.log(err);
                } else {
                  var c = "success"
                  messages.push(c)
                  obj[link] = c
                  
                }
                
              })
         
            }
           
          }
     
        })
      
      }
     
    })

 
  })
  console.log(obj)
  res.render("transaction/show", { obj: obj })
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
