import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = getCurrentUser();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'MEMBER') return <Navigate to="/member/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
