class Auth {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.updateAuthUI();
    }

    register(userData) {
        const users = this.getUsers();
        
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }

        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            password: userData.password,
            createdAt: new Date().toISOString(),
            orders: []
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        this.login(userData.email, userData.password);
        
        return { success: true, message: 'Регистрация успешна', user: newUser };
    }

    login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, message: 'Неверный email или пароль' };
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
        this.updateAuthUI();

        return { success: true, message: 'Вход выполнен успешно', user: user };
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.updateAuthUI();
        return { success: true, message: 'Выход выполнен успешно' };
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    getUsers() {
        const usersStr = localStorage.getItem('users');
        return usersStr ? JSON.parse(usersStr) : [];
    }

    updateUser(userData) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);

        if (userIndex === -1) return { success: false, message: 'Пользователь не найден' };

        users[userIndex] = { ...users[userIndex], ...userData };
        localStorage.setItem('users', JSON.stringify(users));

        this.currentUser = { ...this.currentUser, ...userData };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.updateAuthUI();

        return { success: true, message: 'Данные обновлены', user: this.currentUser };
    }

    addOrder(orderData) {
        if (!this.currentUser) return { success: false, message: 'Пользователь не авторизован' };

        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);

        if (userIndex === -1) return { success: false, message: 'Пользователь не найден' };

        const order = {
            id: Date.now().toString(),
            ...orderData,
            date: new Date().toISOString()
        };

        if (!users[userIndex].orders) {
            users[userIndex].orders = [];
        }

        users[userIndex].orders.push(order);
        localStorage.setItem('users', JSON.stringify(users));

        this.currentUser.orders = users[userIndex].orders;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        return { success: true, message: 'Заказ добавлен в историю', order: order };
    }

    updateAuthUI() {
        const profileButtons = document.querySelectorAll('.profile-btn');
        const loginButtons = document.querySelectorAll('.login-btn');
        const userInfo = document.querySelectorAll('.user-info');

        if (this.currentUser) {
            profileButtons.forEach(btn => {
                btn.style.display = 'flex';
                btn.setAttribute('title', this.currentUser.name);
            });
            loginButtons.forEach(btn => btn.style.display = 'none');
            userInfo.forEach(info => {
                if (info.querySelector('.user-name')) {
                    info.querySelector('.user-name').textContent = this.currentUser.name;
                }
            });
        } else {
            profileButtons.forEach(btn => btn.style.display = 'none');
            loginButtons.forEach(btn => btn.style.display = 'flex');
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }
}

let auth;
document.addEventListener('DOMContentLoaded', () => {
    auth = new Auth();
});

