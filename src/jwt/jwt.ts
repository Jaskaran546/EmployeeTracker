import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

export async function generateToken(data: any): Promise<any> {
  let secretKey: Secret = String(process.env.JWT_SECRETKEY);
  console.log("secretKey", secretKey);
  let payload: any = {
    email: data.email,
    username: data.username,
    country: data.country,
    phone: data.phone,
  };
  console.log("JWT_EXPIRES_IN", process.env.JWT_EXPIRES_IN);
  let expiredTime: any = process.env.JWT_EXPIRES_IN;
  console.log("Number(expiredTime)", expiredTime);
  let option: SignOptions = {
    expiresIn: expiredTime,
  };
  return jwt.sign(payload, secretKey, option);
}

export async function validateToken(token: string): Promise<any> {
  try {
    let secretKey: Secret = String(process.env.JWT_SECRETKEY);
    return jwt.verify(token, secretKey) as JwtPayload;
  } catch (error) {
    return null;
  }
}
