import { useRef, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { db } from '../../utils/mockData';
import { getCurrentUser } from '../../utils/auth';
import { CreditCard, BookOpen, Clock, AlertTriangle } from 'lucide-react';

const MemberDashboard = () => {
    const canvasRef = useRef(null);
    const [user] = useState(getCurrentUser());
    const [stats, setStats] = useState({ issued: [], reserved: [], fines: 0 });
    const [refreshTick, setRefreshTick] = useState(0);

    useEffect(() => {
        // Generate QR Code
        if (canvasRef.current && user) {
            QRCode.toCanvas(canvasRef.current, user.id, {
                width: 120,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' }
            });
        }

        // Fetch User Stats (re-runs on refreshTick change, no page reload needed)
        const freshUser = db.users.find(u => u.id === user.id);
        const myBooks = db.books.filter(b => b.issuedTo === user.id);

        setStats({
            issued: myBooks.filter(b => b.status === 'ISSUED'),
            reserved: myBooks.filter(b => b.status === 'RESERVED'),
            fines: freshUser?.finesOwed || 0
        });

    }, [user, refreshTick]);

    const handleRenew = (bookId) => {
        const res = db.renewBook(bookId, user.id);
        alert(res.message);
        if (res.success) setRefreshTick(t => t + 1); // Refresh UI with new due date
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Digital ID */}
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                    <div className="flex justify-between items-start mb-6">
                        <div className="font-bold tracking-widest text-xs opacity-70">LUMINA LIBRARY MEMBER</div>
                        <CreditCard className="opacity-50" />
                    </div>

                    <div className="text-center mb-6">
                        <div className="w-24 h-24 mx-auto rounded-full bg-white p-1 mb-3">
                            <img src={user.photoUrl} alt="User" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-indigo-200 text-sm">{user.email}</p>
                    </div>

                    <div className="bg-white rounded-xl p-3 flex justify-center shadow-lg">
                        <canvas ref={canvasRef} />
                    </div>

                    <div className="text-center mt-4 font-mono text-lg tracking-widest opacity-90">{user.id}</div>
                </div>

                {stats.fines > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                        <AlertTriangle className="flex-shrink-0" />
                        <div>
                            <div className="font-bold">Outstanding Fines: ₹{stats.fines}</div>
                            <div className="text-xs opacity-80">Pay at the desk immediately.</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Books */}
            <div className="lg:col-span-2 space-y-8">

                {/* Reserved Books */}
                {stats.reserved.length > 0 && (
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock className="text-amber-500" /> Ready for Pickup
                        </h3>
                        <div className="grid gap-4">
                            {stats.reserved.map(book => (
                                <div key={book.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4">
                                    <img src={book.coverUrl} className="w-16 h-24 object-cover rounded shadow-sm" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800">{book.title}</h4>
                                        <div className="text-sm text-gray-600 mb-2">{book.author}</div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="inline-block bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                                                Reserved until {book.dueDate}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const res = db.cancelReservation(book.id, user.id);
                                                    alert(res.message);
                                                    setRefreshTick(t => t + 1);
                                                }}
                                                className="text-xs text-red-600 hover:underline font-bold"
                                            >
                                                Cancel Pickup
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Waitlisted Books */}
                {db.books.filter(b => b.waitlist.includes(user.id)).length > 0 && (
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock className="text-gray-400" /> My Waitlist
                        </h3>
                        <div className="grid gap-4">
                            {db.books.filter(b => b.waitlist.includes(user.id)).map(book => (
                                <div key={book.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-4 opacity-75 hover:opacity-100 transition-opacity">
                                    <img src={book.coverUrl} className="w-16 h-24 object-cover rounded shadow-sm grayscale" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800">{book.title}</h4>
                                        <div className="text-sm text-gray-600 mb-2">{book.author}</div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold">
                                                Position: #{book.waitlist.indexOf(user.id) + 1}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    const res = db.cancelReservation(book.id, user.id);
                                                    alert(res.message);
                                                    setRefreshTick(t => t + 1);
                                                }}
                                                className="text-xs text-red-500 hover:underline font-medium"
                                            >
                                                Leave Waitlist
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Issued Books */}
                <section>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BookOpen className="text-indigo-500" /> Currently Borrowed
                    </h3>
                    {stats.issued.length === 0 ? (
                        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
                            You have no books currently borrowed.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {stats.issued.map(book => {
                                const isOverdue = new Date() > new Date(book.dueDate);
                                return (
                                    <div key={book.id} className={`bg-white border rounded-xl p-4 flex gap-4 shadow-sm ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                                        <img src={book.coverUrl} className="w-16 h-24 object-cover rounded shadow-sm" />
                                        <div className="flex-1 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{book.title}</h4>
                                                <div className="text-sm text-gray-500 mb-2">{book.author}</div>
                                                <div className={`text-sm ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                                    Due: {book.dueDate} {isOverdue && '(OVERDUE)'}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRenew(book.id)}
                                                className="border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Renew
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default MemberDashboard;
