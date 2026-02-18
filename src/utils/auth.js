// Auth Utility — reads/writes the logged-in user from localStorage

export const getCurrentUser = () => {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const loginUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

export const logoutUser = () => {
    localStorage.removeItem('user');
};

export const isAuthenticated = () => {
    return !!getCurrentUser();
};
