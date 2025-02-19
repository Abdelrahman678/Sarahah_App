import CryptoJs from "crypto-js";

export const Encryption = async ({plaintext,secretKey}={}) => {
    return CryptoJs.AES.encrypt(JSON.stringify(plaintext), secretKey).toString();
}

export const Decryption = async ({ciphertext,secretKey}={}) => {
    return CryptoJs.AES.decrypt(ciphertext, secretKey).toString(CryptoJs.enc.Utf8);
}
