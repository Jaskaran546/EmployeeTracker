import jwt, { Secret, SignOptions } from "jsonwebtoken";

export interface TokenPayload {
  email: string;
  username: string;
  country: string;
  phone: number;
}

export async function generateToken(data: any): Promise<any> {
  let secretKey: Secret = String(process.env.JWT_SECRETKEY);
  let payload: TokenPayload = {
    email: data.email,
    username: data.username,
    country: data.country,
    phone: data.phone,
  };
  let expiredTime: any = process.env.JWT_EXPIRES_IN;
  let option: SignOptions = {
    expiresIn: expiredTime,
  };
  return jwt.sign(payload, secretKey, option);
}

export async function validateToken(token: string): Promise<any> {
  try {
    let secretKey: Secret = String(process.env.JWT_SECRETKEY);
    return jwt.verify(token, secretKey) as TokenPayload;
  } catch (error) {
    throw error;
  }
}
