document.addEventListener('DOMContentLoaded', () => {
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
            
            // Hiển thị thông báo thành công
            showSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');
            
            // Chuyển hướng đến trang todo
            setTimeout(() => {
                window.location.href = 'todo.html';
            }, 1000);
            
        } catch (error) {
            showErrorMessage(error.message);
        }
    });
    
    function showErrorMessage(message) {
        // Xóa thông báo cũ nếu có
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        // Tạo thông báo lỗi mới
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message message';
        errorDiv.style.backgroundColor = '#f8d7da';
        errorDiv.style.color = '#721c24';
        errorDiv.style.padding = '10px';
        errorDiv.style.borderRadius = '4px';
        errorDiv.style.marginBottom = '15px';
        errorDiv.style.textAlign = 'center';
        errorDiv.textContent = message;
        
        // Thêm vào đầu form body
        const loginBody = document.querySelector('.login-body');
        if (loginBody) {
            loginBody.insertBefore(errorDiv, loginBody.firstChild);
        }
        
        // Ẩn sau 3 giây
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
    
    function showSuccessMessage(message) {
        // Xóa thông báo cũ
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        // Tạo thông báo thành công
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message message';
        successDiv.style.backgroundColor = '#d4edda';
        successDiv.style.color = '#155724';
        successDiv.style.padding = '10px';
        successDiv.style.borderRadius = '4px';
        successDiv.style.marginBottom = '15px';
        successDiv.style.textAlign = 'center';
        successDiv.textContent = message;
        
        // Thêm vào đầu form body
        const loginBody = document.querySelector('.login-body');
        if (loginBody) {
            loginBody.insertBefore(successDiv, loginBody.firstChild);
        }
    }
});