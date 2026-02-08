const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const db = require("../connection/db.js");

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (req, res) => {
    const { email } = req.body;
    console.log(`[FORGOT-PASSWORD] OTP request for: ${email}`);

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const userCheck = "SELECT * FROM users WHERE email = ?";

    db.query(userCheck, [email], async (error, results) => {
        if (error) {
            console.log(`[FORGOT-PASSWORD] Database error: ${error.message}`);
            return res.status(500).json({ message: "Database error", error });
        }

        if (results.length === 0) {
            console.log(`[FORGOT-PASSWORD] User not found: ${email}`);
            return res.status(404).json({ message: "No account found with this email" });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        // Store OTP
        otpStore.set(email, { otp, expiresAt });

        // Send email
        const mailOptions = {
            from: `"CloudBase" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'CloudBase - Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Password Reset Request</h2>
                    <p>You requested to reset your password for your CloudBase account.</p>
                    <p>Your OTP is:</p>
                    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px;">
                        <h1 style="color: #6366f1; letter-spacing: 8px; margin: 0;">${otp}</h1>
                    </div>
                    <p style="color: #6b7280; margin-top: 20px;">This OTP will expire in 10 minutes.</p>
                    <p style="color: #6b7280;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`[FORGOT-PASSWORD] OTP sent to: ${email}`);
            return res.status(200).json({ message: "OTP sent successfully" });
        } catch (emailError) {
            console.log(`[FORGOT-PASSWORD] Email error: ${emailError.message}`);
            return res.status(500).json({ message: "Failed to send OTP email", error: emailError.message });
        }
    });
};

const verifyOTP = (req, res) => {
    const { email, otp } = req.body;
    console.log(`[FORGOT-PASSWORD] OTP verification for: ${email}`);

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
        console.log(`[FORGOT-PASSWORD] No OTP found for: ${email}`);
        return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }

    if (Date.now() > storedData.expiresAt) {
        otpStore.delete(email);
        console.log(`[FORGOT-PASSWORD] OTP expired for: ${email}`);
        return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (storedData.otp !== otp) {
        console.log(`[FORGOT-PASSWORD] Invalid OTP for: ${email}`);
        return res.status(400).json({ message: "Invalid OTP" });
    }

    console.log(`[FORGOT-PASSWORD] OTP verified for: ${email}`);
    return res.status(200).json({ message: "OTP verified successfully" });
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    console.log(`[FORGOT-PASSWORD] Password reset for: ${email}`);

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
        return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }

    if (Date.now() > storedData.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (storedData.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const updateQuery = "UPDATE users SET password = ? WHERE email = ?";

    db.query(updateQuery, [hashedPassword, email], (error, results) => {
        if (error) {
            console.log(`[FORGOT-PASSWORD] Database error: ${error.message}`);
            return res.status(500).json({ message: "Database error", error });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Clear OTP after successful reset
        otpStore.delete(email);

        console.log(`[FORGOT-PASSWORD] Password reset successful for: ${email}`);
        return res.status(200).json({ message: "Password reset successfully" });
    });
};

module.exports = { sendOTP, verifyOTP, resetPassword };
