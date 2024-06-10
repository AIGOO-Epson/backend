import * as CryptoJS from 'crypto-js';

class Crypto {
  constructor(private secret) {
    this.secret = CryptoJS.enc.Utf8.parse(secret);
  }
  public encrypt(value: string | number): string {
    if (Number.isNaN(Number(value))) {
      console.log('Already encrypted value');
      console.trace();
      return String(value);
    }

    const encrypted = CryptoJS.AES.encrypt(String(value), this.secret, {
      iv: this.secret,
    }).toString();
    return encrypted;
  }

  public decrypt(value: string | number): number {
    if (!Number.isNaN(Number(value))) {
      console.log('Already decrypted value');
      console.trace();
      return Number(value);
    }

    const decrypted = CryptoJS.AES.decrypt(String(value), this.secret, {
      iv: this.secret,
    });
    return Number(decrypted.toString(CryptoJS.enc.Utf8));
  }
}

export const crypter = new Crypto(
  process.env.CRYPTO_SECRET ?? '2e47f242a46d13eeb22aabc01d5e5d05'
);
