const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/tasks', authMiddleware, todoController.getTasks);
router.post('/tasks', authMiddleware, todoController.createTask);
router.put('/tasks/:id', authMiddleware, todoController.updateTask);
router.delete('/tasks/:id', authMiddleware, todoController.deleteTask);

// Thêm route cho search
router.post('/search', authMiddleware, todoController.searchTasks);

module.exports = router;
