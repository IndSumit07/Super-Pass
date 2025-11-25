import { verifyAccessToken } from "../utils/jwt.js";
import { BlacklistToken } from "../models/blacklistToken.model.js";
import { User } from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  const blacklisted = await BlacklistToken.findOne({ token });
  if (blacklisted)
    return res
      .status(401)
      .json({ success: false, message: "Token blacklisted" });

  const decoded = verifyAccessToken(token);
  if (!decoded)
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });

  const user = await User.findById(decoded.id);
  req.user = user;
  next();
};

export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Admin access required" });
  }
};
