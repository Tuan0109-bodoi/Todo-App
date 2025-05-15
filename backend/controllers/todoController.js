const TodoModel = require('../models/TodoModel');

exports.getTasks = async (req, res) => {
    try {
        const userId = req.userData.userId; // Lấy từ middleware
        const limit = parseInt(req.query.limit) || 5;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const totalItems = await TodoModel.getTotalItems(userId);
        const totalPages = Math.max(1, Math.ceil(totalItems / limit));
        const tasks = await TodoModel.getTasks(userId, limit, offset);
        res.json({
            result: 'Lấy danh sách thành công',
            data: tasks,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                limit: limit,
                total_items: totalItems,
                has_next_page: page < totalPages,
                has_prev_page: page > 1
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { taskname, status } = req.body;
        if (!taskname || status === undefined) {
            return res.status(400).json({ error: 'Tên công việc là bắt buộc' });
        }
        const result = await TodoModel.createTask(userId, taskname, status);
        res.json({ result: 'Thêm công việc thành công', data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { id, taskname, status } = req.body;
        if (!id || !taskname || status === undefined) {
            return res.status(400).json({ error: 'ID, tên công việc và trạng thái là bắt buộc' });
        }
        const result = await TodoModel.updateTask(userId, id, taskname, status);
        res.json({ result: 'Cập nhật thành công', data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'ID là bắt buộc' });
        }
        const result = await TodoModel.deleteTask(userId, id);
        res.json({ result: 'Xóa thành công', data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.doneTask = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'ID là bắt buộc' });
        }
        const result = await TodoModel.doneTask(userId, id);
        res.json({ result: 'Cập nhật thành công', data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.searchTasks = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { taskname, status, page = 1, limit = 5 } = req.body;
        const offset = (page - 1) * limit;
        const totalItems = await TodoModel.countSearchTasks(userId, taskname, status);
        const totalPages = Math.max(1, Math.ceil(totalItems / limit));
        const tasks = await TodoModel.searchTasks(userId, taskname, status, limit, offset);
        res.json({
            result: 'Lấy danh sách thành công',
            data: tasks,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                limit: limit,
                total_items: totalItems,
                has_next_page: page < totalPages,
                has_prev_page: page > 1
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};