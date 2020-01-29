
var User = require('../models/user');
var CustomStrategy = require("passport-custom");

var verifyArWalletSignature = require("./ar-wallet-auth").verifyArWalletSignature;


// This is our custom authentication strategy. 
// It reads public_key and signature from the request body 
// (uploaded with a form usually) and verifies the signature, 
// and then checks that the user exists in the Database.

var authenticateByWallet = new CustomStrategy(
  
  async function(req, done) {
    
    // Inside an async function, we can use try {} catch {} 
    // to catch and handle all errors in one place below.
    
    try {
      
      var public_key = req.body.public_key;
      var signature = req.body.signature;
      
      console.log(`Verifing wallet`); 
     
      const result = await verifyArWalletSignature({ public_key, signature });     
      
      if (!result.verified) {
         // The signature verification failed. Throw an error. 
         throw new Error('Unable to verify wallet');
      }
      
      // Try and find the existing registered user.
      console.log(`Finding user by wallet: ${result.arwallet}`)
      const foundUser = await User.findOne({ arwallet: result.arwallet }).exec();

      if (!foundUser) {
        // The wallet given was valid, but we couldn't find the user the Db, throw an error!
        throw new Error('Unable to find user');
      }
      
      // Nothing went wrong, we found the user in the db, finish with success!
      console.log(foundUser);
      console.log(`Found USER!`);
      done(null, foundUser);

    }
    catch (err) {
      // Catch all errors, either the ones we threw, or any other type of error.
      // Just pass the Error `.message` part not the entire error object.
      done(err.message, null);
    }

  }
);

// These are two very simple helper functions, they will get called 
// by passport. 
//
// When we authenticate the user first, serialize is 
// called and we just give it back a unique identifier that can be 
// used to load the user from the DB. We use '.arwallet' 
//
// Deserialize is called when the user is already authenticated 
// and makes a new request, we get back the 'id' value we gave 
// (which was .arwallet) and use that to lookup and load the 
// full user document from the Db.

function serializeUser(user, done) {
  done(null, user.arwallet); 
}

function deserializeUser(id, done) {
  User.findOne({ arwallet: id }, function(err, user) {
      done(err, user);
  });
}

module.exports = { authenticateByWallet, serializeUser, deserializeUser }