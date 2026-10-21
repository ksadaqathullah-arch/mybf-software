import crypto from 'crypto';
import { ICryptoGateway } from '../../application/ports/crypto.gateway.port';

export class NodeCryptoGateway implements ICryptoGateway {
  public async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) return reject(err);
        resolve(`${salt}:${derivedKey.toString('hex')}`);
      });
    });
  }

  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(':');
      if (!salt || !key) return resolve(false);

      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) return reject(err);
        resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
      });
    });
  }

  public hashToken(token: string): string {
    return crypto.createHash('sha256').update(token.trim()).digest('hex');
  }

  public generateOtp(length = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return String(crypto.randomInt(min, max + 1));
  }

  public generateToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }
}
