import { useState, useMemo } from 'react';
import { db } from '../../utils/mockData';
import { Clock, AlertTriangle, CheckCircle, User, Calendar, Bell, XCircle } from 'lucide-react';

const BookingRequests = () => {
    const [activeTab, setActiveTab] = useState('waitlist');
    const [refreshTick, setRefreshTick] = useState(0);

    // Filter Logic — re-computed whenever refreshTick changes (no page reload needed)
    const waitlistedBooks = useMemo(() => db.books.filter(b => b.waitlist.length > 0), [refreshTick]);
    const reservedBooks = useMemo(() => db.books.filter(b => b.status === 'RESERVED'), [refreshTick]);
    const overdueBooks = useMemo(() => db.books.filter(b => {
        if (b.status !== 'ISSUED' || !b.dueDate) return false;
        return new Date() > new Date(b.dueDate);
    }), [refreshTick]);

    const handleNotify = (memberId, bookTitle, type) => {
        db.notify(memberId, `${type}: "${bookTitle}" — please visit the library.`, 'INFO');
        alert(`Notification sent to Member ${memberId} for "${bookTitle}".`);
    };

    const handleCancelReservation = (bookId, memberId) => {
        if (confirm('Are you sure you want to cancel this reservation?')) {
            const res = db.cancelReservation(bookId, memberId);
            alert(res.message);
            setRefreshTick(t => t + 1);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Circulation Monitor</h1>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('waitlist')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'waitlist' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Waitlist ({waitlistedBooks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reserved')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'reserved' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Reservations ({reservedBooks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('overdue')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overdue' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Overdue ({overdueBooks.length})
                    </button>
                </div>
            </div>

            {/* --- WAITLIST TAB --- */}
            {activeTab === 'waitlist' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <div className="bg-indigo-100 p-2 rounded-full"><Clock size={16} className="text-indigo-600" /></div>
                        <h3 className="font-bold text-gray-700">Waitlist Queue</h3>
                    </div>
                    {waitlistedBooks.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No active waitlists.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {waitlistedBooks.map(book => (
                                <div key={book.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex gap-4 items-center">
                                        <img src={book.coverUrl} className="w-12 h-16 object-cover rounded" />
                                        <div>
                                            <h4 className="font-bold text-gray-800">{book.title}</h4>
                                            <div className="text-sm text-gray-500">{book.waitlist.length} members waiting</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {book.waitlist.map((memberId, idx) => (
                                            <div key={memberId + idx} className="flex items-center gap-3 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                                                <span className="bg-indigo-200 text-indigo-800 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-sm font-medium text-gray-700">Member {memberId}</span>
                                                <button
                                                    onClick={() => handleNotify(memberId, book.title, 'Availability')}
                                                    className="ml-auto text-xs text-indigo-600 hover:underline flex items-center gap-1"
                                                >
                                                    <Bell size={12} /> Notify
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- RESERVED TAB --- */}
            {activeTab === 'reserved' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-amber-50 flex items-center gap-2">
                        <div className="bg-amber-100 p-2 rounded-full"><Calendar size={16} className="text-amber-600" /></div>
                        <h3 className="font-bold text-gray-700">Ready for Pickup</h3>
                    </div>
                    {reservedBooks.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No active reservations.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {reservedBooks.map(book => (
                                <div key={book.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex gap-4 items-center">
                                        <img src={book.coverUrl} className="w-12 h-16 object-cover rounded" />
                                        <div>
                                            <h4 className="font-bold text-gray-800">{book.title}</h4>
                                            <div className="text-sm text-amber-600 font-medium">Reserved until {book.dueDate}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 uppercase font-bold">Reserver</div>
                                            <div className="font-medium text-gray-800 flex items-center gap-2">
                                                <User size={14} /> {book.issuedTo}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCancelReservation(book.id, book.issuedTo)}
                                            className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                                            title="Cancel Reservation"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- OVERDUE TAB --- */}
            {activeTab === 'overdue' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-red-50 flex items-center gap-2">
                        <div className="bg-red-100 p-2 rounded-full"><AlertTriangle size={16} className="text-red-600" /></div>
                        <h3 className="font-bold text-gray-700">Overdue Books</h3>
                    </div>
                    {overdueBooks.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No overdue books.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {overdueBooks.map(book => {
                                const daysOverdue = Math.ceil((new Date() - new Date(book.dueDate)) / (1000 * 60 * 60 * 24));
                                return (
                                    <div key={book.id} className="p-4 flex items-center justify-between hover:bg-red-50/30">
                                        <div className="flex gap-4 items-center">
                                            <img src={book.coverUrl} className="w-12 h-16 object-cover rounded grayscale" />
                                            <div>
                                                <h4 className="font-bold text-gray-800">{book.title}</h4>
                                                <div className="text-sm text-red-600 font-bold">Due: {book.dueDate}</div>
                                                <div className="text-xs text-red-500 mt-1">{daysOverdue} days overdue</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 uppercase font-bold">Borrower</div>
                                                <div className="font-medium text-gray-800 flex items-center gap-2">
                                                    <User size={14} /> {book.issuedTo}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleNotify(book.issuedTo, book.title, 'Overdue Warning')}
                                                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                <Bell size={14} /> Send Warning
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookingRequests;
