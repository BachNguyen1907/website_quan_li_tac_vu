const express = require('express');
const router = express.Router();
const db = require('./db');
const verifyToken = require('./auth.middleware');

// Áp dụng xác thực cho tất cả API quản lý task
router.use(verifyToken);

// 1. Lấy danh sách công việc (có thể lọc theo project_id hoặc lấy hết của user)
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { project_id } = req.query;

        let query = 'SELECT * FROM tasks WHERE creator_id = ? OR assignee_id = ?';
        let params = [userId, userId];

        if (project_id) {
            query += ' AND project_id = ?';
            params.push(project_id);
        }

        query += ' ORDER BY created_at DESC';

        const [tasks] = await db.execute(query, params);
        res.json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách task', error: error.message });
    }
});

// 2. Tạo công việc mới (khớp với creator_id, assignee_id, project_id)
router.post('/', async (req, res) => {
    try {
        const { title, description, priority, due_date, project_id, assignee_id } = req.body;
        const creatorId = req.user.id;

        if (!title) {
            return res.status(400).json({ message: 'Tiêu đề công việc không được để trống' });
        }

        const [result] = await db.execute(
            `INSERT INTO tasks (title, description, status, priority, due_date, project_id, creator_id, assignee_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, 
                description || null, 
                'todo', 
                priority || 'medium', 
                due_date || null, 
                project_id || null, 
                creatorId, 
                assignee_id || creatorId
            ]
        );

        res.status(201).json({
            message: 'Tạo công việc mới thành công!',
            taskId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi tạo công việc', error: error.message });
    }
});

// 3. Cập nhật công việc (sửa thông tin, đổi trạng thái)
router.put('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;
        const { title, description, status, priority, due_date, assignee_id } = req.body;

        const [result] = await db.execute(
            `UPDATE tasks 
             SET title = COALESCE(?, title),
                 description = COALESCE(?, description),
                 status = COALESCE(?, status),
                 priority = COALESCE(?, priority),
                 due_date = COALESCE(?, due_date),
                 assignee_id = COALESCE(?, assignee_id)
             WHERE id = ? AND (creator_id = ? OR assignee_id = ?)`,
            [
                title !== undefined ? title : null,
                description !== undefined ? description : null,
                status !== undefined ? status : null,
                priority !== undefined ? priority : null,
                due_date !== undefined ? due_date : null,
                assignee_id !== undefined ? assignee_id : null,
                taskId,
                userId,
                userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy công việc hoặc bạn không có quyền cập nhật' });
        }

        res.json({ message: 'Cập nhật công việc thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi cập nhật công việc', error: error.message });
    }
});

// 4. Xóa công việc
router.delete('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;

        const [result] = await db.execute(
            'DELETE FROM tasks WHERE id = ? AND creator_id = ?',
            [taskId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Không tìm thấy công việc hoặc bạn không có quyền xóa' });
        }

        res.json({ message: 'Xóa công việc thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi xóa công việc', error: error.message });
    }
});

module.exports = router;