require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Thêm dòng này
const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../docs'))); // Thêm dòng này

const todoRoutes = require('./routes/todoRoutes');
const authRoutes = require('./routes/authRoutes');
// Thêm routes cho admin
const adminRoutes = require('./routes/adminRoutes');

app.use('/todo', todoRoutes);
app.use('/auth', authRoutes);
// Thêm sau app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Route cho đường dẫn gốc
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../docs/index.html'));
});

// Sửa lỗi catch-all route
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../docs/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});