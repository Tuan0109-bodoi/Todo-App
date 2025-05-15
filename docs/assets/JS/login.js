// Use API_URL from config.js
let API_URL = 'https://todo-app-gpqw.onrender.com'; // Fallback value

document.addEventListener('DOMContentLoaded', () => {
    // Try to get API_URL from config if it exists in global scope
    if (typeof window.API_URL !== 'undefined') {
        API_URL = window.API_URL;
    }
    
    const loginContainer = document.querySelector('.login-container');
    const usernameInput = document.querySelector('input[type="text"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const loginButton = document.querySelector('.login-button');
    
    // Thay input placeholder để hiển thị rõ hơn
    document.querySelector('.input-field[type="text"]').placeholder = 'Username hoặc Email';

    // Thêm thông báo giúp người dùng hiểu rõ hơn
    const helpText = document.createElement('div');
    helpText.style.fontSize = '12px';
    helpText.style.color = '#666';
    helpText.style.marginTop = '5px';
    helpText.style.textAlign = 'left';

    const firstInputGroup = document.querySelector('.input-group');
    firstInputGroup.appendChild(helpText);

    loginButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;
        
        if (!username || !password) {
            showErrorMessage('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    rememberMe
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Đăng nhập thất bại');
            }
            
            // Lưu token vào localStorage
            localStorage.setItem('token', data.token);

            if (rememberMe) {
                localStorage.setItem('rememberMe', JSON.stringify({ username, password }));
            } else {
                localStorage.removeItem('rememberMe');
            }
            
            // Hiển thị thông báo thành công
            showSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');
            
            // Chuyển hướng đến trang todo
            setTimeout(() => {
                window.location.href = 'todo.html';
            }, 200); // Reduced timeout to 200ms
            
        } catch (error) {
            showErrorMessage(error.message);
        }
    });

    
    function showErrorMessage(message) {
        // Xóa thông báo cũ nếu có
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Tạo thông báo lỗi mới
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message message';
        errorDiv.textContent = message;
        
        // Thêm vào đầu form
        const loginBody = document.querySelector('.login-body');
        loginBody.insertBefore(errorDiv, loginBody.firstChild);
        
        // Không sử dụng setTimeout để ẩn, message sẽ hiển thị cho đến khi người dùng sửa lỗi
    }
    
    function showSuccessMessage(message) {
        // Xóa thông báo cũ
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        // Tạo thông báo thành công
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message message';
        successDiv.textContent = message;
        
        // Thêm vào đầu form body
        const loginBody = document.querySelector('.login-body');
        if (loginBody) {
            loginBody.insertBefore(successDiv, loginBody.firstChild);
        }
    }
});