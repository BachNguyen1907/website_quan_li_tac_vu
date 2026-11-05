const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');
const authenticateToken = require('./auth.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Cấu hình Middleware
app.use(cors());
app.use(express.json());

// Nạp module xác thực (Đăng ký / Đăng nhập)
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Route kiểm tra kết nối server
app.get('/', (req, res) => {
    res.json({ message: 'Máy chủ Backend Task Management đang chạy bình thường!' });
});

// Route mẫu kiểm tra token bảo mật
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({
        message: 'Bạn đã truy cập thành công vào route bảo mật!',
        user: req.user
    });
});

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`Server dang chay tai: http://localhost:${PORT}`);
});