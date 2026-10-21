export interface ICryptoGateway {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  hashToken(token: string): string;
  generateOtp(length?: number): string;
  generateToken(bytes?: number): string;
}
