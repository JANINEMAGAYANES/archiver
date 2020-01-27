
var Arweave = require('arweave/node');

var arweave = Arweave.init({ host: 'arweave.net', port: 443, https: true })


// Given a public_key ( `wallet.n` ) and a signature, 
// verify the signature is the result of signing the 
// public wallet address with the private key of the same wallet. 

async function verifyArWalletSignature({ public_key, signature }) {
  
  var arwallet = await arweave.wallets.ownerToAddress(public_key);

  // Decode the wallet into bytes ()

  var arwalletAsBytes = arweave.utils.b64UrlToBuffer(arwallet);
  
  // Decode the signature into bytes. 
  var signatureAsBytes = arweave.utils.b64UrlToBuffer(signature);
 
  var verified = await arweave.crypto.verify(public_key, arwalletAsBytes, signatureAsBytes);

  if (verified) {
    return { verified, arwallet }
  } else {
    return { verified }
  }
}



// This function should be run client side, and sent up to the server.
// It will return an object like { public_key, signature } 
// that can be passed to verifyArWalletSignature 
async function generateArWalletSignature(wallet) {
  var arwallet = await arweave.wallets.jwkToAddress(wallet);

  // Decode the wallet into bytes ()

  var arwalletAsBytes = arweave.utils.b64UrlToBuffer(arwallet);
  
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
