// Variables passed through template

function encript(message, key) {

  var encrypted = CryptoJS.AES.encrypt(message, key);
  return encrypted.toString();
}

function decript(message, key) {
  var decrypted = CryptoJS.AES.decrypt(message, key);
  return decrypted.toString(CryptoJS.enc.Utf8);

}
function decryptDiv(event) {
  var mensajeElement = event.target.parentNode.parentNode.querySelector('.message-content p');
  var keyInput = document.getElementById('keyInput');
  const key = keyInput.value.trim();
  const mensaje = mensajeElement.textContent;

  if (key == "") {
    alert("Inserta la key");
    return
  }

  var dMsg = decript(mensaje, key);

  if (dMsg == '') {
    alert("key invalida");
    return
  }
  mensajeElement.textContent = dMsg

}


function gen_key() {
  var EC = elliptic.ec;
  var ec = new EC('curve25519');

  var priv_key = ec.genKeyPair();
  var pub_key = priv_key.getPublic();
  return {
    'priv_key': priv_key,
    'pub_key': pub_key.toString(16),
  }
}

function gen_shared_key(pub_key, priv_key) {
  var EC = elliptic.ec;
  var ec = new EC('curve25519');

  var shared_key = priv_key.derive(pub_key);

  // var pk = ec.


  // console.log(priv_key_class)
  // var shared = priv_key_class.derive(pub_key);
  return shared.toString(16);
}

function test_ecdh() {
  console.log("Testing ECDH")
  key1 = gen_key();
  key2 = gen_key();
  console.log("key generated");
  shared1 = gen_shared_key(key1.pub_key, key2.priv_key);
  shared2 = gen_shared_key(key2.pub_key, key1.priv_key);

  console.log(key1);
  console.log(key2);
  console.log(shared2);

  return shared1 == shared2;
}