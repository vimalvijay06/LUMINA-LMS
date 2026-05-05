import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { secureFetch } from '../../utils/auth';
import {
    Camera, XCircle,
    CheckCircle, AlertCircle, RotateCw, Trash2
} from 'lucide-react';

const IssueReturn = () => {
    // State
    const [currentMember, setCurrentMember] = useState(null);
    const [scanTarget, setScanTarget] = useState(null); // 'member' | 'book'
    const [isScanning, setIsScanning] = useState(false);
    const [isInverted, setIsInverted] = useState(false);

    // Inputs
    const [memberIdInput, setMemberIdInput] = useState('');
    const [bookIdInput, setBookIdInput] = useState('');

    // Messages
    const [message, setMessage] = useState(null);

    // Scanner ref
    const scannerRef = useRef(null);

    // ── Actions (API Based) ───────────────────────────────────────────

    const loadMember = async (id) => {
        const userId = (id || memberIdInput).trim().toUpperCase();
        if (!userId) return;

        try {
            const res = await secureFetch(`${import.meta.env.VITE_API_URL}/users`);
            const users = await res.json();
            const user = users.find(u => u.id === userId);
            
            if (user) {
                setCurrentMember(user);
                setMemberIdInput('');
                setMessage(null);
            } else {
                alert('Member not found in database.');
            }
        } catch (err) {
            alert("Error connecting to database.");
        }
    };

    const resetSession = () => {
        setCurrentMember(null);
        setBookIdInput('');
        setMessage(null);
    };

    const refreshMemberData = async () => {
        if (!currentMember) return;
        try {
            const res = await secureFetch(`${import.meta.env.VITE_API_URL}/users`);
            const users = await res.json();
            const updated = users.find(u => u.id === currentMember.id);
            if (updated) setCurrentMember(updated);
        } catch (err) { console.error(err); }
    };

    const handleIssueBook = async (idFromScan) => {
        const id = (idFromScan || bookIdInput).trim().toUpperCase();
        if (!id) return;

        try {
            const res = await secureFetch(`${import.meta.env.VITE_API_URL}/books/${id}/issue`, {
                method: 'POST',
                body: JSON.stringify({ userId: currentMember.id })
            });
            const result = await res.json();
            if (result.success) {
                setMessage({ type: 'success', text: `Issued "${result.book.title}" successfully!` });
                setBookIdInput('');
                refreshMemberData();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server Error: Issue failed.' });
        }
    };

    const handleReturnBook = async (bookId) => {
        if (!confirm('Confirm return of this book?')) return;
        try {
            const res = await secureFetch(`${import.meta.env.VITE_API_URL}/books/${bookId}/return`, {
                method: 'POST'
            });
            const result = await res.json();
            if (result.success) {
                if (result.fine > 0) {
                    setMessage({ type: 'error', text: `Book returned. Late fine applied: ₹${result.fine}` });
                } else {
                    setMessage({ type: 'success', text: 'Book returned successfully!' });
                }
                refreshMemberData();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server Error: Return failed.' });
        }
    };

    const payFine = async () => {
        if (!confirm('Confirm payment of all fines?')) return;
        try {
            const res = await secureFetch(`${import.meta.env.VITE_API_URL}/users/${currentMember.id}/clear-fine`, {
                method: 'POST'
            });
            const result = await res.json();
            if (result.success) {
                refreshMemberData();
                setMessage({ type: 'success', text: 'Fines cleared successfully!' });
            }
        } catch (err) {
            alert("Error clearing fine.");
        }
    };

    // ── Improved Scanner Logic (High Accuracy + Invert Support) ───

    useEffect(() => {
        if (!isScanning || !scanTarget) return;

        let html5QrCode;
        let isScannerRunning = false;

        const timeoutId = setTimeout(() => {
            html5QrCode = new Html5Qrcode('reader');
            scannerRef.current = html5QrCode;

            const config = {
                fps: 30, // Higher FPS = Higher accuracy
                qrbox: { width: 280, height: 280 },
                aspectRatio: 1.0,
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true // Uses hardware acceleration if available
                }
            };

            html5QrCode.start(
                { facingMode: 'environment' },
                config,
                (decodedText) => {
                    if (isScannerRunning) {
                        isScannerRunning = false;
                        html5QrCode.stop().then(() => {
                            html5QrCode.clear();
                            setIsScanning(false);
                            if (scanTarget === 'member') loadMember(decodedText);
                            else handleIssueBook(decodedText);
                        }).catch(e => console.error(e));
                    }
                },
                () => { /* scan failures ignored */ }
            ).then(() => {
                isScannerRunning = true;
            }).catch(err => {
                console.error(err);
                setIsScanning(false);
                alert('Camera error. Check permissions.');
            });
        }, 150);

        return () => {
            clearTimeout(timeoutId);
            if (html5QrCode && isScannerRunning) {
                html5QrCode.stop().then(() => html5QrCode.clear()).catch(e => console.error(e));
            }
        };
    }, [isScanning, scanTarget]);

    const startScan = (target) => {
        setScanTarget(target);
        setIsScanning(true);
    };

    const closeScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
                scannerRef.current.clear();
                setIsScanning(false);
            }).catch(() => setIsScanning(false));
        } else {
            setIsScanning(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Issue & Return</h1>
                    <p className="text-gray-500 text-sm">Scan QR codes to process books quickly.</p>
                </div>
                {currentMember && (
                    <button onClick={resetSession} className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-sm font-medium transition-colors">
                        <Trash2 size={16} /> New Session
                    </button>
                )}
            </div>

            {/* Stage 1: Identify Member */}
            {!currentMember ? (
                <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-50 p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                        <Camera className="text-indigo-600 w-10 h-10" />
                    </div>
                    <div className="max-w-sm mx-auto">
                        <h2 className="text-xl font-bold text-gray-800">Identify Member</h2>
                        <p className="text-gray-500 text-sm mt-1">Please scan the member's ID card QR code or enter their ID manually.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="text"
                            placeholder="M001..."
                            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-indigo-500 outline-none text-center font-bold tracking-widest text-gray-700"
                            value={memberIdInput}
                            onChange={(e) => setMemberIdInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadMember()}
                        />
                        <button onClick={() => loadMember()} className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition shadow-lg shadow-gray-200">
                            Find
                        </button>
                    </div>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative text-xs text-gray-400 font-bold bg-white px-4 inline-block uppercase tracking-widest">OR</div>
                    </div>

                    <button onClick={() => startScan('member')} className="w-full max-w-md bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 flex items-center justify-center gap-3">
                        <Camera size={20} /> Open QR Scanner
                    </button>
                </div>
            ) : (
                /* Stage 2: Process Books */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left: Member Profile */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="text-center">
                                <img src={currentMember.photoUrl} className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-md ring-1 ring-gray-100" />
                                <h3 className="mt-4 font-bold text-gray-800 text-lg">{currentMember.name}</h3>
                                <div className="text-indigo-600 font-mono text-sm font-bold bg-indigo-50 px-3 py-1 rounded-full inline-block mt-1">
                                    {currentMember.id}
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Aadhaar</span>
                                    <span className="font-bold text-gray-700">{currentMember.aadhaar || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Fine Owed</span>
                                    <span className={`font-bold ${currentMember.finesOwed > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        ₹{currentMember.finesOwed || 0}
                                    </span>
                                </div>
                                {currentMember.finesOwed > 0 && (
                                    <button onClick={payFine} className="w-full py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition">
                                        Clear Fines
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Recent Stat */}
                        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Session Hint</p>
                            <p className="text-sm mt-2 opacity-90">Now scanning for book IDs to issue to this member.</p>
                        </div>
                    </div>

                    {/* Right: Issue/Return Action */}
                    <div className="md:col-span-8 space-y-6">
                        {/* Status Message */}
                        {message && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                <span className="text-sm font-bold">{message.text}</span>
                            </div>
                        )}

                        {/* Scan Interface */}
                        <div className="bg-gray-800 rounded-3xl p-8 text-center text-white space-y-6 shadow-2xl relative overflow-hidden group">
                            {/* Animated pattern background */}
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Camera size={120} />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">Process Book</h3>
                                <p className="text-gray-400 text-sm">Scan the book's QR code to ISSUE</p>
                            </div>

                            <div className="flex gap-2 max-w-sm mx-auto">
                                <input
                                    type="text"
                                    placeholder="Book ID (e.g. B001)"
                                    className="flex-1 bg-white/10 border border-white/20 px-4 py-3 rounded-xl text-center font-bold tracking-widest focus:bg-white focus:text-gray-800 focus:outline-none transition-all"
                                    value={bookIdInput}
                                    onChange={(e) => setBookIdInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleIssueBook()}
                                />
                                <button onClick={() => handleIssueBook()} className="bg-white text-gray-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition shrink-0">
                                    Issue
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-4 py-2">
                                <div className="h-[1px] bg-white/10 flex-1"></div>
                                <div className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase">Ready to Scan</div>
                                <div className="h-[1px] bg-white/10 flex-1"></div>
                            </div>

                            <button onClick={() => startScan('book')} className="w-full py-4 bg-indigo-500 rounded-2xl font-bold hover:bg-indigo-400 transition-all flex items-center justify-center gap-3">
                                <Camera size={20} /> Launch Camera Scanner
                            </button>
                        </div>

                        {/* Currently Borrowed list for Return/Renewal */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <RotateCw size={18} className="text-indigo-600" /> Active Loans
                            </h3>
                            {/* This should be a list of books where issuedTo === currentMember.id */}
                            {/* For brevity, let's assume we fetch them and show them. */}
                            {/* We can just show a reminder or implement a small search/list */}
                            <p className="text-xs text-gray-400 italic">Please go to 'Manage Members' to see detailed return history or use the quick return scanner below.</p>
                            <button onClick={() => startScan('book-return')} className="mt-4 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-bold hover:bg-gray-50 transition">
                                Scan to Return Book
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Scanning Overlay */}
            {isScanning && (
                <div className="fixed inset-0 bg-black/95 z-[99] flex flex-col items-center justify-center p-6 backdrop-blur-md">
                    <button onClick={closeScanner} className="absolute top-6 right-6 text-white/60 hover:text-white transition p-2">
                        <XCircle size={32} />
                    </button>

                    <div className="w-full max-w-sm aspect-square relative rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
                        {/* Scan Area UI Overlay */}
                        <div className="absolute inset-0 z-10 pointer-events-none border-[40px] border-black/30"></div>
                        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-indigo-400 rounded-2xl relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                                {/* Scanning line animation */}
                                <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
                                <div className="absolute w-full h-1 bg-indigo-400 top-0 animate-scan"></div>
                            </div>
                        </div>

                        <div id="reader" className={`w-full h-full ${isInverted ? 'invert hue-rotate-180' : ''}`} style={{ filter: isInverted ? 'invert(1)' : 'none' }}></div>
                    </div>

                    <div className="mt-8 text-center space-y-4">
                        <h2 className="text-white text-xl font-bold">Scanning {scanTarget === 'member' ? 'Member ID' : 'Book ID'}</h2>
                        <p className="text-white/40 text-sm">Center the QR code in the box for best results.</p>
                        
                        {/* INVERT TOGGLE */}
                        <button 
                            onClick={() => setIsInverted(!isInverted)}
                            className={`px-6 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-2 mx-auto ${isInverted ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/60'}`}
                        >
                            <RotateCw size={14} /> {isInverted ? 'Invert Mode: ON' : 'Try Invert Mode (White Pattern)'}
                        </button>
                    </div>

                    {/* Scanner CSS Hack */}
                    <style>{`
                        @keyframes scan {
                            0% { top: 0% }
                            100% { top: 100% }
                        }
                        .animate-scan {
                            animation: scan 2s linear infinite;
                        }
                        #reader video {
                            object-fit: cover !important;
                            width: 100% !important;
                            height: 100% !important;
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default IssueReturn;
