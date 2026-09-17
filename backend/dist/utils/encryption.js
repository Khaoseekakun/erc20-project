import crypto from "node:crypto";
import { env } from "../config/env.js";
const key = Buffer.from(env.encryptionKey, "hex");
export function encryptPrivateKey(privateKey) { const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv("aes-256-gcm", key, iv); const encryptedPrivateKey = Buffer.concat([cipher.update(privateKey, "utf8"), cipher.final()]).toString("base64"); return { encryptedPrivateKey, encryptionIv: iv.toString("hex"), authTag: cipher.getAuthTag().toString("hex") }; }
export function decryptPrivateKey(wallet) { const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(wallet.encryptionIv, "hex")); decipher.setAuthTag(Buffer.from(wallet.authTag, "hex")); return Buffer.concat([decipher.update(wallet.encryptedPrivateKey, "base64"), decipher.final()]).toString("utf8"); }
