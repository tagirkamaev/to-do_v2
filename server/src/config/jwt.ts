import jwt from "jsonwebtoken";
import { IUserDocument } from "../types/user";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "24h";

export const generateToken = (user: IUserDocument): string => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const verifyToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
};
