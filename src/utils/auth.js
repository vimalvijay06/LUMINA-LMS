// Auth Utility — reads/writes the logged-in user from localStorage

export const getCurrentUser = () => {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const loginUser = (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    if (token) localStorage.setItem('token', token);
};

export const logoutUser = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

export const isAuthenticated = () => {
    return !!getCurrentUser() && !!getToken();
};

// Global Fetch Wrapper to include Token
export const secureFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = { 
        ...options.headers,
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, { ...options, headers });
};
