
let members = [];
let currentProjectId = null;

// Hien thi vai tro
function getRoleLabel(role) {
    const roles = {
        owner: "Chủ dự án",
        leader: "Trưởng nhóm",
        member: "Thành viên"
    };

    return roles[role] || role;
}

// Tranh loi khi hien thi HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Tai danh sach du an
async function loadProjects() {
    try {
        const projects = await getProjects();
        const projectSelect = document.getElementById("projectSelect");

        projectSelect.innerHTML =
            '<option value="">-- Chọn dự án --</option>';

        projects.forEach(project => {
            projectSelect.innerHTML += `
                <option value="${project.id}">
                    ${escapeHTML(project.name)}
                </option>
            `;
        });

        if (projects.length > 0) {
            currentProjectId = projects[0].id;
            projectSelect.value = currentProjectId;
            await loadMembers();
        } else {
            document.getElementById("memberList").innerHTML =
                '<tr><td colspan="4">Bạn chưa có dự án nào.</td></tr>';
        }

    } catch (error) {
        alert("Không thể tải dự án: " + error.message);
    }
}

// Tai danh sach thanh vien
async function loadMembers() {
    if (!currentProjectId) return;

    try {
        members = await getMembers(currentProjectId);
        displayMembers();

    } catch (error) {
        alert("Không thể tải thành viên: " + error.message);
    }
}

// Hien thi danh sach
function displayMembers(data = members) {
    const memberList = document.getElementById("memberList");

    if (data.length === 0) {
        memberList.innerHTML =
            '<tr><td colspan="4">Không tìm thấy thành viên.</td></tr>';
        return;
    }

    memberList.innerHTML = data.map(member => `
        <tr>
            <td>${escapeHTML(member.full_name)}</td>
            <td>${escapeHTML(member.email)}</td>
            <td>${escapeHTML(getRoleLabel(member.project_role))}</td>
            <td>—</td>
        </tr>
    `).join("");
}

// Mo form them thanh vien
const memberModal = document.getElementById("memberModal");
const memberForm = document.getElementById("memberForm");

document.getElementById("addMemberBtn").addEventListener("click", () => {
    if (!currentProjectId) {
        alert("Vui lòng chọn dự án trước!");
        return;
    }

    memberForm.reset();
    memberModal.style.display = "flex";
});

// Them thanh vien
memberForm.addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("memberEmail").value.trim();
    const role = document.getElementById("memberRole").value;

    try {
        await addMember(currentProjectId, email, role);

        alert("Thêm thành viên thành công!");

        memberModal.style.display = "none";
        memberForm.reset();

        await loadMembers();

    } catch (error) {
        alert("Không thể thêm thành viên: " + error.message);
    }
});

// Tim kiem thanh vien
document.getElementById("memberSearch").addEventListener("input", event => {
    const keyword = event.target.value.toLowerCase();

    const result = members.filter(member =>
        (member.full_name || "").toLowerCase().includes(keyword) ||
        (member.email || "").toLowerCase().includes(keyword)
    );

    displayMembers(result);
});

// Dong form
document.getElementById("cancelMemberBtn").addEventListener("click", () => {
    memberModal.style.display = "none";
    memberForm.reset();
});

// Chuyen du an
document.getElementById("projectSelect").addEventListener("change", async event => {
    currentProjectId = event.target.value || null;

    members = [];

    if (currentProjectId) {
        await loadMembers();
    } else {
        displayMembers();
    }
});

// Khoi dong
document.addEventListener("DOMContentLoaded", async () => {
    if (!localStorage.getItem("token")) {
        alert("Bạn cần đăng nhập trước khi quản lý thành viên!");
        return;
    }

    await loadProjects();
});
