import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { getCurrentUser } from '../utils/auth';

export default function AppLayout({ allowedRoles }) {
    const user = getCurrentUser();
    const location = useLocation();

    // Not logged in → go to landing
    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Wrong role → redirect to correct portal
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const dest = user.role === 'ADMIN' ? '/admin/dashboard' : '/member/dashboard';
        return <Navigate to={dest} replace />;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Fixed sidebar — 256px wide */}
            <Sidebar role={user.role} />

            {/* Content area — pushed right by sidebar */}
            <div className="flex flex-col flex-1 min-h-screen" style={{ marginLeft: '256px' }}>
                <Navbar user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    {/* React Router v6 Outlet — renders the matched child route */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
