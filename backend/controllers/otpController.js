const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const UserMongo = require('../models/mongo/UserMongo');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Constants for OTP configs
const OTP_EXPIRY_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 5;
const OTP_REQUEST_LIMIT = 3; // Max 3 requests
const OTP_REQUEST_WINDOW_MINUTES = 10; // per 10 minutes
const OTP_RESEND_COOLDOWN_SECONDS = 30;

// Twilio Setup (Safe fallback to avoid crashing if env vars missing)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Nodemailer Setup
const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER || process.env.GMAIL_USER,
            pass: process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD,
        }
    });
};

const sendSmsOtp = async (phone, otp) => {
    if (!twilioClient) {
        throw new Error('Twilio is not configured. Missing account SID/Token in .env');
    }
    await twilioClient.messages.create({
        body: `Your Gita Wisdom verification code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
    });
};

const sendEmailOtp = async (email, otp) => {
    const transporter = getTransporter();
    await transporter.sendMail({
        from: `"Gita Wisdom" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Gita Wisdom - Your Login OTP',
        html: `<div style="font-family:Arial,sans-serif;background:#08111f;color:#fef3c7;padding:24px;border-radius:12px;border:1px solid #d4a12d;max-width:520px;">
                <h2 style="margin:0 0 12px;color:#f5d06f;">Gita Wisdom Account Verification</h2>
                <div style="font-size:34px;font-weight:700;letter-spacing:8px;color:#ffffff;margin:10px 0 18px;">${otp}</div>
                <p style="margin:0;color:#fcd34d;">This OTP expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
               </div>`,
    });
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOtp = async (req, res) => {
    try {
        const { email, phone } = req.body;
        
        if (!email && !phone) {
            return res.status(400).json({ message: 'Must provide either an email or phone number.' });
        }

        const identifierKey = email ? 'email' : 'phone';
        const identifierValue = email ? email.toLowerCase().trim() : phone.trim();

        // Find or instantiate User
        let user = await UserMongo.findOne({ [identifierKey]: identifierValue });
        
        const now = new Date();
        
        if (user) {
            // Check Resend Cooldown (30 seconds)
            if (user.lastOtpRequestTime) {
                const diffSec = (now.getTime() - user.lastOtpRequestTime.getTime()) / 1000;
                if (diffSec < OTP_RESEND_COOLDOWN_SECONDS) {
                    return res.status(429).json({ message: `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - diffSec)} seconds before requesting a new OTP.` });
                }
                
                // Rate Limiter: Max 3 per 10 mins
                const windowStart = new Date(now.getTime() - OTP_REQUEST_WINDOW_MINUTES * 60000);
                if (user.lastOtpRequestTime > windowStart) {
                    if (user.otpRequestCount >= OTP_REQUEST_LIMIT) {
                        return res.status(429).json({ message: 'Too many requests, try later' });
                    }
                } else {
                    // Reset if outside window
                    user.otpRequestCount = 0;
                }
            }
        } else {
            // User doesn't exist, Create them dynamically (Flexible authentication)
            user = new UserMongo({
                [identifierKey]: identifierValue,
                verified: false,
                otpRequestCount: 0
            });
        }

        // Generate and Hash OTP
        const plainOtp = generateOtp();
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(plainOtp, salt);

        // Update DB Record
        user.otpHash = hashedOtp;
        user.otpExpiry = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60000);
        user.otpAttempts = 0;
        user.lastOtpRequestTime = now;
        user.otpRequestCount += 1;

        // Send OTP via external services
        if (phone) {
            await sendSmsOtp(phone, plainOtp);
        } else {
            // Check if mock mode applies or real email
            await sendEmailOtp(email, plainOtp);
        }

        await user.save();

        res.status(200).json({ message: 'OTP sent successfully.' });

    } catch (error) {
        console.error('OTP Send Error:', error);
        res.status(500).json({ message: 'Failed to send OTP.' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, phone, otp } = req.body;
        
        if (!otp) return res.status(400).json({ message: 'OTP is required.' });
        if (!email && !phone) return res.status(400).json({ message: 'Must provide either email or phone.' });

        const identifierKey = email ? 'email' : 'phone';
        const identifierValue = email ? email.toLowerCase().trim() : phone.trim();

        const user = await UserMongo.findOne({ [identifierKey]: identifierValue });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.otpHash) {
            return res.status(400).json({ message: 'Invalid OTP request. Please request a new OTP.' });
        }

        // Check if expired
        const now = new Date();
        if (now > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Check attempts limit
        if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
            user.otpHash = null; // Lock it out
            await user.save();
            return res.status(400).json({ message: 'Too many attempts. Request a new OTP.' });
        }

        // Compare Hash
        const isMatch = await bcrypt.compare(otp.toString(), user.otpHash);
        
        if (!isMatch) {
            user.otpAttempts += 1;
            await user.save();
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Verification Success -> Clear OTP and mark verified
        user.isVerified = true;
        user.verified = true;
        user.otpHash = undefined;
        user.otpExpiry = undefined;
        user.otpAttempts = 0;
        user.otpRequestCount = 0;
        await user.save();

        // Generate JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret', {
            expiresIn: '7d',
        });

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                role: user.role,
                settings: user.settings
            }
        });

    } catch (error) {
        console.error('OTP Verify Error:', error);
        res.status(500).json({ message: 'Server error during verification.' });
    }
};
