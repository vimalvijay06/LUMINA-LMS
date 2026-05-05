import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const user = getCurrentUser();
    const dropdownRef = useRef(null);

    const loadNotifications = () => {
        if (user) {
            setNotifications([{
                id: 'system-1',
                message: 'System running on robust PostgreSQL Backend.',
                read: false,
                date: new Date().toISOString(),
                type: 'SUCCESS'
            }]);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, [user?.id]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'SUCCESS': return 'bg-green-100 text-green-700 border-green-200';
            case 'WARNING': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'ERROR': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-blue-50 text-blue-700 border-blue-100';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 relative transition-colors"
                title="Notifications"
            >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 text-sm">Notifications</h3>
                        <span className="text-xs text-gray-500">{unreadCount} unread</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                <Bell className="mx-auto w-8 h-8 opacity-20 mb-2" />
                                No notifications yet
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-3 text-sm hover:bg-gray-50 transition-colors relative group ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                            <div className="flex-1">
                                                <p className="text-gray-800 leading-snug">{notif.message}</p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {!notif.read && (
                                                        <button
                                                            onClick={() => handleMarkRead(notif.id)}
                                                            className="text-[10px] text-indigo-600 font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Mark Read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
