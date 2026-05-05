import { useState, useMemo, useEffect } from 'react';
import { secureFetch } from '../../utils/auth';
import { Clock, AlertTriangle, CheckCircle, User, Calendar, Bell, XCircle, RefreshCw } from 'lucide-react';

const BookingRequests = () => {
    const [activeTab, setActiveTab] = useState('waitlist');
    const [refreshTick, setRefreshTick] = useState(0);

    const [allBooks, setAllBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const res = await secureFetch(`${import.meta.env.VITE_API_URL}/books`);
            const data = await res.json();
            setAllBooks(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch stats error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [refreshTick]);

    // Data — re-computed whenever refreshTick changes
    const waitlistedBooks = useMemo(() => allBooks.filter(b => b.waitlist && b.waitlist.length > 0), [allBooks]);
    const reservedBooks = useMemo(() => allBooks.filter(b => b.status === 'RESERVED'), [allBooks]);
    const overdueBooks = useMemo(() => allBooks.filter(b => {
        if (b.status !== 'ISSUED' || !b.dueDate) return false;
        return new Date() > new Date(b.dueDate);
    }), [allBooks]);

    const handleNotify = async (memberId, bookTitle, type) => {
        // Since we don't have a real notification table in backend yet, 
        // we display an alert. In production, this would hit /api/notifications
        alert(`Notification (Mock): To Member ${memberId} — ${type}: "${bookTitle}" is ready.`);
    };

    const handleCancelReservation = async (bookId, memberId) => {
        if (confirm('Are you sure you want to cancel this reservation?')) {
            try {
                const res = await secureFetch(`${import.meta.env.VITE_API_URL}/books/${bookId}/cancel-reservation`, {
                    method: 'POST',
                    body: JSON.stringify({ userId: memberId })
                });
                const result = await res.json();
                if (result.success) {
                    alert('Reservation Cancelled Successfully.');
                    setRefreshTick(t => t + 1);
                }
            } catch (err) {
                alert("Cancellation failed.");
            }
        }
    };

    // Tab button class helper
    const tabClass = (tab, activeStyle) =>
        `tab-btn ${activeTab === tab ? activeStyle : ''}`;

    return (
        <div className="page-container">

            {/* ── Header + Tab Bar ──────────────────────────────── */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="page-title">Circulation Monitor</h1>
                    {loading && <RefreshCw className="animate-spin text-gray-400" size={20} />}
                </div>
                <div className="tab-bar">
                    <button
                        onClick={() => setActiveTab('waitlist')}
                        className={tabClass('waitlist', 'tab-btn-active-indigo')}
                    >
                        Waitlist ({waitlistedBooks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reserved')}
                        className={tabClass('reserved', 'tab-btn-active-amber')}
                    >
                        Reservations ({reservedBooks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('overdue')}
                        className={tabClass('overdue', 'tab-btn-active-red')}
                    >
                        Overdue ({overdueBooks.length})
                    </button>
                </div>
            </div>

            {/* ── WAITLIST TAB ───────────────────────────────────── */}
            {activeTab === 'waitlist' && (
                <div className="card-bordered">
                    <div className="tab-section-header-gray">
                        <div className="tab-icon-indigo"><Clock size={16} className="text-indigo-600" /></div>
                        <h3 className="tab-section-title">Waitlist Queue</h3>
                    </div>

                    {waitlistedBooks.length === 0 ? (
                        <div className="tab-empty-state">No active waitlists.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {waitlistedBooks.map(book => (
                                <div key={book.id} className="book-list-item">
                                    {/* Book info */}
                                    <div className="flex gap-4 items-center">
                                        <img src={book.coverUrl} className="book-thumb" />
                                        <div>
                                            <h4 className="font-bold text-gray-800">{book.title}</h4>
                                            <div className="text-sm text-gray-500">{book.waitlist.length} members waiting</div>
                                        </div>
                                    </div>

                                    {/* Waitlist queue */}
                                    <div className="flex flex-col gap-2">
                                        {book.waitlist.map((memberId, idx) => (
                                            <div key={memberId + idx} className="waitlist-member-row">
                                                <span className="waitlist-position-badge">{idx + 1}</span>
                                                <span className="text-sm font-medium text-gray-700">Member {memberId}</span>
                                                <button
                                                    onClick={() => handleNotify(memberId, book.title, 'Availability')}
                                                    className="btn-notify"
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

            {/* ── RESERVED TAB ───────────────────────────────────── */}
            {activeTab === 'reserved' && (
                <div className="card-bordered">
                    <div className="tab-section-header-amber">
                        <div className="tab-icon-amber"><Calendar size={16} className="text-amber-600" /></div>
                        <h3 className="tab-section-title">Ready for Pickup</h3>
                    </div>

                    {reservedBooks.length === 0 ? (
                        <div className="tab-empty-state">No active reservations.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {reservedBooks.map(book => (
                                <div key={book.id} className="book-list-item">
                                    {/* Book info */}
                                    <div className="flex gap-4 items-center">
                                        <img src={book.coverUrl} className="book-thumb" />
                                        <div>
                                            <h4 className="font-bold text-gray-800">{book.title}</h4>
                                            <div className="text-sm text-amber-600 font-medium">Reserved until {book.dueDate}</div>
                                        </div>
                                    </div>

                                    {/* Reserver + cancel */}
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 uppercase font-bold">Reserver</div>
                                            <div className="font-medium text-gray-800 flex items-center gap-2">
                                                <User size={14} /> {book.issuedTo}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCancelReservation(book.id, book.issuedTo)}
                                            className="btn-danger-ghost"
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

            {/* ── OVERDUE TAB ────────────────────────────────────── */}
            {activeTab === 'overdue' && (
                <div className="card-bordered">
                    <div className="tab-section-header-red">
                        <div className="tab-icon-red"><AlertTriangle size={16} className="text-red-600" /></div>
                        <h3 className="tab-section-title">Overdue Books</h3>
                    </div>

                    {overdueBooks.length === 0 ? (
                        <div className="tab-empty-state">No overdue books.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {overdueBooks.map(book => {
                                const daysOverdue = Math.ceil((new Date() - new Date(book.dueDate)) / (1000 * 60 * 60 * 24));
                                return (
                                    <div key={book.id} className="book-list-item hover:bg-red-50/30">
                                        {/* Book info */}
                                        <div className="flex gap-4 items-center">
                                            <img src={book.coverUrl} className="book-thumb-grayscale" />
                                            <div>
                                                <h4 className="font-bold text-gray-800">{book.title}</h4>
                                                <div className="text-sm text-red-600 font-bold">Due: {book.dueDate}</div>
                                                <div className="text-xs text-red-500 mt-1">{daysOverdue} days overdue</div>
                                            </div>
                                        </div>

                                        {/* Borrower + warn */}
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 uppercase font-bold">Borrower</div>
                                                <div className="font-medium text-gray-800 flex items-center gap-2">
                                                    <User size={14} /> {book.issuedTo}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleNotify(book.issuedTo, book.title, 'Overdue Warning')}
                                                className="btn-warning"
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
