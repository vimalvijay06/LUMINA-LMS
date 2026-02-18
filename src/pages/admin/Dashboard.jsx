import { useEffect, useState } from 'react';
import { db } from '../../utils/mockData';
import { Book, Users, Repeat, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className={`p-6 bg-white rounded-xl shadow-sm border-l-4 ${color} flex items-start justify-between transform transition hover:scale-105 duration-200`}>
        <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
            {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg shadow-inner ${color.replace('border-', 'bg-').replace('500', '50')}`}>
            <Icon className={`w-6 h-6 ${color.replace('border-', 'text-')}`} />
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalMembers: 0,
        issuedBooks: 0,
        overdueBooks: 0
    });

    useEffect(() => {
        // Calculate stats on mount
        const books = db.books || [];
        const users = db.users || [];

        const issued = books.filter(b => b.status === 'ISSUED').length;
        const overdue = books.filter(b => {
            if (b.status !== 'ISSUED' || !b.dueDate) return false;
            return new Date(b.dueDate) < new Date();
        }).length;

        setStats({
            totalBooks: books.length,
            totalMembers: users.filter(u => u.role === 'MEMBER').length,
            issuedBooks: issued,
            overdueBooks: overdue
        });
    }, []);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">Hello, Admin 👋</h1>
                <p className="text-gray-500 mt-2">Here's what's happening in your library today.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Books"
                    value={stats.totalBooks}
                    icon={Book}
                    color="border-blue-500"
                    subtext="Available in library"
                />
                <StatCard
                    title="Active Members"
                    value={stats.totalMembers}
                    icon={Users}
                    color="border-emerald-500"
                    subtext="Registered users"
                />
                <StatCard
                    title="Books Issued"
                    value={stats.issuedBooks}
                    icon={Repeat}
                    color="border-purple-500"
                    subtext="Currently with members"
                />
                <StatCard
                    title="Overdue"
                    value={stats.overdueBooks}
                    icon={AlertCircle}
                    color="border-red-500"
                    subtext="Books needing return"
                />
            </div>

            {/* Recent Activity or Quick Actions could go here */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 bg-indigo-50 rounded-lg text-indigo-700 font-medium hover:bg-indigo-100 transition text-left">
                            + Add New Book
                        </button>
                        <button className="p-4 bg-emerald-50 rounded-lg text-emerald-700 font-medium hover:bg-emerald-100 transition text-left">
                            + Register Member
                        </button>
                        <button className="p-4 bg-orange-50 rounded-lg text-orange-700 font-medium hover:bg-orange-100 transition text-left">
                            Issue Book
                        </button>
                        <button className="p-4 bg-purple-50 rounded-lg text-purple-700 font-medium hover:bg-purple-100 transition text-left">
                            Return Book
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
