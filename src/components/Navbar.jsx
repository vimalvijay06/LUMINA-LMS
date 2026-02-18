import { useNavigate } from 'react-router-dom';
import { logoutUser, getCurrentUser } from '../utils/auth';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
    const user = getCurrentUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate('/', { replace: true });
    };

    return (
        <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100 px-6 py-3 flex justify-between items-center">
            {/* Brand */}
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                    Lumina <span className="text-indigo-600">Library</span>
                </h2>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider border border-gray-200 ml-2">
                    {user?.role} Portal
                </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-5">
                {/* Notifications */}
                <div className="border-r border-gray-200 pr-5">
                    <NotificationCenter />
                </div>

                {/* User info */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-gray-800">{user?.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{user?.email}</div>
                    </div>
                    <img
                        src={user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=random`}
                        alt="avatar"
                        className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover bg-gray-100"
                    />
                </div>

                {/* Sign out */}
                <button
                    onClick={handleLogout}
                    className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                >
                    Sign Out
                </button>
            </div>
        </nav>
    );
}
