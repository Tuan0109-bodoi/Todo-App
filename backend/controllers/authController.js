const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const emailService = require('../utils/email');  // Thêm dòng này

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Kiểm tra dữ liệu
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin!' });
        }

        // Hash mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Lưu user vào database
        const newUser = await UserModel.createUser(username, email, hashedPassword);

        res.status(201).json({ message: 'Đăng ký thành công!', userId: newUser.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username hoặc email đã tồn tại!' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Kiểm tra xem đầu vào là email hay username
        let user;
        if (username.includes('@')) {
            // Nếu có @ thì tìm theo email
            user = await UserModel.findUserByEmail(username);
        } else {
            // Nếu không có @ thì tìm theo username
            user = await UserModel.findUserByUsername(username);
        }

        if (!user) {
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
        }

        // So sánh mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
        }

        // Tạo token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        res.json({ message: 'Đăng nhập thành công!', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email là bắt buộc' });
        }
        
        const user = await UserModel.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'Email không tồn tại trong hệ thống' });
        }
        
        // Tạo token ngẫu nhiên
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        // Lưu token và thời gian hết hạn (1 giờ)
        await UserModel.saveResetToken(user.id, resetToken);
        
        // Tạo URL đặt lại mật khẩu
        const resetUrl = `https://tuan0109-bodoi.github.io/Todo-App/pages/reset-password.html?token=${resetToken}`;
        
        // Gửi email thực sự qua Nodemailer
        await emailService.sendResetPasswordEmail(email, resetUrl);
        
        res.json({ message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn' });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token và mật khẩu mới là bắt buộc' });
        }
        
        const user = await UserModel.findUserByResetToken(token);
        if (!user) {
            return res.status(400).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        
        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Cập nhật mật khẩu và xóa token
        await UserModel.updatePassword(user.id, hashedPassword);
        
        res.json({ message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};