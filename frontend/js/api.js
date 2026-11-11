
const API_URL = "http://localhost:5000/api";

// Hàm gửi yêu cầu đến Backend
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Có lỗi xảy ra!");
    }

    return data;
}

// Đăng nhập
async function login(email, password) {
    const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
}

// Lấy danh sách dự án
async function getProjects() {
    return await apiRequest("/projects");
}

// Lấy danh sách công việc
async function getTasks(projectId) {
    return await apiRequest(`/tasks?project_id=${projectId}`);
}

// Thêm công việc
async function createTask(task) {
    return await apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify(task)
    });
}

// Cập nhật công việc
async function updateTask(id, task) {
    return await apiRequest(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(task)
    });
}

// Xóa công việc
async function deleteTaskAPI(id) {
    return await apiRequest(`/tasks/${id}`, {
        method: "DELETE"
    });
}

// Lấy danh sách thành viên dự án
async function getMembers(projectId) {
    return await apiRequest(`/projects/${projectId}/members`);
}

// Đăng xuất
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}
