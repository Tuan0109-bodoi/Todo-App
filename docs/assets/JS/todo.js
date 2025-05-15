// Use API_URL from config.js
let API_URL = 'https://todo-app-gpqw.onrender.com'; // Fallback value
document.addEventListener('DOMContentLoaded', function() {
    // Try to get API_URL from config if it exists in global scope
    if (typeof window.API_URL !== 'undefined') {
        API_URL = window.API_URL;
    }
    console.log('Using API URL:', API_URL); // Debugging to confirm API URL
});

// Thêm hàm này vào đầu script
function getAuthToken() {
    return localStorage.getItem('token');
}

// Kiểm tra token ngay khi trang load
document.addEventListener('DOMContentLoaded', () => {
    const token = getAuthToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Thêm các headers authentication cho mọi fetch request
    const originalFetch = window.fetch;
    window.fetch = function() {
        let [url, options = {}] = arguments;
        if (!options.headers) {
            options.headers = {};
        }
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return originalFetch(url, options)
            .then(response => {
                if (response.status === 401) {
                    // Token hết hạn hoặc không hợp lệ
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                    return Promise.reject('Phiên đăng nhập hết hạn');
                }
                return response;
            });
    };
    
    // Thêm nút logout vào UI
    const todoContainer = document.querySelector('.todo-container');
    const header = todoContainer.querySelector('h1');
    
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.classList.add('logout-button');
    logoutBtn.style.position = 'absolute';
    logoutBtn.style.right = '20px';
    logoutBtn.style.top = '20px';
    
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
    
    // Chèn nút logout vào header
    todoContainer.insertBefore(logoutBtn, header);
    
    // Tiếp tục code hiện tại của bạn...

    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const errorMessageElement = document.getElementById('error-message');
    const limitInput = document.getElementById('limit-input'); // Thêm input cho limit
    let searchTimeout;

    const pageInput = document.getElementById('page-input');
    const firstPageBtn = document.getElementById('first_page');
    const lastPageBtn = document.getElementById('last_page');
    const arrowBackBtn = document.getElementById('arrow_back');
    const arrowForwardBtn = document.getElementById('arrow_forward');
    const confirmBtn = document.getElementById('confirm');

    let currentPagination = null;

    // Hàm hiển thị lỗi
    function showError(message) {
        if (!errorMessageElement) {
            console.error('Element error-message không tồn tại!');
            return;
        }
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
        setTimeout(() => {
            errorMessageElement.style.display = 'none';
        }, 3000);
    }

    //  Tạo task mới
    async function createTask(taskname, status = false) {
        try {
            const response = await fetch(`${API_URL}/todo/tasks`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ taskname, status })
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Error: ${response.status}`);
            }
            getTask(); // Refresh the task list
        } catch (error) {
            showError('Không thể tạo công việc mới. Vui lòng kiểm tra kết nối.');
        }
    }

    // Cập nhật hàm getTask() với phân trang
    async function getTask(page = 1, itemsPerPage = 5) {
        try {
            if (limitInput) {
                itemsPerPage = parseInt(limitInput.value) || itemsPerPage;
            }
            const url = `${API_URL}/todo/tasks?page=${page}&limit=${itemsPerPage}`;
            const response = await fetch(url);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Error: ${response.status}`);
            }
            renderTasks(data.data || []);
            if (data.pagination) {
                renderPagination(data.pagination);
            }
        } catch (error) {
            showError('Không thể tải danh sách công việc. Vui lòng kiểm tra kết nối.');
            renderTasks([]);
        }
    }

    function renderPagination(pagination) {
        if (!pagination) return;
        currentPagination = pagination;
        const { current_page, total_pages } = pagination;
        const paginationElement = document.getElementById('pagination');
        if (!paginationElement) return;
        paginationElement.innerHTML = '';
        const maxVisible = 5;
        let startPage, endPage;
        if (total_pages <= maxVisible) {
            startPage = 1;
            endPage = total_pages;
        } else {
            const halfVisible = Math.floor(maxVisible / 2);
            if (current_page <= halfVisible) {
                startPage = 1;
                endPage = maxVisible;
            } else if (current_page + halfVisible >= total_pages) {
                startPage = Math.max(1, total_pages - maxVisible + 1);
                endPage = total_pages;
            } else {
                startPage = current_page - halfVisible;
                endPage = current_page + halfVisible;
            }
        }
        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.textContent = i;
            if (i === current_page) {
                li.classList.add('active');
            }
            li.addEventListener('click', () => {
                getTask(i, pagination.limit);
            });
            paginationElement.appendChild(li);
        }
        updateNavigationButtons(pagination);
        if (pageInput) {
            pageInput.value = current_page;
        }
    }

    function updateNavigationButtons(pagination) {
        const { current_page, total_pages, has_next_page, has_prev_page } = pagination;
        if (firstPageBtn) {
            firstPageBtn.disabled = !has_prev_page;
            firstPageBtn.onclick = () => getTask(1, pagination.limit);
        }
        if (arrowBackBtn) {
            arrowBackBtn.disabled = !has_prev_page;
            arrowBackBtn.onclick = () => getTask(current_page - 1, pagination.limit);
        }
        if (arrowForwardBtn) {
            arrowForwardBtn.disabled = !has_next_page;
            arrowForwardBtn.onclick = () => getTask(current_page + 1, pagination.limit);
        }
        if (lastPageBtn) {
            lastPageBtn.disabled = !has_next_page;
            lastPageBtn.onclick = () => getTask(total_pages, pagination.limit);
        }
    }

    // Hiển thị danh sách task
    function renderTasks(tasks) {
        if (!todoList) return;
        todoList.innerHTML = '';
        if (tasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'Không có công việc nào.';
            emptyMessage.classList.add('empty-message');
            todoList.appendChild(emptyMessage);
        } else {
            tasks.forEach(task => {
                // Debug: log task object để kiểm tra key id
                console.log('Task object:', task);

                const li = document.createElement('li');
                li.classList.add('task-item');
                const taskInfo = document.createElement('div');
                taskInfo.classList.add('task-info');
                const taskContent = document.createElement('div');
                taskContent.textContent = task.taskname;
                taskContent.classList.add('task-content');
                if (task.status) {
                    taskContent.classList.add('done-task');
                }
                const dateInfo = document.createElement('small');
                if (task.createdat) {
                    try {
                        const createdDate = new Date(task.createdat.replace(' ', 'T'));
                        if (!isNaN(createdDate.getTime())) {
                            const formatter = new Intl.DateTimeFormat('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            dateInfo.textContent = `Thêm vào: ${formatter.format(createdDate)}`;
                        } else {
                            dateInfo.textContent = 'Thêm vào: Không xác định';
                        }
                    } catch (error) {
                        dateInfo.textContent = 'Thêm vào: Không xác định';
                    }
                } else {
                    dateInfo.textContent = 'Thêm vào: Không xác định';
                }
                dateInfo.classList.add('task-date');
                taskInfo.appendChild(taskContent);
                taskInfo.appendChild(dateInfo);
                const actionContainer = document.createElement('div');
                actionContainer.classList.add('action-container');
                const editBtn = document.createElement('button');
                editBtn.className = 'action-icon edit-icon';
                editBtn.innerHTML = '<span class="material-symbols-outlined">edit</span>';
                editBtn.title = 'Sửa';
                if (!task.id) {
                    console.error('Task không có id:', task);
                }
                editBtn.addEventListener('click', () => editTask(li, task));
                const doneBtn = document.createElement('button');
                doneBtn.className = 'action-icon done-icon';
                doneBtn.innerHTML = task.status
                    ? '<span class="material-symbols-outlined">replay</span>'
                    : '<span class="material-symbols-outlined">check</span>';
                doneBtn.title = task.status ? 'Hoàn tác' : 'Hoàn thành';
                if (task.status) {
                    doneBtn.classList.add('undone');
                }
                doneBtn.addEventListener('click', () => doneTask(task.id, li, task));
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'action-icon delete-icon';
                deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
                deleteBtn.title = 'Xóa';
                deleteBtn.addEventListener('click', () => deleteTask(task.id, li));
                actionContainer.append(editBtn, doneBtn, deleteBtn);
                li.appendChild(taskInfo);
                li.appendChild(actionContainer);
                todoList.appendChild(li);
            });
        }
    }

    // Hàm xử lý lọc tasks
    async function filterTasks(page = 1, itemsPerPage = 5) {
        try {
            if (limitInput) {
                itemsPerPage = parseInt(limitInput.value) || itemsPerPage;
            }
            let status;
            if (statusFilter) {
                switch (statusFilter.value) {
                    case 'completed':
                        status = 1;
                        break;
                    case 'uncompleted':
                        status = 0;
                        break;
                    default:
                        status = null;
                }
            } else {
                status = null;
            }
            const searchKeyword = searchInput ? searchInput.value.trim() || null : null;
            const response = await fetch(`${API_URL}/todo/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskname: searchKeyword,
                    status: status,
                    page: page,
                    limit: itemsPerPage
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Error: ${response.status}`);
            }
            renderTasks(data.data || []);
            if (data.pagination) {
                renderPagination(data.pagination);
            }
        } catch (error) {
            showError('Không thể lọc danh sách công việc. Vui lòng kiểm tra kết nối.');
            renderTasks([]);
        }
    }

    //  Chỉnh sửa task bằng cách nhập vào input
    function editTask(liElement, task) {
        const taskContent = liElement.querySelector('.task-content');
        if (!taskContent) return;
        const input = document.createElement("input");
        input.type = "text";
        input.value = task.taskname;
        input.classList.add("edit-input");
        const oldContent = taskContent.textContent;
        taskContent.textContent = '';
        taskContent.appendChild(input);
        input.focus();
        input.addEventListener("keypress", async (e) => {
            if (e.key === "Enter") {
                const newTaskName = input.value.trim();
                if (newTaskName && newTaskName !== task.taskname) {
                    const success = await updateTask(task.id, newTaskName, task.status);
                    if (success) {
                        getTask(currentPagination ? currentPagination.current_page : 1);
                    } else {
                        taskContent.textContent = oldContent;
                    }
                } else {
                    taskContent.textContent = oldContent;
                }
            }
        });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                taskContent.textContent = oldContent;
            }
        });
        input.addEventListener("blur", () => {
            taskContent.textContent = oldContent;
        });
    }

    // Đánh dấu task hoàn thành
    async function doneTask(id, liElement, task) {
        if (!id) {
            showError('Không tìm thấy ID công việc!');
            return;
        }
        try {
            const newStatus = !task.status;
            const response = await fetch(`${API_URL}/todo/tasks/${id}`, { 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, taskname: task.taskname, status: newStatus })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Error: ${response.status}`);
            }
            setTimeout(() => {
                getTask(currentPagination ? currentPagination.current_page : 1);
            }, 200);
        } catch (error) {
            showError('Không thể cập nhật trạng thái công việc. Vui lòng kiểm tra kết nối.');
        }
    }

    //  Xóa task (có hộp thoại xác nhận)
    async function deleteTask(id, liElement) {
        const confirmDelete = confirm("Bạn có chắc muốn xóa công việc này?");
        if (!confirmDelete) return;
        try {
            const response = await fetch(`${API_URL}/todo/tasks/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Error: ${response.status}`);
            }
            liElement.classList.add('removing');
            setTimeout(() => {
                liElement.remove();
            }, 300);
            setTimeout(() => {
                getTask(currentPagination ? currentPagination.current_page : 1);
            }, 500);
        } catch (error) {
            showError('Không thể xóa công việc. Vui lòng kiểm tra kết nối.');
        }
    }

    // Cập nhật task (sử dụng khi sửa nội dung)
    async function updateTask(id, taskname, status) {
        try {
            const response = await fetch(`${API_URL}/todo/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, taskname, status })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Error: ${response.status}`);
            }
            return true;
        } catch (error) {
            showError('Không thể cập nhật công việc. Vui lòng kiểm tra kết nối.');
            return false;
        }
    }

    // Thiết lập các event listener
    if (todoForm) {
        todoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!todoInput) return;
            const taskText = todoInput.value.trim();
            if (!taskText) return;
            await createTask(taskText, false);
            todoInput.value = '';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            searchTimeout = setTimeout(() => {
                filterTasks();
            }, 200); // Reduced timeout to 200ms
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            filterTasks();
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            getTask(1);
        });
    }

    // Khởi tạo ban đầu - lấy tất cả task
    getTask();
});
