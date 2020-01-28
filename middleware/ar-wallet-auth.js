
var Arweave = require('arweave/node');

var arweave = Arweave.init({ host: 'arweave.net', port: 443, https: true })


// Given a public_key ( `wallet.n` ) and a signature, 
// verify the signature is the result of signing the 
// public wallet address with the private key of the same wallet. 

async function verifyArWalletSignature({ public_key, signature }) {
  
  var arwallet = await arweave.wallets.ownerToAddress(public_key);

  // Convert the wallet string to bytes, so its the same thing the 
  // user signed and we can verify if.
  var arwalletAsBytes = arweave.utils.stringToBuffer(arwallet);
  
  // Decode the signature from base64url into bytes. 
  var signatureAsBytes = arweave.utils.b64UrlToBuffer(signature);
 
  var result = await arweave.crypto.verify(public_key, arwalletAsBytes, signatureAsBytes);

  if (result) {
    return { verified: result, arwallet: arwallet }
  } else {
    return { verified: result }
  }
}



// This function should be run client side, and sent up to the server.
// It will return an object like { public_key, signature } 
// that can be passed to verifyArWalletSignature 

// what we sign doesn't really matter actually, we use the public wallet address
// but it could just be any string like '12345', we need to convert it to bytes 
// to sign it.

async function generateArWalletSignature(wallet) {

  var arwallet = await arweave.wallets.jwkToAddress(wallet);

  // Convert the wallet address string into bytes so we can sign it. 

  var arwalletAsBytes = arweave.utils.stringToBuffer(arwallet);
  
  // Signature is always returned as bytes, we encode it a base64url string 
  // afterwards so we can transfer to server as JSON easily. 
  var signatureAsBytes = await arweave.crypto.sign(wallet, arwalletAsBytes);
  
  var signature = arweave.utils.bufferTob64Url(signatureAsBytes);

  return { public_key: wallet.n, signature };
}


module.exports = { generateArWalletSignature, verifyArWalletSignature }

// This is just a test routine, only runs if your do `node ar-wallet-auth.js`
if (typeof require !== 'undefined' && require.main === module) {
  test();
}

async function test() {
  var walletA = await arweave.wallets.generate();
  var walletB = await arweave.wallets.generate();

  var login = await generateArWalletSignature(walletA);

  var resultA = await verifyArWalletSignature(login);
  console.log(`Generated a login for wallet ${await arweave.wallets.jwkToAddress(walletA)}`);
  console.log(`Verification Result:`);
  console.log(resultA);

  // Try use an invalid login with the wrong wallet public_key that doesn't match the signature 
  login.public_key = walletB.n; 
  var resultB = await verifyArWalletSignature(login);
  console.log(`Generated an invalid login for wallet ${await arweave.wallets.jwkToAddress(walletB)}`);
  console.log(`Verification Result:`);
  console.log(resultB);

}
