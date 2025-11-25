import validator from "validator";

// Sanitize string input to prevent XSS
export const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return validator.escape(str.trim());
};

// Validate and sanitize email
export const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return { valid: false, message: "Email is required" };
  }
  const trimmed = email.trim().toLowerCase();
  if (!validator.isEmail(trimmed)) {
    return { valid: false, message: "Invalid email format" };
  }
  return { valid: true, email: trimmed };
};

// Validate password strength (for registration)
export const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required" };
  }
  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true };
};

// Validate OTP
export const validateOTP = (otp) => {
  if (!otp || typeof otp !== "string") {
    return { valid: false, message: "OTP is required" };
  }
  const trimmed = otp.trim();
  if (!/^\d{6}$/.test(trimmed)) {
    return { valid: false, message: "OTP must be a 6-digit number" };
  }
  return { valid: true, otp: trimmed };
};

// Validate MongoDB ObjectId
export const validateObjectId = (id) => {
  if (!id || typeof id !== "string") {
    return { valid: false, message: "Invalid ID" };
  }
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return { valid: false, message: "Invalid ID format" };
  }
  return { valid: true };
};

// Sanitize object recursively
export const sanitizeObject = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === "string") {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

// Middleware to validate registration input
export const validateRegistration = (req, res, next) => {
  try {
    const { fullname, email, password } = req.body;

    // Validate email
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }
    req.body.email = emailCheck.email;

    // Validate password
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res
        .status(400)
        .json({ success: false, message: passwordCheck.message });
    }

    // Validate fullname
    if (!fullname || typeof fullname !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Full name is required" });
    }

    if (!fullname.firstname || fullname.firstname.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "First name must be at least 2 characters",
      });
    }

    // Sanitize name fields
    req.body.fullname.firstname = sanitizeString(fullname.firstname);
    if (fullname.lastname) {
      req.body.fullname.lastname = sanitizeString(fullname.lastname);
    }

    next();
  } catch (error) {
    console.error("[Validation Error]:", error);
    next();
  }
};

// Middleware to validate login input (less strict - for existing users)
export const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Basic email check
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Normalize email
    req.body.email = email.trim().toLowerCase();

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    next();
  } catch (error) {
    console.error("[Validation Error]:", error);
    next();
  }
};

// Middleware to validate OTP verification
export const validateOTPInput = (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }
    req.body.email = emailCheck.email;

    const otpCheck = validateOTP(otp);
    if (!otpCheck.valid) {
      return res.status(400).json({ success: false, message: otpCheck.message });
    }
    req.body.otp = otpCheck.otp;

    next();
  } catch (error) {
    console.error("[Validation Error]:", error);
    next();
  }
};
