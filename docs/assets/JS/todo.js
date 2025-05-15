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
    // Thêm biến để lưu timeout
    let searchTimeout;

    // Thêm dòng này sau các biến khác ở đầu file
    const pageInput = document.getElementById('page-input');
    const firstPageBtn = document.getElementById('first_page');
    const lastPageBtn = document.getElementById('last_page');
    const arrowBackBtn = document.getElementById('arrow_back');
    const arrowForwardBtn = document.getElementById('arrow_forward');
    const confirmBtn = document.getElementById('confirm');

    // Loại bỏ định nghĩa API_BASE và API_URL trùng lặp (dòng 231-232):
    // const API_BASE = 'https://todo-app-gpqw.onrender.com';
    // const API_URL = API_BASE;

    // Vì đã có biến API_URL từ config.js

    // Thêm biến này để lưu thông tin phân trang hiện tại
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
            const response = await fetch(`${API_URL}/todo/tasks`, { // UPDATED
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskname, status })
            });
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            getTask(); // Sử dụng getTask thay vì filterTasks để đảm bảo
        } catch (error) {
            console.error('Lỗi khi tạo task:', error);
            showError('Không thể tạo công việc mới. Vui lòng kiểm tra kết nối.');
        }
    }

    // Cập nhật hàm getTask() với phân trang
    async function getTask(page = 1, itemsPerPage = 5) {
        try {
            // Lấy limit từ input nếu có
            if (limitInput) {
                itemsPerPage = parseInt(limitInput.value) || itemsPerPage;
            }

            // Tạo URL có tham số phân trang - UPDATED
            const url = `${API_URL}/todo/tasks?page=${page}&limit=${itemsPerPage}`;

            // Gọi API
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error: ${response.status}`);

            // Xử lý response
            const result = await response.json();

            // Render danh sách task
            renderTasks(result.data || []);

            // Render UI phân trang
            if (result.pagination) {
                renderPagination(result.pagination);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách task:', error);
            showError('Không thể tải danh sách công việc. Vui lòng kiểm tra kết nối.');
            renderTasks([]); // Hiển thị danh sách rỗng nếu có lỗi
        }
    }
    function renderPagination(pagination) {
        if (!pagination) return;

        // Lưu lại thông tin phân trang hiện tại
        currentPagination = pagination;

        const { current_page, total_pages } = pagination;
        const paginationElement = document.getElementById('pagination');
        if (!paginationElement) return;

        paginationElement.innerHTML = '';
        const maxVisible = 5;
        let startPage, endPage;

        if (total_pages <= maxVisible) {
            // Nếu tổng số trang ít hơn maxVisible, hiển thị tất cả
            startPage = 1;
            endPage = total_pages;
        }
        else {
            // Sửa lại dòng này - xác định một nửa của số trang hiển thị
            const halfVisible = Math.floor(maxVisible / 2);

            if (current_page <= halfVisible) {
                // Gần đầu danh sách
                startPage = 1;
                endPage = maxVisible;
            }
            else if (current_page + halfVisible >= total_pages) {
                // Gần cuối danh sách
                startPage = Math.max(1, total_pages - maxVisible + 1);
                endPage = total_pages;
            }
            else {
                // Ở giữa
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

        // Cập nhật trạng thái và sự kiện cho các nút điều hướng
        updateNavigationButtons(pagination);

        // Cập nhật input trang hiện tại nếu có
        if (pageInput) {
            pageInput.value = current_page;
        }

    }

    // Thêm hàm này sau hàm renderPagination
    function updateNavigationButtons(pagination) {
        const { current_page, total_pages, has_next_page, has_prev_page } = pagination;

        // First page button
        if (firstPageBtn) {
            firstPageBtn.disabled = !has_prev_page;
            firstPageBtn.onclick = () => getTask(1, pagination.limit);
        }

        // Previous page button
        if (arrowBackBtn) {
            arrowBackBtn.disabled = !has_prev_page;
            arrowBackBtn.onclick = () => getTask(current_page - 1, pagination.limit);
        }

        // Next page button
        if (arrowForwardBtn) {
            arrowForwardBtn.disabled = !has_next_page;
            arrowForwardBtn.onclick = () => getTask(current_page + 1, pagination.limit);
        }

        // Last page button
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
            // Render tất cả tasks
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.classList.add('task-item');

                // Tạo container cho phần thông tin task
                const taskInfo = document.createElement('div');
                taskInfo.classList.add('task-info');

                // Task content và date vào task-info
                const taskContent = document.createElement('div');
                taskContent.textContent = task.TaskName;
                taskContent.classList.add('task-content');
                if (task.Status) {
                    taskContent.classList.add('done-task');
                }

                const dateInfo = document.createElement('small');
                if (task.createdAt) {
                    try {
                        const createdDate = new Date(task.createdAt.replace(' ', 'T'));
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
                        console.error('Lỗi khi xử lý ngày tháng:', error);
                        dateInfo.textContent = 'Thêm vào: Không xác định';
                    }
                } else {
                    dateInfo.textContent = 'Thêm vào: Không xác định';
                }
                dateInfo.classList.add('task-date');

                // Thêm content và date vào taskInfo
                taskInfo.appendChild(taskContent);
                taskInfo.appendChild(dateInfo);

                // Thay thế đoạn code hiện tại với đoạn này
                const actionContainer = document.createElement('div');
                actionContainer.classList.add('action-container');

                // Nút Edit - màu cam
                const editBtn = document.createElement('button');
                editBtn.className = 'action-icon edit-icon';
                editBtn.innerHTML = '<span class="material-symbols-outlined">edit</span>';
                editBtn.title = 'Sửa';
                editBtn.addEventListener('click', () => editTask(li, task));

                // Nút Done/Undone - màu xanh lá
                const doneBtn = document.createElement('button');
                doneBtn.className = 'action-icon done-icon';
                doneBtn.innerHTML = task.Status 
                    ? '<span class="material-symbols-outlined">replay</span>' 
                    : '<span class="material-symbols-outlined">check</span>';
                doneBtn.title = task.Status ? 'Hoàn tác' : 'Hoàn thành';
                if (task.Status) {
                    doneBtn.classList.add('undone');
                }
                doneBtn.addEventListener('click', () => doneTask(task.ID, li, task));

                // Nút Delete - màu đỏ
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'action-icon delete-icon';
                deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
                deleteBtn.title = 'Xóa';
                deleteBtn.addEventListener('click', () => deleteTask(task.ID, li));

                // Thay đổi thứ tự các nút: Edit, Done, Delete
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
            // Lấy limit từ input nếu có
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

            const response = await fetch(`${API_URL}/todo/search`, { // UPDATED
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskname: searchKeyword,
                    status: status,
                    page: page,
                    limit: itemsPerPage
                })
            });

            if (!response.ok) throw new Error(`Error ${response.status}`);

            const result = await response.json();
            renderTasks(result.data || []);

            // Render phân trang nếu có
            if (result.pagination) {
                renderPagination(result.pagination);
            }
        } catch (error) {
            console.error('Lỗi khi lọc tasks:', error);
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
        input.value = task.TaskName;
        input.classList.add("edit-input");

        const oldContent = taskContent.textContent;
        taskContent.textContent = '';
        taskContent.appendChild(input);
        input.focus();

        // Xử lý khi nhấn Enter
        input.addEventListener("keypress", async (e) => {
            if (e.key === "Enter") {
                const newTaskName = input.value.trim();
                if (newTaskName && newTaskName !== task.TaskName) {
                    await updateTask(task.ID, newTaskName, task.Status);
                    getTask(currentPagination ? currentPagination.current_page : 1);
                } else {
                    taskContent.textContent = oldContent;
                }
            }
        });

        // Xử lý khi nhấn Escape hoặc click ra ngoài
        input.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                taskContent.textContent = oldContent;
            }
        });

        // Xử lý khi click ra ngoài
        input.addEventListener("blur", () => {
            taskContent.textContent = oldContent;
        });
    }

    // Đánh dấu task hoàn thành
    async function doneTask(id, liElement, task) {
        try {
            const newStatus = !task.Status;
            const response = await fetch(`${API_URL}/todo/tasks/${id}`, { // UPDATED
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, taskname: task.TaskName, status: newStatus })
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            // Cập nhật UI trước khi reload
            const taskContent = liElement.querySelector('.task-content');
            const doneBtn = liElement.querySelector('.done-icon');

            if (newStatus) {
                taskContent.classList.add('done-task');
                // Cập nhật icon thay vì text
                doneBtn.innerHTML = '<span class="material-symbols-outlined">replay</span>';
                doneBtn.title = 'Hoàn tác';
            } else {
                taskContent.classList.remove('done-task');
                doneBtn.innerHTML = '<span class="material-symbols-outlined">check</span>';
                doneBtn.title = 'Hoàn thành';
            }

            // Sau đó reload để đảm bảo đồng bộ
            setTimeout(() => {
                getTask(currentPagination ? currentPagination.current_page : 1);
            }, 200);
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái task:', error);
            showError('Không thể cập nhật trạng thái công việc. Vui lòng kiểm tra kết nối.');
        }
    }

    //  Xóa task (có hộp thoại xác nhận)
    async function deleteTask(id, liElement) {
        const confirmDelete = confirm("Bạn có chắc muốn xóa công việc này?");
        if (!confirmDelete) return;
        try {
            const response = await fetch(`${API_URL}/todo/tasks/${id}`, { // UPDATED
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            // Hiệu ứng mượt
            liElement.classList.add('removing');
            setTimeout(() => {
                liElement.remove();
            }, 300);

            // Sau khi xóa, gọi lại getTask để áp dụng filter hiện tại
            setTimeout(() => {
                getTask(currentPagination ? currentPagination.current_page : 1);
            }, 3000);
        } catch (error) {
            console.error('Lỗi khi xóa task:', error);
            showError('Không thể xóa công việc. Vui lòng kiểm tra kết nối.');
        }
    }

    // Cập nhật task (sử dụng khi sửa nội dung)
    async function updateTask(id, taskname, status) {
        try {
            const response = await fetch(`${API_URL}/todo/tasks/${id}`, { // UPDATED
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, taskname, status })
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return true;
        } catch (error) {
            console.error('Lỗi khi cập nhật task:', error);
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
            // Clear timeout cũ nếu có
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            searchTimeout = setTimeout(() => {
                filterTasks();
            }, 3000);
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            filterTasks();
        });
    }

    // Thêm event listener cho nút Confirm
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            getTask(1); // Reset về trang 1 khi thay đổi limit
        });
    }

    // Khởi tạo ban đầu - lấy tất cả task
    getTask();
});
