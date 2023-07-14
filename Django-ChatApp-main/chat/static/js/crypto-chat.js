// Variables passed through template


/*
  encript:
    message (str)
    key (str)
  
    return object

  Encripta y autentica un mensaje dada una key. Utiliza para encriptar AES-256
  y para la autenticación utiliza SHA256.9px

  Retorna como resultado un objeto de js con el cifrado y mac
*/
function encript(message, keyC, keyM) {
  var encrypted = CryptoJS.AES.encrypt(message, keyC).toString();
  var mac = CryptoJS.HmacSHA256(encrypted, keyM).toString();
  return {
    'cipher' : encrypted,
    'mac': mac,
  }
}

/*
decript:
  cipher (str)
  key (str)

  return str

Recibe un objeto de js que contiente un bloque cifrado y un MAC, y lo desencripta dada una key.
En caso de no ser la key correcta, retorna un mensaje vacio.
*/
function decript(cipher, keyC, keyM) {
  var expectedMac = CryptoJS.HmacSHA256(cipher.cipher, keyM).toString();

  if (expectedMac == cipher.mac){ //Verifica el mensaje
    var decrypted = CryptoJS.AES.decrypt(cipher.cipher, keyC);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  return ''

}

/*
decryptDiv:
  event(event)
  boton(object)

Función que se encarga de modificar un div donde se contiene un mensaje encriptado con su autenticación.
*/
function decryptDiv(event , boton) {
  var mensajeElement = event.target.parentNode.parentNode.querySelector('.message-content p');
  var signatureElement = event.target.parentNode.parentNode.querySelector('.message-content small[style="font-size: 9px;"]');

  var keyCInput = document.getElementById('keyCInput');
  var keyMInput = document.getElementById('keyMInput');
  const keyC = keyCInput.value.trim();
  const keyM = keyMInput.value.trim();
  const mensaje = mensajeElement.textContent;
  const mac = signatureElement.textContent;
  
  if (keyC == "" || keyM == "") {
    alert("Inserta la key");
    return
  }
  var mensajeFirmado = {
    "cipher": mensaje,
    "mac" : mac,
  }
  var dMsg = decript(mensajeFirmado, keyC, keyM);

  if (dMsg == '') {
    alert("key invalida");
    return
  }
  mensajeElement.textContent = dMsg
  boton.style.display = "none"

}

/*
gen_key:
  return object

Genera un par de claves (una publica y privada) utilizando la libreria elliptic
la cual utiliza curvas elipticas.
*/
function gen_key() {
  var EC = elliptic.ec;
  var ec = new EC('curve25519');

  var my_keyC = ec.genKeyPair();
  var pub_keyC = my_keyC.getPublic('hex');

  var my_keyM = ec.genKeyPair();
  var pub_keyM = my_keyM.getPublic('hex');
  return {
    'priv_keyC': my_keyC.getPrivate('hex'),
    'pub_keyC': pub_keyC,
    'priv_keyM': my_keyM.getPrivate('hex'),
    'pub_keyM': pub_keyM,
  }
}

/*
gen_shared_key:
  pub_key (str)
  priv_key (str)

  return str

Genera una clave compartida dada una clave privada y una clave publica compartida
por un externo. Se utiliza la libreria elliptic.
*/
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