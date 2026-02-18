import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Book, Users, Repeat, ClipboardList, Grid, User } from 'lucide-react';

const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Books', path: '/admin/manage-books', icon: Book },
    { name: 'Manage Members', path: '/admin/manage-members', icon: Users },
    { name: 'Issue / Returns', path: '/admin/issue-return', icon: Repeat },
    { name: 'Circulation', path: '/admin/booking-requests', icon: ClipboardList },
    { name: 'Rack Layout', path: '/admin/rack-layout', icon: Grid },
    { name: 'Profile', path: '/admin/profile', icon: User },
];

const memberLinks = [
    { name: 'Dashboard', path: '/member/dashboard', icon: LayoutDashboard },
    { name: 'Search Books', path: '/member/search-books', icon: Book },
    { name: 'My Profile', path: '/member/profile', icon: User },
];

const Sidebar = ({ role }) => {
    const links = role === 'ADMIN' ? adminLinks : memberLinks;

    return (
        <aside
            className="w-64 bg-slate-900 text-white flex flex-col shadow-xl"
            style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 20 }}
        >
            {/* Logo */}
            <div className="p-6 border-b border-slate-800 flex-shrink-0">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Lumina LMS
                </h2>
                <p className="text-slate-500 text-xs mt-1">Library Management System</p>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {links.map(({ name, path, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <Icon size={18} />
                        <span>{name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 flex-shrink-0">
                <p className="text-xs text-slate-500 text-center">© 2026 Lumina Library</p>
            </div>
        </aside>
    );
};

export default Sidebar;
