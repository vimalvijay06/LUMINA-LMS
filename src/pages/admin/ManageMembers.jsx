import { useState, useEffect } from 'react';
import { db, RULES } from '../../utils/mockData';
import { Check, User, AlertCircle, X, ExternalLink, Calendar, CreditCard, Clock, BookOpen } from 'lucide-react';

const ManageMembers = () => {
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);

    // Refresh function
    const loadMembers = () => {
        const allUsers = db.users.filter(u => u.role === 'MEMBER');
        // Sort: Pending first, then by fines owed descending
        allUsers.sort((a, b) => {
            if (a.status === 'PENDING') return -1;
            if (b.status === 'PENDING') return 1;
            return (b.finesOwed || 0) - (a.finesOwed || 0);
        });
        setMembers([...allUsers]); // Force new array reference
    };

    useEffect(() => {
        loadMembers();
    }, []);

    const handleApprove = (e, id) => {
        e.stopPropagation(); // Prevent row click
        const res = db.approveUser(id);
        if (res.success) {
            alert('Member Approved Successfully!');
            loadMembers();
        } else {
            alert('Approval Failed');
        }
    };

    // Derived Data for Selected Member
    const memberLoans = selectedMember ? db.books.filter(b => b.issuedTo === selectedMember.id && b.status === 'ISSUED') : [];
    const memberWaitlist = selectedMember ? db.books.filter(b => b.waitlist.includes(selectedMember.id)) : [];
    const memberReservations = selectedMember ? db.books.filter(b => b.issuedTo === selectedMember.id && b.status === 'RESERVED') : [];

    // Fine Logic — uses same RULES as mockData for consistency
    const calculateFine = (book) => {
        if (!book.dueDate) return 0;
        const due = new Date(book.dueDate);
        due.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (today <= due) return 0;
        const diffDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
        return diffDays * RULES.FINE_PER_DAY;
    };

    return (
        <div className="space-y-6 relative">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Membership Requests</h1>
                <p className="text-gray-500">Approve verifying requests & Manage Member Profiles.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Member Profile</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600">Verification Data</th>
                            <th className="p-4 font-semibold text-gray-600">Fines Owed</th>
                            <th className="p-4 font-semibold text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {members.map(member => (
                            <tr
                                key={member.id}
                                onClick={() => setSelectedMember(member)}
                                className={`group hover:bg-gray-50 transition-colors cursor-pointer ${member.status === 'PENDING' ? 'bg-amber-50/50' : ''}`}
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={member.photoUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                        <div>
                                            <div className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                                                {member.name}
                                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                                            </div>
                                            <div className="text-xs text-gray-500">{member.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                        member.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {member.status}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    <div>Aadhaar: <span className="font-mono font-medium">{member.aadhaar || 'N/A'}</span></div>
                                    <div className="text-xs mt-1 text-gray-500">Ref By: {member.referenceId || 'N/A'}</div>
                                </td>
                                <td className="p-4">
                                    <div className={`font-bold ${member.finesOwed > 0 ? 'text-red-600 flex items-center gap-1' : 'text-gray-700'}`}>
                                        ₹{member.finesOwed || 0}
                                        {member.finesOwed > 10 && <AlertCircle size={14} />}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {member.status === 'PENDING' ? (
                                        <button
                                            onClick={(e) => handleApprove(e, member.id)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-1"
                                        >
                                            <Check size={14} /> Approve
                                        </button>
                                    ) : (
                                        <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${member.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                                                member.status === 'INACTIVE' ? 'bg-gray-100 text-gray-500' :
                                                    'bg-red-50 text-red-600'
                                            }`}>
                                            {member.status}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MEMBER DETAIL MODAL */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-end transition-opacity" onClick={() => setSelectedMember(null)}>
                    <div className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 bg-white z-10 border-b border-gray-100 p-6 flex justify-between items-start">
                            <div className="flex gap-4 items-center">
                                <img src={selectedMember.photoUrl} className="w-16 h-16 rounded-full border-2 border-indigo-100" />
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{selectedMember.name}</h2>
                                    <div className="text-sm text-gray-500">{selectedMember.email}</div>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono">{selectedMember.id}</span>
                                        <span className="text-xs bg-indigo-50 px-2 py-0.5 rounded text-indigo-600 font-bold">{selectedMember.role}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                    <div className="text-indigo-600 mb-1"><BookOpen size={20} /></div>
                                    <div className="text-2xl font-bold text-gray-800">{memberLoans.length}</div>
                                    <div className="text-xs font-bold text-indigo-400 uppercase">Active Loans</div>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                    <div className="text-amber-600 mb-1"><Clock size={20} /></div>
                                    <div className="text-2xl font-bold text-gray-800">{memberWaitlist.length + memberReservations.length}</div>
                                    <div className="text-xs font-bold text-amber-400 uppercase">Requests</div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <User size={16} className="text-gray-400" /> Contact Details
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Phone</span>
                                        <span className="font-medium">{selectedMember.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Aadhaar</span>
                                        <span className="font-medium font-mono">{selectedMember.aadhaar || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Joined</span>
                                        <span className="font-medium">{selectedMember.joinedDate}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 mt-2">
                                        <span className="text-gray-500 block text-xs mb-1">Address</span>
                                        <span className="font-medium block">{selectedMember.address || 'No address on file'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Borrowed Books */}
                            <div>
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <BookOpen size={16} className="text-gray-400" /> Borrowed Books
                                </h3>
                                {memberLoans.length === 0 ? (
                                    <div className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center">No books currently borrowed.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {memberLoans.map(book => {
                                            const fine = calculateFine(book);
                                            const isOverdue = fine > 0;

                                            return (
                                                <div key={book.id} className="border border-gray-100 rounded-xl p-3 shadow-sm relative overflow-hidden">
                                                    {isOverdue && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 font-bold rounded-bl-lg">OVERDUE</div>}

                                                    <div className="flex gap-3">
                                                        <img src={book.coverUrl} className="w-12 h-16 object-cover rounded bg-gray-100" />
                                                        <div className="flex-1">
                                                            <div className="font-bold text-gray-800 text-sm line-clamp-1">{book.title}</div>
                                                            <div className="text-xs text-gray-500 mb-2">{book.author}</div>

                                                            <div className={`text-xs font-bold flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                                                                <Calendar size={12} /> Due: {book.dueDate}
                                                            </div>

                                                            {isOverdue && (
                                                                <div className="mt-2 flex items-center justify-between bg-red-50 p-2 rounded-lg border border-red-100">
                                                                    <div className="text-xs font-bold text-red-700">Fine: ₹{fine}</div>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (confirm(`Collect ₹${fine} fine from ${selectedMember.name}?`)) {
                                                                                db.clearFine(selectedMember.id);
                                                                                alert(`Fine of ₹${fine} cleared for ${selectedMember.name}.`);
                                                                                loadMembers();
                                                                                setSelectedMember(null);
                                                                            }
                                                                        }}
                                                                        className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold hover:bg-red-700 shadow-sm"
                                                                    >
                                                                        Collect Fine
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Pre-booked / Waitlist */}
                            <div>
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <Clock size={16} className="text-gray-400" /> Pre-booked / Waitlist
                                </h3>
                                {(memberWaitlist.length === 0 && memberReservations.length === 0) ? (
                                    <div className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center">No active requests.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {memberReservations.map(book => (
                                            <div key={book.id} className="border border-amber-200 bg-amber-50 rounded-xl p-3 flex gap-3">
                                                <img src={book.coverUrl} className="w-10 h-14 object-cover rounded" />
                                                <div>
                                                    <div className="font-bold text-gray-800 text-sm">{book.title}</div>
                                                    <div className="text-xs text-amber-700 font-bold mt-1">Ready for Pickup</div>
                                                    <div className="text-[10px] text-amber-600">Reserved until {book.dueDate}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {memberWaitlist.map(book => (
                                            <div key={book.id} className="border border-gray-100 rounded-xl p-3 flex gap-3 opacity-75">
                                                <img src={book.coverUrl} className="w-10 h-14 object-cover rounded grayscale" />
                                                <div>
                                                    <div className="font-bold text-gray-800 text-sm">{book.title}</div>
                                                    <div className="text-xs text-gray-500 font-bold mt-1">Waitlist Position: #{book.waitlist.indexOf(selectedMember.id) + 1}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMembers;
