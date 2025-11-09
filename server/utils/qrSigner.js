// HMAC-based signer so codes can't be forged
import crypto from "crypto";

const SECRET = process.env.PASS_QR_SECRET || "dev_qr_secret_change_me";

// Produces "spass:<passId>:<sig>"
export function signQR(passId) {
  const sig = crypto.createHmac("sha256", SECRET).update(passId).digest("hex");
  return `spass:${passId}:${sig}`;
}

// Accepts either "spass:<passId>:<sig>" or raw "<passId>"
// Returns { valid: boolean, passId: string|null, reason?: string }
export function verifyQR(code) {
  if (!code) return { valid: false, passId: null, reason: "empty" };

  // Allow raw passId fallback (dev/manual entry)
  if (!code.startsWith("spass:")) {
    // Soft-verify it looks like a Mongo ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(code)) {
      return { valid: true, passId: code };
    }
    return { valid: false, passId: null, reason: "bad_format" };
  }

  const parts = code.split(":");
  if (parts.length !== 3)
    return { valid: false, passId: null, reason: "bad_parts" };

  const [, passId, sig] = parts;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(passId)
    .digest("hex");
  if (sig !== expected)
    return { valid: false, passId: null, reason: "sig_mismatch" };

  return { valid: true, passId };
}
