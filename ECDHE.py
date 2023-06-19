from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.kdf.hkdf import HKDF


from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
# Generate a private key for use in the exchange.


def ecdhe_key_gen():
    private_key = ec.generate_private_key(ec.SECP384R1())
    public_key = private_key.public_key()
    return (private_key, public_key)

def ecdhe_public_key_gen(private_key, peer_public_key):
    # In a real handshake the peer_public_key will be received from the
    # other party. For this example we'll generate another private key
    # and get a public key from that.
    # peer_public_key = ec.generate_private_key(ec.SECP384R1()).public_key()

    shared_key = private_key.exchange(ec.ECDH(), peer_public_key)

    # Perform key derivation.
    derived_key = HKDF(
        algorithm=hashes.SHA256(),
        length=256,
        salt=None,
        info=b"handshake data",
    ).derive(shared_key)

    return derived_key

# serialization made to send the public keys 
def serialize(public_key):
    serialized_public = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    return serialized_public

def de_serialize(serialized_public):
    public_key = serialization.load_pem_public_key(
        serialized_public,
    )


    return public_key


if __name__ == "__main__":

    private_key, public_key = ecdhe_key_gen()
    private_key2, public_key2 = ecdhe_key_gen()

    derived_key = ecdhe_public_key_gen(private_key, public_key2)
    derived_key2 = ecdhe_public_key_gen(private_key2, public_key)

    print(derived_key == derived_key2)

    print(len(derived_key))

    print(public_key == de_serialize(serialize(public_key)))
    print(serialize(public_key))