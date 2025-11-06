const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const Redis = require("ioredis");

const redis = new Redis(); // default localhost:6379

const token = {};

// Generate & store secret in Redis
token.generateSecret = async (userId) => {
    const secretObj = speakeasy.generateSecret({
        name: "CodeNest App",
        issuer: "CodeNest",
    });

    // Store full secret object as JSON with 5-minute expiry (300 seconds)
    await redis.setex(
        `otp_secret_${userId}`,
        300155410,
        JSON.stringify(secretObj)
    );

    return secretObj;
};

// Generate OTP for a user (TOTP)
token.generateToken = async (userId) => {
    let secretStr = await redis.get(`otp_secret_${userId}`);
    let secretObj;

    if (!secretStr) {
        secretObj = await token.generateSecret(userId);
    } else {
        secretObj = JSON.parse(secretStr);
    }

    const otp = speakeasy.totp({
        secret: secretObj.base32,
        encoding: 'base32',
        step: 30,    // 30-second time step
        digits: 6    // 6-digit OTP
    });

    console.log("Secret:", secretObj.base32);
    console.log("OTP:", otp);
    return otp;
};

// Verify OTP entered by the user
token.verifyToken = async (userId, userOtp) => {
    const secretStr = await redis.get(`otp_secret_${userId}`);
    if (!secretStr) return false;

    const secretObj = JSON.parse(secretStr);

    const verified = speakeasy.totp.verify({
        secret: secretObj.base32,
        encoding: 'base32',
        token: userOtp,
        step: 30,       // 30-second OTP interval
        window: 1       // allow ±1 step (±30 seconds)
    });

    console.log("Is Valid:", verified);
    return verified;
};

// Generate QR Code for Google Authenticator
token.generateQRCode = async (userId) => {
    let secretStr = await redis.get(`otp_secret_${userId}`);
    let secretObj;

    if (!secretStr) {
        secretObj = await token.generateSecret(userId);
    } else {
        secretObj = JSON.parse(secretStr);
    }

    // Generate QR code (async)
    const qrCodeData = await qrcode.toDataURL(secretObj.otpauth_url);

    console.log("QR Code URL:", qrCodeData);
    console.log("Secret Base32:", secretObj.base32);

    return qrCodeData;
};

module.exports = token;
