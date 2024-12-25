const nodemailer = require('nodemailer');

const sentEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const info = await transporter.sendMail({
        from: process.env.EMAIL,
        to: options.to,
        subject: options.subject,
        text: options.message,
    });
    
    console.log('Email sent: %s', info.messageId);
};

module.exports = sentEmail;