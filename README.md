# CryptoMail
CryptoMail es una implementación simple de un servicio de mensajería autenticado y confidencial. La idea de este es que cada usuario registrado pueda recibir mensajes de otros usuarios de forma privada a través de un sistema de encriptación, y que con cada usuario posea una forma de generar una clave de encriptación sin necesidad de enviarla directamente.


## Librerias y Frameworks utilizados.
En Python:
- Django : Para el backend de la página web.
- Channels : Websockets para conexión entre usuários.

En Javascript:
- Crypto.js : Para la encriptación de mensajes.
- Elliptic.js : Para la generación de claves e implementación de ECDH


## Ejecución 

En primer lugar se deben instalar los requerimientos del proyecto con `pip install -Ur requirements.txt`

A continuación es necesario entrar a la carpeta del proyecto de django con el comando `cd Django-ChatApp-main/`

Luego se deben crear las migraciones de los modelos y migrarlos, esto se hace con `python manage.py makemigrations` y luego `python manage.py migrate`.

Para levantar el servidor local se debe correr el comando`python manage.py runserver`

Finalmente la aplicacion correra en `http://127.0.0.1:8000/` donde se necesita crear un usuario para empezar a chatear

Para encriptar y desencriptar mensajes es necesario que los 2 usuarios acuerden una clave, lo cual pueden realizar a través de un intercambio de llaves EECDH, para lo cual es necesario que ambas partes tengan el chat abierto al momento de generar las claves. Esta clave no es guardada, por lo que al salir de la página o al re-cargarla se perderá la clave. 

Si algún usuario quiere des-encriptar mensajes luego de que el navegador olvide la clave, necesitará ingresar en el input de clave, para lo cual se requiere haber guardado de antemano la clave generada.
    

## Intercambio de claves: EECDH:
Para el acuerdo de claves se decidió utilizar Diffie-Hellman, especificamente ECDH con la curva 25519, por medio de la librería [elliptic](https://github.com/indutny/elliptic), la que se encarga de generar un par de claves (una privada y una pública) por cada usuario que desee establecer comunicación (en este caso dos personas). Luego los usuarios involucrados comparten su clave pública entre si y generan una llave final utilizando su clave privada y la clave pública que reciben del usuario con el que se están comunicando, que será la que les permite encriptar sus mensajes por medio de encriptación simétrica. 


## Encriptacion Simetrica: AES-256
Esto por que hace una implementación segura de un bloque de cifrado autenticado utilizando la libreria [crypto-js](https://github.com/brix/crypto-js) con la cual se encriptan los mensajes a enviar, utilizando claves definidas por el usuario, las cuales son convertidas a llaves de 256 bits por la librería, también está agrega un vector de inicialización y un salt al mensaje por lo que 2 mensajes encriptados con la misma clave serán distintos. se utilizaron las configuraciones por defecto para esta librería, lo que significa el uso de AES-CBC y de padding Pkcs7, finalmente este sistema de encriptación sólo retorna texto en caso de desencriptar el mensaje con la llave original, en caso contrario no muestra cambios en pantalla. 

El uso esperado de esta encriptación es la utilización de la llave `final` obtenida por `EECDH` a modo de clave para encriptar y desencriptar mensajes por ambos participantes del chat.

## Autenticación
Se realiza una autenticación de los usuarios que se comunican por medio de CryptoMail. Para ello se usa HMACSHA256 de la librería CryptoJS para hacer el mac utilizado para la autenticación. Se hace una autenticación de la forma Encrypt-then-Mac. 

## Parte visual
La interfaz de `CryptoMail` empezó como [Django-ChatApp](https://github.com/shubham99bisht/Django-ChatApp), una aplicacion de django donde usuarios podrán entrar a canales de chat abiertos en los todos podían escribir. Esto fue modificado para que solo se puedan realizar comunicaciones entre 2 usuarios de acuerdo a lo requerido.

# Analisis

## Mejoras que se podrían implementar
- Reemplazar la encriptación utilizada actualmente, por algún tipo de encriptación simétrica autenticada ya implementado tal como [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode).
- Guardar la clave entre las cookies del navegador mejorará la usabilidad de la página, ya que estas no se verían eliminadas al salir del chat (Pero crearía un vector de ataque).

## Esquema de encriptación autenticada utilizado (Encrypt-then-Mac):
Las razones de por que se utiliza este esquema de encriptación son los siguientes:
- Integridad: Nos asegura que el mensaje sea autentico en función del MAC. Si la clave compartida no se vió comprometida, no hay forma de generar una autenticación de algun mensaje falso dado que el proceso de MAC hace uso de dicha clave.
- Privacidad: Dado a que la autenticación de nuestro mensaje depende del bloque cifrado, el poder recuperar el mensaje con el cual se genera el MAC no provee de ninguna información adicional al adversario. Dicho esto, la privacidad del mensaje solo depende de cuan seguro el nuestro cifrador de bloque.

Suponiendo que nuestro cifrador es IND-CPA y nuestro esquema MAC es SUF-CMA, se nos asegura que la composición Encrypt-then-Mac de estos es IND-CTXT, IND-CPA y IND-CCA. La demostración de esto podemos verla en el siguiente paper: [Authenticated Encryption: Relations among Notions and Analysis of the Generic Composition Paradigm](https://link.springer.com/content/pdf/10.1007/3-540-44448-3_41.pdf)


### Posibles peligros 
- Las librerías fueron seleccionadas debido a su alto número de descargas (+10 millones semanales) por lo que se espera que sea notado de manera expedita cualquier problema de seguridad que pueda surgir, pero esto podría dejar de ser esperable en el futuro.

- La librería de encriptación simétrica no implementa encriptación autenticada, por lo que se implementa la autenticación por sobre AES, lo cual podría traer problemas de implementación.

- Todo el trabajo de encriptación se realiza en el navegador de los usuarios, lo cual reduce la confianza requerida en la seguridad del servidor, pero introduce la posibilidad de que el navegador trabaje de adversario.

- Dado a que la clave compartida se crea a través del protocolo Diffie-Hellman, esta es sensible a ataques tipo "Man in the middle", en donde un tercero puede interceptar ambas claves públicas de los usuarios, generando una tercera clave, compartiendo a los demás su propia clave pública, de forma que un usuario ALICE que manda un mensaje encriptado, este lo recibe, lo desencripta obteniendo la información a través de la clave compartida entre ALICE y el 3ero , lo vuelve a encriptar con la clave BOB-3ero y lo envía a BOB.