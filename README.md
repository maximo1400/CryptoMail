# CryptoMail
    CryptoMail es una implementación simple de un servicio de mensajeria autenticado y confidencial. La idea de este es que cada usuario registrado pueda recibir mensajes de otros usuarios de forma privada a traves de un sistema de encriptación, y que con cada usuario posea una forma de generar una clave de encriptación sin necesidad de enviarsela directamente.


## Librerias y Frameworks utilizado.
    En Python:
        - Django : Para el backend de la pagina web.
        - Channels : Websockets para conexión entre usuarios.

    En Javascript:
        - Crypto.js : Para la encriptación de mensajes.
        - Elliptic.js : Para la generación de claves e implementación de ECDH


## Ejecución 

    En primer lugar se deben instalar los requerimientos del proyecto con `pip install -Ur requirements.txt`

    Luego se deben crear las migraciones de los modelos y migrarlos, esto se hace con `python manage.py makemigrations` y luego `python manage.py migrate`.

    Para levantar el servidor local se debe correr el comando`python manage.py runserver`

<!-- ## Requisitos -->
    

## Intercambio de claves: EECDH:
    Para el acuerdo de claves se decidió utilizar Diffie-Hellman, especificamente ECDH con la curva 25519, por medio de la librería [elliptic](https://github.com/indutny/elliptic), la que se encarga de generar un par de claves (una privada y una pública) por cada usuario que desee establecer comunicación (en este caso dos personas). Luego los usuarios involucrados comparten su clave pública entre si y generan una llave final utilizando su clave privada y la clave pública que reciben del usuario con el que se están comunicando, que será la que les permite encriptar sus mensajes por medio de encriptación simétrica. 


## Encriptacion Simetrica: AES-256
    Esto por que hace una implementación segura de un bloque de cifrado autenticado utilizando la libreria [crypto-js](https://github.com/brix/crypto-js) con la cual se encriptan los mensajes a enviar, utilizando claves definidas por el usuario, las cuales son convertidas a llaves de 256 bits por la librería, también está agrega un vector de inicialización y un salt al mensaje por lo que 2 mensajes encriptados con la misma clave serán distintos. se utilizaron las configuraciones por defecto para esta librería, lo que significa el uso de AES-CBC y de padding Pkcs7, finalmente este sistema de encriptación sólo retorna texto en caso de desencriptar el mensaje con la llave original, en caso contrario no muestra cambios en pantalla. 

    El uso esperado de esta encriptación es la utilización de la llave `final` obtenida por `EECDH` a modo de clave para encriptar y desencriptar mensajes por ambos participantes del chat.

## Autenticación
    Se realiza una autenticación de los usuarios que se comunican por medio de CryptoMail. Para ello se usa HMACSHA256 de la libreria CryptoJS para hacer el mac utilizado para la autenticación. Se hace una autenticación de la forma Encrypt-then-Mac. 

## Parte visual
    La interfaz de `CryptoMail` empezo como [Django-ChatApp](https://github.com/shubham99bisht/Django-ChatApp), una aplicacion de django donde usuarios podian entrar a canales de chat abiertos en los todos podian escribir. Esto fue modificado para que solo se puedan realizar comunicaciones entre 2 usuarios de acuerdo a lo requerido.

# Analisis

## Mejoras que se podrían implementar
    - Reemplazar la encriptación utilizada actualmente, por algún tipo de encriptación simétrica autenticada ya implementado tal como [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode).

## Esquema de encriptación autenticada utilizado:
    - Encrypt-then-Mac

### Posibles peligros 
    - Las librerias fueron seleccionadas debido a su alto numero de descargas (+10 millones semanales) por lo que se espera que sea notado de manera expedita cualquier problema de seguridad que pueda surgir, pero esto podria dejar de ser esperable en el futuro.

    - La libreria de encriptacin simetrica no implemeta encriptacion autenticada, por lo que se implemeto la autenticacion por sobre AES, lo cual podria traer problemas de implemetacion.
    
    - Todo el trabajo de encriptacion se realiza en el navegador de los usuarios, lo cual reduce la confianza requerida en la seguridad del servidor, pero introduce la posibilidad de que el navegador trabaje de adversario.
    
    - Dado a que la clave compartida se crea a traves del protocolo Diffie-Hellman, esta es sensible a ataques tipo "Man in the middle", en donde un tercero puede interceptar ambas claves publicas de los usuarios, generando una tercera clave, compartiendo a los demas su propia clave publica, de forma que un usuario ALICE que manda un mensaje encriptado, este lo recibe, lo desencripta obteniendo la información a traves de la clave compartida entre ALICE y el 3ero , lo vuelve a encriptar con la clave BOB-3ero y lo reenvia a BOB.