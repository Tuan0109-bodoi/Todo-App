// Use API_URL from config.js
let API_URL = 'https://todo-app-gpqw.onrender.com'; // Fallback value

document.addEventListener('DOMContentLoaded', () => {
    // Try to get API_URL from config if it exists in global scope
    if (typeof window.API_URL !== 'undefined') {
        API_URL = window.API_URL;
    }
    
    // Lấy token từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
        showErrorMessage('Liên kết không hợp lệ hoặc đã hết hạn.');
        disableForm();
        return;
    }
    
    const resetForm = document.querySelector('.reset-password-container');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    const resetButton = document.querySelector('.reset-button');
    
    resetButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const password = passwordInputs[0].value.trim();
        const confirmPassword = passwordInputs[1].value.trim();
        
        // Kiểm tra mật khẩu
        if (!password || !confirmPassword) {
            showErrorMessage('Vui lòng nhập đầy đủ mật khẩu mới.');
            return;
        }
        
        if (password !== confirmPassword) {
            showErrorMessage('Mật khẩu không khớp.');
            return;
        }
        
        if (password.length < 6) {
            showErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newPassword: password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Không thể đặt lại mật khẩu');
            }
            
            showSuccessMessage('Đặt lại mật khẩu thành công! Đang chuyển hướng...');
            
            // Chuyển hướng đến trang đăng nhập sau 2 giây
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            showErrorMessage(error.message);
        }
    });
    
    function showErrorMessage(message) {
        const errorMessage = document.querySelector('.error-message');
        const successMessage = document.querySelector('.success-message');
        
        successMessage.style.display = 'none';
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.className = 'error-message message';
    }
    
    function showSuccessMessage(message) {
        const errorMessage = document.querySelector('.error-message');
        const successMessage = document.querySelector('.success-message');
        
        errorMessage.style.display = 'none';
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        successMessage.className = 'success-message message';
    }
    
    function disableForm() {
        const inputs = document.querySelectorAll('.input-field');
        const button = document.querySelector('.reset-button');
        
        inputs.forEach(input => {
            input.disabled = true;
        });
        
        button.disabled = true;
    }
    
    // Check if we're on the forgot password page
    if (document.querySelector('.forgotpass-container') && !document.querySelector('.reset-password-container')) {
        initForgotPasswordForm();
    }
});

function initForgotPasswordForm() {
    const forgotForm = document.querySelector('.auth-body');
    const emailInput = document.querySelector('input[type="email"]');
    const resetButton = document.querySelector('.forgotpass-button');

    // Kiểm tra xem có phải đang hiển thị thông báo lỗi từ URL không
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
        showErrorMessage(decodeURIComponent(error));
    }

    resetButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email) {
            showErrorMessage('Vui lòng nhập email của bạn!');
            return;
        }
        
        // Kiểm tra định dạng email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showErrorMessage('Email không hợp lệ!');
            return;
        }

        try {
            // Hiển thị trạng thái đang xử lý
            resetButton.textContent = 'Đang xử lý...';
            resetButton.disabled = true;
            
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Không thể gửi yêu cầu đặt lại mật khẩu');
            }
            
            // Hiển thị thông báo thành công
            showSuccessMessage('Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn!');
            
            // Xóa input email
            emailInput.value = '';
            
        } catch (error) {
            showErrorMessage(error.message);
        } finally {
            // Khôi phục nút reset
            resetButton.textContent = 'Reset Password';
            resetButton.disabled = false;
        }
    });
    
    function showSuccessMessage(message) {
        const existingMessage = document.querySelector('.error-message, .success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message message';
        successDiv.textContent = message;
        
        // Thêm vào đầu form
        forgotForm.insertBefore(successDiv, forgotForm.firstChild);
    }
    
    function showErrorMessage(message) {
        const existingMessage = document.querySelector('.error-message, .success-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message message';
        errorDiv.textContent = message;
        
        // Thêm vào đầu form
        forgotForm.insertBefore(errorDiv, forgotForm.firstChild);
        
        // Không sử dụng setTimeout để ẩn, message sẽ hiển thị cho đến khi người dùng sửa lỗi
    }
}