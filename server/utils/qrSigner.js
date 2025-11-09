// utils/qrSigner.js
import crypto from "crypto";

const SECRET = process.env.PASS_QR_SECRET || "dev_pass_qr_secret_change_me";

export function signQR(passId) {
  const mac = crypto
    .createHmac("sha256", SECRET)
    .update(String(passId))
    .digest("hex");
  // compact payload: passId:mac16
  return `${passId}:${mac.slice(0, 16)}`;
}

export function verifyQR(code) {
  if (!code || !code.includes(":")) return { ok: false };
  const [passId, mac16] = code.split(":");
  const expect = crypto
    .createHmac("sha256", SECRET)
    .update(String(passId))
    .digest("hex")
    .slice(0, 16);
  return { ok: mac16 === expect, passId };
}
