import { useState, useRef, useEffect } from 'react';
import { db } from '../../utils/mockData';
import { Html5Qrcode } from 'html5-qrcode';
import {
    Camera, Search, XCircle,
    CheckCircle, AlertCircle
} from 'lucide-react';

const IssueReturn = () => {
    // State
    const [currentMember, setCurrentMember] = useState(null);
    const [scanTarget, setScanTarget] = useState(null); // 'member' | 'book'
    const [isScanning, setIsScanning] = useState(false);

    // Inputs
    const [memberIdInput, setMemberIdInput] = useState('');
    const [bookIdInput, setBookIdInput] = useState('');

    // Messages
    const [message, setMessage] = useState(null);

    // Scanner ref
    const scannerRef = useRef(null);

    // ── Actions ──────────────────────────────────────────────

    const loadMember = (id) => {
        const userId = (id || memberIdInput).trim().toUpperCase();
        if (!userId) return;

        const user = db.users.find(u => u.id === userId);
        if (user) {
            setCurrentMember(user);
            setMemberIdInput('');
            setMessage(null);
        } else {
            alert('User not found. Try M001 for demo.');
        }
    };

    const resetSession = () => {
        setCurrentMember(null);
        setBookIdInput('');
        setMessage(null);
    };

    const refreshMember = () => {
        if (!currentMember) return;
        const updated = db.users.find(u => u.id === currentMember.id);
        if (updated) setCurrentMember({ ...updated });
    };

    const handleIssueBook = () => {
        if (!bookIdInput.trim()) return;
        const result = db.issueBook(bookIdInput.trim().toUpperCase(), currentMember.id);
        if (result.success) {
            setMessage({ type: 'success', text: `Issued "${result.book.title}" successfully!` });
            setBookIdInput('');
            refreshMember();
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const handleReturnBook = (bookId) => {
        if (!confirm('Confirm return of this book?')) return;
        const result = db.returnBook(bookId);
        if (result.success) {
            if (result.fine > 0) {
                setMessage({ type: 'error', text: `Book returned. Late fine applied: ₹${result.fine}` });
            } else {
                setMessage({ type: 'success', text: 'Book returned successfully!' });
            }
            refreshMember();
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const handleIssueReserved = (bookId) => {
        const res = db.issueBook(bookId, currentMember.id);
        if (res.success) {
            setMessage({ type: 'success', text: `Issued "${res.book.title}"` });
            refreshMember();
        } else {
            setMessage({ type: 'error', text: res.message });
        }
    };

    const payFine = () => {
        if (!confirm('Confirm payment of all fines?')) return;
        db.clearFine(currentMember.id);
        refreshMember();
        setMessage({ type: 'success', text: 'Fines cleared!' });
    };

    // ── Scanner Logic ─────────────────────────────────────────

    useEffect(() => {
        if (!isScanning || !scanTarget) return;

        const html5QrCode = new Html5Qrcode('reader');
        scannerRef.current = html5QrCode;

        html5QrCode
            .start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    html5QrCode.stop().then(() => {
                        setIsScanning(false);
                        if (scanTarget === 'member') loadMember(decodedText);
                        else setBookIdInput(decodedText);
                    });
                },
                () => { /* ignore per-frame errors */ }
            )
            .catch(err => {
                console.error(err);
                setIsScanning(false);
                alert('Camera failed to start or permission denied.');
            });

        return () => {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().catch(e => console.error(e));
            }
        };
    }, [isScanning, scanTarget]);

    const startScan = (target) => {
        setScanTarget(target);
        setIsScanning(true);
    };

    const closeScanner = () => {
        if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().then(() => setIsScanning(false));
        } else {
            setIsScanning(false);
        }
    };

    // ── Derived Data ──────────────────────────────────────────

    const issuedBooks = currentMember ? db.books.filter(b => b.issuedTo === currentMember.id && b.status === 'ISSUED') : [];
    const reservedBooks = currentMember ? db.books.filter(b => b.issuedTo === currentMember.id && b.status === 'RESERVED') : [];

    // ── Render ────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Issue &amp; Return Desk</h1>

            {/* Step 1: Find Member */}
            {!currentMember ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center max-w-2xl mx-auto">
                    <div className="text-6xl mb-4">👤</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Scan Member ID</h3>
                    <p className="text-gray-500 mb-6">Use Camera or Enter Member ID Manually</p>

                    <div className="flex justify-center mb-6">
                        <button
                            onClick={() => startScan('member')}
                            className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <Camera size={20} /> Activate Camera
                        </button>
                    </div>

                    <div className="flex justify-center gap-2 max-w-xs mx-auto">
                        <input
                            type="text"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                            placeholder="e.g. M001"
                            value={memberIdInput}
                            onChange={e => setMemberIdInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && loadMember()}
                        />
                        <button
                            onClick={() => loadMember()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg"
                        >
                            Find
                        </button>
                    </div>
                </div>
            ) : (
                /* Step 2: Member Session */
                <div>
                    {/* Profile Header */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 flex items-center gap-6 mb-8 relative">
                        <img src={currentMember.photoUrl} alt="User" className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover" />
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800">{currentMember.name}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${currentMember.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {currentMember.status}
                                </span>
                                <span className="text-sm text-gray-500">ID: {currentMember.id}</span>
                            </div>
                            <div className="mt-2 text-sm">
                                {currentMember.finesOwed > 0 ? (
                                    <div className="text-red-600 font-bold flex items-center gap-2">
                                        Fines Owed: ₹{currentMember.finesOwed}
                                        <button onClick={payFine} className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded border border-red-200 text-red-800">
                                            Pay Now
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-gray-400">No outstanding fines</span>
                                )}
                            </div>
                        </div>
                        <button onClick={resetSession} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full">
                            <XCircle size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Current Books */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Toast */}
                            {message && (
                                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    {message.text}
                                </div>
                            )}

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Currently Issued</h3>

                                {issuedBooks.length === 0 && reservedBooks.length === 0 ? (
                                    <p className="text-center text-gray-400 py-8">No active books.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Reserved — ready to issue */}
                                        {reservedBooks.map(book => (
                                            <div key={book.id} className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex justify-between items-center">
                                                <div>
                                                    <div className="font-bold text-gray-800">{book.title}</div>
                                                    <div className="text-xs text-amber-700">Reserved until: {book.dueDate}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleIssueReserved(book.id)}
                                                    className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700"
                                                >
                                                    Issue Now
                                                </button>
                                            </div>
                                        ))}

                                        {/* Issued */}
                                        {issuedBooks.map(book => {
                                            const isOverdue = new Date() > new Date(book.dueDate);
                                            return (
                                                <div key={book.id} className={`p-4 rounded-lg border flex justify-between items-center ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                                                    <div>
                                                        <div className="font-bold text-gray-800">{book.title}</div>
                                                        <div className={`text-xs ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                                            Due: {book.dueDate} {isOverdue && '(OVERDUE)'}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleReturnBook(book.id)}
                                                        className="border border-green-600 text-green-700 hover:bg-green-50 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                                    >
                                                        Return
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Issue New Book */}
                        <div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-indigo-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Issue New Book</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1">Book ID / ISBN</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                                                placeholder="B001"
                                                value={bookIdInput}
                                                onChange={e => setBookIdInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleIssueBook()}
                                            />
                                            <button onClick={() => startScan('book')} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                                                <Camera size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleIssueBook}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold shadow-md shadow-indigo-200"
                                    >
                                        Confirm Issue
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Scanner Modal */}
            {isScanning && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md overflow-hidden relative">
                        <div className="p-4 border-b flex justify-between items-center text-gray-800">
                            <h3 className="font-bold">Scan QR Code</h3>
                            <button onClick={closeScanner}><XCircle /></button>
                        </div>
                        <div id="reader" className="w-full h-80 bg-gray-100" />
                        <p className="text-center p-4 text-sm text-gray-500">Point at Member ID or Book Code</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueReturn;
