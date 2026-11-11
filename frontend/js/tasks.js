
// Danh sach du lieu
let tasks = [];
let members = [];
let editingTaskId = null;
let currentProjectId = null;

// Lay danh sach tu API
function getList(result) {
    if (Array.isArray(result)) return result;
    return result.data || [];
}

// Chuyen ky tu HTML de tranh loi hien thi
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Hien thi trang thai
function getStatusLabel(status) {
    const labels = {
        todo: "Chờ thực hiện",
        in_progress: "Đang thực hiện",
        review: "Chờ duyệt",
        done: "Hoàn thành"
    };

    return labels[status] || status;
}

// Lay ten nguoi thuc hien
function getAssigneeName(id) {
    const member = members.find(m => String(m.id) === String(id));
    return member ? member.full_name : "Chưa phân công";
}

// Tai danh sach du an
async function loadProjects() {
    try {
        const projectSelect = document.getElementById("projectSelect");
        const result = await getProjects();
        const projects = getList(result);

        projectSelect.innerHTML = '<option value="">-- Chọn dự án --</option>';

        projects.forEach(project => {
            projectSelect.innerHTML += `
                <option value="${project.id}">
                    ${escapeHTML(project.name)}
                </option>
            `;
        });

        if (projects.length > 0) {
            projectSelect.value = projects[0].id;
            currentProjectId = projects[0].id;

            await loadMembers();
            await loadTasks();
        } else {
            currentProjectId = null;
            document.getElementById("taskList").innerHTML =
                '<tr><td colspan="5">Bạn chưa có dự án nào.</td></tr>';
        }

    } catch (error) {
        alert("Không thể tải dự án: " + error.message);
    }
}

// Tai danh sach thanh vien
async function loadMembers() {
    try {
        if (!currentProjectId) return;

        const result = await getMembers(currentProjectId);
        members = getList(result);

        const assigneeSelect = document.getElementById("taskAssignee");

        assigneeSelect.innerHTML =
            '<option value="">-- Chọn thành viên --</option>';

        members.forEach(member => {
            assigneeSelect.innerHTML += `
                <option value="${member.id}">
                    ${escapeHTML(member.full_name)}
                </option>
            `;
        });

    } catch (error) {
        alert("Không thể tải thành viên: " + error.message);
    }
}

// Tai danh sach cong viec
async function loadTasks() {
    if (!currentProjectId) return;

    try {
        const result = await getTasks(currentProjectId);
        tasks = getList(result);
        displayTasks();

    } catch (error) {
        alert("Không thể tải công việc: " + error.message);
    }
}

// Hien thi cong viec
function displayTasks() {
    const taskList = document.getElementById("taskList");
    const searchValue = document
        .getElementById("searchInput")
        .value.toLowerCase();

    const statusValue = document.getElementById("statusFilter").value;

    const filteredTasks = tasks.filter(task => {
        const matchName = (task.title || "")
            .toLowerCase()
            .includes(searchValue);

        const matchStatus =
            statusValue === "" || task.status === statusValue;

        return matchName && matchStatus;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML =
            '<tr><td colspan="5">Không tìm thấy công việc.</td></tr>';
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => `
        <tr>
            <td>${escapeHTML(task.title)}</td>
            <td>${escapeHTML(getAssigneeName(task.assignee_id))}</td>
            <td>${escapeHTML(task.due_date ? task.due_date.slice(0, 10) : "")}</td>
            <td>${escapeHTML(getStatusLabel(task.status))}</td>
            <td>
                <button type="button" data-action="edit" data-id="${task.id}">
                    Sửa
                </button>
                <button type="button" data-action="delete" data-id="${task.id}">
                    Xóa
                </button>
            </td>
        </tr>
    `).join("");
}

// Mo form them cong viec
document.getElementById("addTaskBtn").addEventListener("click", () => {
    if (!currentProjectId) {
        alert("Vui lòng chọn dự án trước!");
        return;
    }

    editingTaskId = null;
    document.getElementById("taskForm").reset();
    document.getElementById("modalTitle").textContent = "Thêm công việc";
    document.getElementById("taskModal").style.display = "block";
});

// Dong form
document.getElementById("cancelBtn").addEventListener("click", () => {
    document.getElementById("taskModal").style.display = "none";
});

// Them hoac cap nhat cong viec
document.getElementById("taskForm").addEventListener("submit", async event => {
    event.preventDefault();

    const task = {
        title: document.getElementById("taskName").value.trim(),
        description: document.getElementById("taskDescription").value.trim(),
        due_date: document.getElementById("taskDeadline").value || null,
        status: document.getElementById("taskStatus").value,
        assignee_id: Number(document.getElementById("taskAssignee").value) || null
    };

    if (!task.title) {
        alert("Vui lòng nhập tên công việc!");
        return;
    }

    try {
        if (editingTaskId !== null) {
            await updateTask(editingTaskId, task);
            alert("Cập nhật công việc thành công!");
        } else {
            task.project_id = currentProjectId;
            task.priority = "medium";

            await createTask(task);
            alert("Thêm công việc thành công!");
        }

        document.getElementById("taskModal").style.display = "none";
        document.getElementById("taskForm").reset();

        editingTaskId = null;
        await loadTasks();

    } catch (error) {
        alert("Không thể lưu công việc: " + error.message);
    }
});

// Xu ly nut sua va xoa
document.getElementById("taskList").addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === "edit") {
        editTask(id);
    }

    if (action === "delete") {
        await deleteTask(id);
    }
});

// Sua cong viec
function editTask(id) {
    const task = tasks.find(item => String(item.id) === String(id));

    if (!task) return;

    editingTaskId = task.id;

    document.getElementById("modalTitle").textContent = "Sửa công việc";
    document.getElementById("taskName").value = task.title || "";
    document.getElementById("taskDescription").value = task.description || "";
    document.getElementById("taskDeadline").value =
        task.due_date ? task.due_date.slice(0, 10) : "";
    document.getElementById("taskStatus").value = task.status || "todo";
    document.getElementById("taskAssignee").value = task.assignee_id || "";

    document.getElementById("taskModal").style.display = "block";
}

// Xoa cong viec
async function deleteTask(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa công việc này?")) {
        return;
    }

    try {
        await deleteTaskAPI(id);
        alert("Xóa công việc thành công!");
        await loadTasks();

    } catch (error) {
        alert("Không thể xóa công việc: " + error.message);
    }
}

// Tim kiem cong viec
document.getElementById("searchInput").addEventListener("input", displayTasks);

// Loc trang thai
document.getElementById("statusFilter").addEventListener("change", displayTasks);

// Chuyen du an
document.getElementById("projectSelect").addEventListener("change", async event => {
    currentProjectId = event.target.value || null;

    tasks = [];
    members = [];

    if (currentProjectId) {
        await loadMembers();
        await loadTasks();
    } else {
        displayTasks();
    }
});

// Khoi dong
document.addEventListener("DOMContentLoaded", async () => {
    if (!localStorage.getItem("token")) {
        alert("Bạn cần đăng nhập trước khi quản lý công việc!");
        return;
    }

    await loadProjects();
});
