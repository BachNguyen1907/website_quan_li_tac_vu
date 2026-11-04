BẢNG ĐẶC TẢ API (API CONTRACT) - WEBSITE QUẢN LÝ TÁC VỤ

Dự án: Website Quản lý tác vụ (Task Management)

Nhóm: 06 - UTH | Tài liệu chuẩn dùng chung: Đội Frontend & Backend

1. Module Xác thực & Phân quyền (Auth)

Phụ trách: Nguyễn Trung Hiếu (Leader)

1.1 Đăng ký tài khoản

Endpoint: POST /api/auth/register

Headers: Content-Type: application/json

Request Body:

{
  "full_name": "Nguyễn Văn A",
  "email": "user@uth.edu.vn",
  "password": "mypassword123"
}


Responses:

201 Created:

{
  "message": "Đăng ký tài khoản thành công!"
}


400 Bad Request:

{
  "message": "Email đã tồn tại hoặc thiếu trường thông tin bắt buộc!"
}


1.2 Đăng nhập hệ thống

Endpoint: POST /api/auth/login

Headers: Content-Type: application/json

Request Body:

{
  "email": "user@uth.edu.vn",
  "password": "mypassword123"
}


Responses:

200 OK:

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "full_name": "Nguyễn Trung Hiếu",
    "email": "user@uth.edu.vn",
    "role": "admin"
  }
}


401 Unauthorized:

{
  "message": "Email hoặc mật khẩu không chính xác!"
}


2. Module Quản lý Tác vụ & Kanban (Tasks)

Phụ trách: Trần Quốc Bảo

Lưu ý bắt buộc: Tất cả các request từ phần này đều phải có Header:

Authorization: Bearer <token>

2.1 Lấy danh sách task theo dự án (Hiển thị cột Kanban)

Endpoint: GET /api/projects/:projectId/tasks

Response (200 OK):

[
  {
    "id": 1,
    "project_id": 1,
    "title": "Thiết kế giao diện Kanban",
    "description": "Dựng cột Todo, In Progress, Review, Done",
    "status": "in_progress",
    "priority": "high",
    "creator_id": 1,
    "assignee_id": 2,
    "assignee_name": "Nguyễn Thế Hoàng Bách",
    "due_date": "2026-11-20T23:59:59"
  }
]


2.2 Tạo công việc mới

Endpoint: POST /api/tasks

Request Body:

{
  "project_id": 1,
  "title": "Lập trình API lấy danh sách task",
  "description": "Viết controller và query SQL Server",
  "priority": "medium",
  "assignee_id": 4,
  "due_date": "2026-11-25T17:00:00"
}


Response (201 Created):

{
  "message": "Tạo task thành công!",
  "taskId": 4
}


2.3 Cập nhật trạng thái kéo thả Kanban

Endpoint: PATCH /api/tasks/:id/status

Request Body:

{
  "status": "done"
}


(Các giá trị trạng thái hợp lệ: todo, in_progress, review, done)

Response (200 OK):

{
  "message": "Cập nhật trạng thái công việc thành công!"
}


2.4 Xóa công việc

Endpoint: DELETE /api/tasks/:id

Response (200 OK):

{
  "message": "Xóa task thành công!"
}


3. Module Dự án & Nhóm (Projects & Members)

Phụ trách: Lê Đăng Khoa

Lưu ý bắt buộc: Cần Header Authorization: Bearer <token>

3.1 Lấy danh sách dự án của người dùng hiện tại

Endpoint: GET /api/projects

Response (200 OK):

[
  {
    "id": 1,
    "name": "Dự án Quản lý tác vụ Nhóm 6",
    "description": "Xây dựng website Kanban Board và phân quyền",
    "owner_id": 1,
    "project_role": "owner"
  }
]


3.2 Tạo dự án mới

Endpoint: POST /api/projects

Request Body:

{
  "name": "Hệ thống Bán vé xe trực tuyến",
  "description": "Đồ án môn Phân tích thiết kế hệ thống"
}


Response (201 Created):

{
  "message": "Tạo dự án thành công!",
  "projectId": 2
}


3.3 Thêm thành viên vào dự án

Endpoint: POST /api/projects/:projectId/members

Request Body:

{
  "email": "bach@uth.edu.vn",
  "project_role": "member"
}


(Các vai trò hợp lệ: owner, leader, member)

Response (200 OK):

{
  "message": "Đã thêm thành viên vào dự án thành công!"
}


4. Module Bình luận (Comments)

Phụ trách: Lê Đăng Khoa

Lưu ý bắt buộc: Cần Header Authorization: Bearer <token>

4.1 Lấy danh sách bình luận theo Task

Endpoint: GET /api/tasks/:taskId/comments

Response (200 OK):

[
  {
    "id": 1,
    "user_id": 1,
    "user_name": "Nguyễn Trung Hiếu",
    "content": "Nhớ kiểm tra kỹ validation trước khi push nhé!",
    "created_at": "2026-11-04T15:00:00"
  }
]


4.2 Thêm bình luận vào Task

Endpoint: POST /api/tasks/:taskId/comments

Request Body:

{
  "content": "Giao diện Kanban đã kéo thả mượt mà trên Chrome và Edge."
}


Response (201 Created):

{
  "message": "Thêm bình luận thành công!"
}
