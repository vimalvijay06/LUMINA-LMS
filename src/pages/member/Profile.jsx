import { useState, useEffect } from 'react';
import { db } from '../../utils/mockData';
import { getCurrentUser } from '../../utils/auth';

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        // Fetch fresh from db in case of updates (fines, etc)
        const freshUser = db.users.find(u => u.id === currentUser.id);
        setUser(freshUser);
    }, []);

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

            {/* Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6">
                <img src={user.photoUrl} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                    <div className="text-gray-500">{user.email}</div>
                    <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        {user.status}
                    </div>
                </div>
            </div>

            {/* Details Form */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                        <input type="text" disabled value={user.name} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                        <input type="text" disabled value={user.email} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Member ID</label>
                        <input type="text" disabled value={user.id} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-mono" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Joined Date</label>
                        <input type="text" disabled value={user.joinedDate || 'N/A'} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700" />
                    </div>
                </div>
            </div>

            {/* Fines Section */}
            <div className={`p-8 rounded-2xl border flex justify-between items-center ${(user.finesOwed || 0) > 0
                    ? 'bg-red-50 border-red-100'
                    : 'bg-green-50 border-green-100'
                }`}>
                <div>
                    <h3 className={`text-lg font-bold ${(user.finesOwed || 0) > 0 ? 'text-red-900' : 'text-green-900'}`}>Account Status</h3>
                    <p className={`text-sm mt-1 ${(user.finesOwed || 0) > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        {(user.finesOwed || 0) > 0 ? 'Outstanding fines must be paid at the desk.' : 'No outstanding fines. Account is in good standing.'}
                    </p>
                </div>
                <div className="text-right">
                    <div className={`text-sm font-medium ${(user.finesOwed || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>Fines Owed</div>
                    <div className={`text-3xl font-bold ${(user.finesOwed || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>₹{user.finesOwed || 0}</div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
