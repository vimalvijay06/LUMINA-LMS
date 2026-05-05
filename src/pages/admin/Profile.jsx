import { useState, useEffect } from 'react';
import { getCurrentUser, secureFetch } from '../../utils/auth';
import { User, Mail, MapPin, Building, Phone, BadgeCheck, Activity, BookOpen, Users, Clock } from 'lucide-react';

const AdminProfile = () => {
    const sessionUser = getCurrentUser();
    const user = sessionUser;

    const [stats, setStats] = useState({
        totalBooks: 0,
        totalMembers: 0,
        issuedBooks: 0,
        overdueBooks: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await secureFetch(`${import.meta.env.VITE_API_URL}/stats`);
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error("Failed to load stats", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <User className="text-indigo-600" /> My Profile
            </h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 h-40 relative">
                    <div className="absolute -bottom-16 left-8 p-1 bg-white rounded-full shadow-lg">
                        <img
                            src={user.photoUrl}
                            alt={user.name}
                            className="w-32 h-32 rounded-full border-4 border-white object-cover bg-slate-100"
                        />
                    </div>
                </div>

                <div className="pt-20 pb-8 px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                                {user.name}
                                <BadgeCheck className="text-blue-500 w-6 h-6" />
                            </h2>
                            <p className="text-slate-500 font-medium text-lg">{user.branch || 'Head Office'}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100">
                                {user.district || 'General'} District
                            </span>
                        </div>

                        <div className="flex gap-4 flex-wrap">
                            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 min-w-[100px]">
                                <div className="text-2xl font-bold text-slate-800">{stats.totalBooks}</div>
                                <div className="text-xs text-slate-400 uppercase font-bold flex justify-center items-center gap-1"><BookOpen size={10} /> Books</div>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 min-w-[100px]">
                                <div className="text-2xl font-bold text-slate-800">{stats.totalMembers}</div>
                                <div className="text-xs text-slate-400 uppercase font-bold flex justify-center items-center gap-1"><Users size={10} /> Members</div>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100 min-w-[100px]">
                                <div className="text-2xl font-bold text-slate-800">{stats.issuedBooks}</div>
                                <div className="text-xs text-slate-400 uppercase font-bold flex justify-center items-center gap-1"><Activity size={10} /> Issued</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 border-t border-gray-100 pt-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-700 pb-2 flex items-center gap-2">
                                <Mail className="text-slate-400" size={18} /> Contact Information
                            </h3>

                            <div className="pl-7 space-y-4">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">Email Address</div>
                                    <div className="font-medium text-slate-700">{user.email}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">Official Phone</div>
                                    <div className="font-medium text-slate-700">{user.phone || 'Not Provided'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-slate-700 pb-2 flex items-center gap-2">
                                <Building className="text-slate-400" size={18} /> Library Details
                            </h3>

                            <div className="pl-7 space-y-4">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">Branch Name</div>
                                    <div className="font-medium text-slate-700">{user.branch || 'Central Library'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">District</div>
                                    <div className="font-medium text-slate-700">{user.district || 'Not Assigned'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">Librarian In-Charge</div>
                                    <div className="font-medium text-slate-700">{user.librarianName || 'Self'} <span className="text-slate-400 text-sm">(ID: {user.librarianId || 'N/A'})</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {stats.overdueBooks > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-red-100 p-2 rounded-full">
                        <Clock className="text-red-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-red-800">Action Required</h4>
                        <p className="text-red-600 text-sm">There are {stats.overdueBooks} overdue books in your library. Please check the Booking Requests page.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProfile;
