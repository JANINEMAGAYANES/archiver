var express = require("express");
var router = express.Router();
var Transaction = require("../models/transaction");
var Blacklist = require("../models/blacklist");
var Duplicate = require("../models/duplicate");
var Whitelist = require("../models/whitelist");
var Reward = require("../models/reward");
var middleware = require("../middleware");
var file = require("file-system");
var fs = require("fs");
var  multer = require("multer");
var xlsx = require("xlsx");

var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads')
    }
})
var upload = multer({
    storage:storage
})

//INDEX - MAIN PAGE TO NAVIGATE COMPUTATIONS
router.get("/", function (req, res) {
  
        res.render("./upload/index");

});

router.post("/reward", upload.single('myFile'),(req,res,next) => {
    const file = req.file;
    if(!file){
        const error = new Error("Please upload a file")
        error.httpStatusCode= 400;
        return next(error);
    
    }
    var wb = xlsx.readFile(req.file.path);
    var ws = wb.Sheets["Sheet 1"];
    var details = xlsx.utils.sheet_to_json(ws);
    details.forEach(function(detail){
       Reward.create(detail, function(err, newlyCreated){
            console.log(newlyCreated)
       })
      
    })
    req.flash("success", "Successfully Uploaded!");
    res.redirect("/upload");
    })

    router.post("/blacklist", upload.single('myFile'),(req,res,next) => {
        const file = req.file;
        if(!file){
            const error = new Error("Please upload a file")
            error.httpStatusCode= 400;
            return next(error);
        
        }
        var wb = xlsx.readFile(req.file.path);
        var ws = wb.Sheets["Sheet 1"];
        var details = xlsx.utils.sheet_to_json(ws);
        details.forEach(function(detail){
           Blacklist.create(detail, function(err, newlyCreated){
                console.log(newlyCreated)
           })
          
        })
        req.flash("success", "Successfully Uploaded!");
        res.redirect("/upload");
        })

        router.post("/whitelist", upload.single('myFile'),(req,res,next) => {
            const file = req.file;
            if(!file){
                const error = new Error("Please upload a file")
                error.httpStatusCode= 400;
                return next(error);
            
            }
            var wb = xlsx.readFile(req.file.path);
            var ws = wb.Sheets["Sheet 1"];
            var details = xlsx.utils.sheet_to_json(ws);
            details.forEach(function(detail){
               Whitelist.create(detail, function(err, newlyCreated){
                    console.log(newlyCreated)
               })
              
            })
            req.flash("success", "Successfully Uploaded!");
            res.redirect("/upload");
            })
  
module.exports = router;