import * as CryptoJS from 'crypto-js';

export class Crypto {
  private static secret: string = 'forTestEnv';

  static setSecret(secret: string) {
    this.secret = CryptoJS.enc.Utf8.parse(secret);
  }

  static encrypt(value: string | number): string {
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

  static decrypt(value: string | number): number {
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
