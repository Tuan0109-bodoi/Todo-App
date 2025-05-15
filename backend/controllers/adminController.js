const UserModel = require('../models/UserModel');
const TodoModel = require('../models/TodoModel');
const bcrypt = require('bcrypt');

// Lấy danh sách tất cả người dùng (chỉ admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.getAllUsers();
        res.json({
            result: 'Lấy danh sách người dùng thành công',
            data: users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy chi tiết một người dùng (chỉ admin)
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findUserById(id);
        
        if (!user) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }
        
        res.json({
            result: 'Lấy thông tin người dùng thành công',
            data: user
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cập nhật thông tin người dùng (chỉ admin)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role } = req.body;
        
        // Kiểm tra user tồn tại
        const existingUser = await UserModel.findUserById(id);
        if (!existingUser) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }
        
        // Cập nhật thông tin
        await UserModel.updateUser(id, { username, email, role });
        
        res.json({
            result: 'Cập nhật thông tin người dùng thành công'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Đặt lại mật khẩu cho người dùng (chỉ admin)
exports.resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        
        // Kiểm tra user tồn tại
        const existingUser = await UserModel.findUserById(id);
        if (!existingUser) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }
        
        // Hash mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Cập nhật mật khẩu
        await UserModel.updatePassword(id, hashedPassword);
        
        res.json({
            result: 'Đặt lại mật khẩu thành công'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Xóa người dùng (chỉ admin)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Kiểm tra user tồn tại
        const existingUser = await UserModel.findUserById(id);
        if (!existingUser) {
            return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }
        
        // Xóa người dùng
        await UserModel.deleteUser(id);
        
        res.json({
            result: 'Xóa người dùng thành công'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy thống kê tổng quan (chỉ admin)
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await UserModel.countUsers();
        const totalTasks = await TodoModel.countAllTasks();
        const completedTasks = await TodoModel.countAllCompletedTasks();
        const activeUsers = await UserModel.countActiveUsers(); // Người dùng có ít nhất 1 task
        
        res.json({
            result: 'Lấy thống kê thành công',
            data: {
                totalUsers,
                totalTasks,
                completedTasks,
                activeUsers,
                completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};