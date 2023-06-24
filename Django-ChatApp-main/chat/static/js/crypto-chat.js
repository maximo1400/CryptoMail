// Variables passed through template

function encript(message, key) {

  var encrypted = CryptoJS.AES.encrypt(message, key).toString();
  var sign = CryptoJS.HmacSHA256(encrypted, key).toString();
  return {
    'cipher' : encrypted,
    'sign': sign,
  }
}

function decript(cipher, key) {
  var expectedSign = CryptoJS.HmacSHA256(cipher.cipher, key).toString();

  if (expectedSign == cipher.sign){
    var decrypted = CryptoJS.AES.decrypt(cipher.cipher, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  return ''

}
function decryptDiv(event) {
  var mensajeElement = event.target.parentNode.parentNode.querySelector('.message-content p');
  var signatureElement = event.target.parentNode.parentNode.querySelector('.message-content small[style="font-size: 9px;"]');

  var keyInput = document.getElementById('keyInput');
  const key = keyInput.value.trim();
  const mensaje = mensajeElement.textContent;
  const sign = signatureElement.textContent;

  

  if (key == "") {
    alert("Inserta la key");
    return
  }
  var mensajeFirmado = {
    "cipher": mensaje,
    "sign" : sign,
  }
  var dMsg = decript(mensajeFirmado, key);

  if (dMsg == '') {
    alert("key invalida");
    return
  }
  mensajeElement.textContent = dMsg

}


function gen_key() {
  var EC = elliptic.ec;
  var ec = new EC('curve25519');

  var my_key = ec.genKeyPair();
  var pub_key = my_key.getPublic('hex');
  return {
    'priv_key': my_key.getPrivate('hex'),
    'pub_key': pub_key,
  }
}

function gen_shared_key(pub_key, priv_key) {
  var EC = elliptic.ec;
  var ec = new EC('curve25519');

  var sk = ec.keyFromPrivate(priv_key, 'hex');
  var pk = ec.keyFromPublic(pub_key, 'hex').getPublic();

  var shared_key = sk.derive(pk);
  return shared_key.toString(16);

}

// function test_ecdh() {
//   console.log("Testing ECDH")
//   key1 = gen_key();
//   key2 = gen_key();
//   console.log("key generated");
//   shared1 = gen_shared_key(key1.pub_key, key2.priv_key);
//   shared2 = gen_shared_key(key2.pub_key, key1.priv_key);

//   console.log(key1);
//   console.log(key2);
//   console.log(shared2);

//   return shared1 == shared2;
// }