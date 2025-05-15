// Use API_URL from config.js
let API_URL = 'https://todo-app-gpqw.onrender.com'; // Fallback value

document.addEventListener('DOMContentLoaded', () => {
    // Try to get API_URL from config if it exists in global scope
    if (typeof window.API_URL !== 'undefined') {
        API_URL = window.API_URL;
    }
    
    const registerForm = document.querySelector('.register-container');
    const emailInput = document.querySelector('input[type="email"]');
    const usernameInput = document.querySelector('input[type="text"]');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const registerButton = document.querySelector('.register-button');
    
    
    registerButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInputs[0].value.trim();
        const confirmPassword = passwordInputs[1].value.trim();
        
        // Kiểm tra các trường
        if (!email || !username || !password || !confirmPassword) {
            showErrorMessage('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        
        // Kiểm tra email hợp lệ
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showErrorMessage('Email không hợp lệ!');
            return;
        }
        
        // Kiểm tra mật khẩu khớp
        if (password !== confirmPassword) {
            showErrorMessage('Mật khẩu không khớp!');
            return;
        }

        // Kiểm tra mật khẩu hợp lệ
        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
            showErrorMessage('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/register`, { // Thay đổi URL từ localhost sang biến API_URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                if (data.error.includes('email')) {
                    throw new Error('Email đã tồn tại!');
                } else if (data.error.includes('username')) {
                    throw new Error('Tên đăng nhập đã tồn tại!');
                } else {
                    throw new Error(data.error || 'Đăng ký thất bại');
                }
            }
            
            // Hiển thị thông báo thành công
            showSuccessMessage('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
            
            // Chuyển hướng đến trang đăng nhập sau 200ms
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 200);
            
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
        const authBody = registerForm.querySelector('.auth-body');
        authBody.insertBefore(errorDiv, authBody.firstChild);
    }
    
    function showSuccessMessage(message) {
        // Xóa thông báo cũ nếu có
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Tạo thông báo thành công mới
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message message';
        successDiv.style.backgroundColor = '#d4edda';
        successDiv.style.color = '#155724';
        successDiv.style.padding = '10px';
        successDiv.style.borderRadius = '4px';
        successDiv.style.marginBottom = '15px';
        successDiv.style.textAlign = 'center';
        successDiv.textContent = message;
        
        // Thêm vào đầu form
        const authBody = registerForm.querySelector('.auth-body');
        authBody.insertBefore(successDiv, authBody.firstChild);
    }
});