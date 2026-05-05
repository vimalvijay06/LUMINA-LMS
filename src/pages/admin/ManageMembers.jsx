import { useState, useEffect } from 'react';
import { secureFetch } from '../../utils/auth';
import { RULES } from '../../utils/mockData';
import { Check, User, AlertCircle, X, ExternalLink, Calendar, CreditCard, Clock, BookOpen } from 'lucide-react';

const ManageMembers = () => {
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);

    const [books, setBooks] = useState([]);

    const loadData = async () => {
        try {
            const [usersRes, booksRes] = await Promise.all([
                secureFetch(`${import.meta.env.VITE_API_URL}/users`),
                secureFetch(`${import.meta.env.VITE_API_URL}/books`)
            ]);
            
            const usersData = await usersRes.json();
            const booksData = await booksRes.json();

            usersData.sort((a, b) => {
                if (a.status === 'PENDING') return -1;
                if (b.status === 'PENDING') return 1;
                return (b.finesOwed || 0) - (a.finesOwed || 0);
            });

            setMembers(usersData);
            setBooks(booksData);
        } catch (err) {
            console.error('Failed to load data:', err);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleApprove = async (e, id) => {
        e.stopPropagation();
        try {
            const res = await secureFetch(`${import.meta.env.VITE_API_URL}/users/approve/${id}`, {
                method: 'PATCH'
            });
            const result = await res.json();
            if (result.success) {
                alert('Member Approved Successfully!');
                loadData();
            } else {
                alert('Approval Failed: ' + result.message);
            }
        } catch (err) {
            alert('Server Error: Could not approve member.');
        }
    };

    // Derived data for selected member
    const memberLoans = selectedMember ? books.filter(b => b.issuedToId === selectedMember.id && b.status === 'ISSUED') : [];
    const memberWaitlist = selectedMember ? books.filter(b => (b.waitlist || []).includes(selectedMember.id)) : [];
    const memberReservations = selectedMember ? books.filter(b => b.issuedToId === selectedMember.id && b.status === 'RESERVED') : [];

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const calculateFine = (book) => {
        if (!book.dueDate) return 0;
        const due = new Date(book.dueDate);
        due.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (today <= due) return 0;
        const diffDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
        return diffDays * 10; // 10 is FINE_PER_DAY
    };

    // Helper: pick the right status pill class
    const getStatusPill = (status) => {
        if (status === 'ACTIVE') return 'status-pill-active';
        if (status === 'INACTIVE') return 'status-pill-inactive';
        return 'status-pill-suspended';
    };

    const getStatusBadge = (status) => {
        if (status === 'ACTIVE') return 'badge-active';
        if (status === 'PENDING') return 'badge-pending';
        return 'badge-inactive';
    };

    return (
        <div className="page-container">
            <div>
                <h1 className="page-title">Membership Requests</h1>
                <p className="page-subtitle">Approve verifying requests & Manage Member Profiles.</p>
            </div>

            {/* ── Members Table ─────────────────────────────────── */}
            <div className="card">
                <table className="data-table">
                    <thead className="table-header">
                        <tr>
                            <th className="table-th">Member Profile</th>
                            <th className="table-th">Status</th>
                            <th className="table-th">Verification Data</th>
                            <th className="table-th">Fines Owed</th>
                            <th className="table-th">Action</th>
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {members.map(member => (
                            <tr
                                key={member.id}
                                onClick={() => setSelectedMember(member)}
                                className={`table-row group ${member.status === 'PENDING' ? 'table-row-pending' : ''}`}
                            >
                                {/* Profile */}
                                <td className="table-td">
                                    <div className="flex items-center gap-3">
                                        <img src={member.photoUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                        <div>
                                            <div className="member-name-cell">
                                                {member.name}
                                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                                            </div>
                                            <div className="member-email-cell">{member.email}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* Status badge */}
                                <td className="table-td">
                                    <span className={getStatusBadge(member.status)}>{member.status}</span>
                                </td>

                                {/* Verification data */}
                                <td className="table-td text-sm text-gray-600">
                                    <div>Aadhaar: <span className="font-mono font-medium">{member.aadhaar || 'N/A'}</span></div>
                                    <div className="text-xs mt-1 text-gray-500">Ref By: {member.referenceId || 'N/A'}</div>
                                </td>

                                {/* Fines */}
                                <td className="table-td">
                                    <div className={member.finesOwed > 0 ? 'fine-amount-owed' : 'fine-amount-normal'}>
                                        ₹{member.finesOwed || 0}
                                        {member.finesOwed > 10 && <AlertCircle size={14} />}
                                    </div>
                                </td>

                                {/* Action */}
                                <td className="table-td">
                                    {member.status === 'PENDING' ? (
                                        <button onClick={(e) => handleApprove(e, member.id)} className="btn-approve">
                                            <Check size={14} /> Approve
                                        </button>
                                    ) : (
                                        <span className={getStatusPill(member.status)}>{member.status}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Member Detail Drawer ────────────────────────────── */}
            {selectedMember && (
                <div className="modal-overlay" onClick={() => setSelectedMember(null)}>
                    <div className="modal-drawer animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="modal-header">
                            <div className="flex gap-4 items-center">
                                <img src={selectedMember.photoUrl} className="modal-avatar" />
                                <div>
                                    <h2 className="modal-member-name">{selectedMember.name}</h2>
                                    <div className="modal-member-email">{selectedMember.email}</div>
                                    <div className="flex gap-2 mt-1">
                                        <span className="member-id-badge">{selectedMember.id}</span>
                                        <span className="member-role-badge">{selectedMember.role}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedMember(null)} className="btn-icon-close">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="stat-card-blue">
                                    <div className="text-indigo-600 mb-1"><BookOpen size={20} /></div>
                                    <div className="text-2xl font-bold text-gray-800">{memberLoans.length}</div>
                                    <div className="text-xs font-bold text-indigo-400 uppercase">Active Loans</div>
                                </div>
                                <div className="stat-card-amber">
                                    <div className="text-amber-600 mb-1"><Clock size={20} /></div>
                                    <div className="text-2xl font-bold text-gray-800">{memberWaitlist.length + memberReservations.length}</div>
                                    <div className="text-xs font-bold text-amber-400 uppercase">Requests</div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3">
                                <h3 className="section-title">
                                    <User size={16} className="text-gray-400" /> Contact Details
                                </h3>
                                <div className="info-panel">
                                    <div className="info-row">
                                        <span className="info-label">Phone</span>
                                        <span className="info-value">{selectedMember.phone || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Aadhaar</span>
                                        <span className="info-value font-mono">{selectedMember.aadhaar || 'N/A'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Joined</span>
                                        <span className="info-value">{formatDate(selectedMember.joinedDate)}</span>
                                    </div>
                                    <div className="info-divider">
                                        <span className="info-address-label">Address</span>
                                        <span className="info-address-value">{selectedMember.address || 'No address on file'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Borrowed Books */}
                            <div>
                                <h3 className="section-title-mb">
                                    <BookOpen size={16} className="text-gray-400" /> Borrowed Books
                                </h3>
                                {memberLoans.length === 0 ? (
                                    <div className="empty-state-panel">No books currently borrowed.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {memberLoans.map(book => {
                                            const fine = calculateFine(book);
                                            const isOverdue = fine > 0;

                                            return (
                                                <div key={book.id} className="book-card-inline">
                                                    {isOverdue && <div className="overdue-ribbon">OVERDUE</div>}

                                                    <div className="flex gap-3">
                                                        <img src={book.coverUrl} className="w-12 h-16 object-cover rounded bg-gray-100" />
                                                        <div className="flex-1">
                                                            <div className="book-title-sm">{book.title}</div>
                                                            <div className="book-author-sm">{book.author}</div>

                                                            <div className={`text-xs font-bold flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                                                                <Calendar size={12} /> Due: {formatDate(book.dueDate)}
                                                            </div>

                                                            {isOverdue && (
                                                                <div className="fine-panel">
                                                                    <div className="fine-label">Fine: ₹{fine}</div>
                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            if (confirm(`Collect ₹${fine} fine from ${selectedMember.name}?`)) {
                                                                                try {
                                                                                    const res = await secureFetch(`${import.meta.env.VITE_API_URL}/users/${selectedMember.id}/clear-fine`, { method: 'POST' });
                                                                                    const result = await res.json();
                                                                                    if (result.success) {
                                                                                        alert(`Fine of ₹${fine} cleared for ${selectedMember.name}.`);
                                                                                        loadData();
                                                                                        setSelectedMember(null);
                                                                                    }
                                                                                } catch (err) {
                                                                                    alert('Failed to clear fine');
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="btn-overdue-collect"
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
                                <h3 className="section-title-mb">
                                    <Clock size={16} className="text-gray-400" /> Pre-booked / Waitlist
                                </h3>
                                {(memberWaitlist.length === 0 && memberReservations.length === 0) ? (
                                    <div className="empty-state-panel">No active requests.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {memberReservations.map(book => (
                                            <div key={book.id} className="book-card-reserved">
                                                <img src={book.coverUrl} className="book-thumb-sm" />
                                                <div>
                                                    <div className="book-title-sm">{book.title}</div>
                                                    <div className="text-xs text-amber-700 font-bold mt-1">Ready for Pickup</div>
                                                    <div className="text-[10px] text-amber-600">Reserved until {formatDate(book.dueDate)}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {memberWaitlist.map(book => (
                                            <div key={book.id} className="book-card-waitlisted">
                                                <img src={book.coverUrl} className="book-thumb-sm-grayscale" />
                                                <div>
                                                    <div className="book-title-sm">{book.title}</div>
                                                    <div className="text-xs text-gray-500 font-bold mt-1">
                                                        Waitlist Position: #{book.waitlist.indexOf(selectedMember.id) + 1}
                                                    </div>
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
