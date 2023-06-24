from cryptography.fernet import Fernet


def generate_key():
    """
    Generates a key and save it into a file
    """
    key = Fernet.generate_key()
    return key


def encrypt_message(message, key):
    """
    Encrypts a message
    """
    encoded_message = message.encode()
    f = Fernet(key)
    encrypted_message = f.encrypt(encoded_message)

    # print(encrypted_message)
    return encrypted_message


def decrypt_message(encrypted_message, key):
    """
    Decrypts an encrypted message
    """
    f = Fernet(key)
    decrypted_message = f.decrypt(encrypted_message)

    # print(decrypted_message.decode())
    return decrypted_message.decode()


if __name__ == "__main__":

    key = generate_key()
    print(key)
    # encripted = encrypt_message("encrypt this message", key)
    # decrypt_message(encripted,key)
