const nodemailer = require('nodemailer');

// Khởi tạo transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Hàm gửi email
exports.sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: options.to,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Không thể gửi email: ' + error.message);
    }
};

// Hàm gửi email đặt lại mật khẩu
exports.sendResetPasswordEmail = async (email, resetToken) => {
    const resetUrl = `http://localhost:3000/pages/reset-password.html?token=${resetToken}`;
    
    return this.sendEmail({
        to: email,
        subject: 'Đặt lại mật khẩu Todo App',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7e57ff;">Đặt lại mật khẩu</h2>
            <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
            <p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #7e57ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Đặt lại mật khẩu</a>
            </div>
            <p>Hoặc bạn có thể sao chép đường dẫn sau vào trình duyệt:</p>
            <p>${resetUrl}</p>
            <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        </div>
        `
    });
};