const nodemailer = require("nodemailer");

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendContactEmail = async (req, res) => {
    const { firstName, lastName, email, phone, subject, message } = req.body;
    console.log(`[CONTACT] Message received from: ${email}`);

    if (!firstName || !lastName || !email || !subject || !message) {
        return res.status(400).json({ message: "All required fields must be filled" });
    }

    const mailOptions = {
        from: `"CloudBase Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `Contact Form: ${subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6366f1;">New Contact Form Submission</h2>

                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #374151;">Contact Details</h3>
                    <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                </div>

                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #374151;">Message</h3>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>

                <p style="color: #6b7280; margin-top: 20px; font-size: 12px;">
                    This message was sent from the CloudBase contact form.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[CONTACT] Email sent successfully from: ${email}`);
        return res.status(200).json({ message: "Message sent successfully! We'll get back to you soon." });
    } catch (emailError) {
        console.log(`[CONTACT] Email error: ${emailError.message}`);
        return res.status(500).json({ message: "Failed to send message. Please try again later." });
    }
};

module.exports = { sendContactEmail };
