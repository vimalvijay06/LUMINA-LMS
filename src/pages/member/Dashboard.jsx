import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { getCurrentUser, loginUser, secureFetch } from '../../utils/auth';
import { CreditCard, BookOpen, Clock, AlertTriangle, Loader2, Sparkles, User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MemberDashboard = () => {
    const [user, setUser] = useState(getCurrentUser());
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [stats, setStats] = useState({ issued: [], reserved: [], waitlist: [], fines: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    const loadDashboardData = async () => {
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.id) {
            setError('Account session invalid. Please log in again.');
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            // 1. Fetch Fresh User Profile
            const userRes = await secureFetch(`${API_URL}/users/${currentUser.id}`);
            const userData = await userRes.json();
            
            let latestUser = currentUser;
            if (userData.success && userData.user) {
                latestUser = { ...userData.user, id: userData.user.id || currentUser.id };
                setUser(latestUser);
                loginUser(latestUser); // Sync localStorage
            }

            // 2. Fetch Books for stats
            const booksRes = await secureFetch(`${API_URL}/books`);
            const books = await booksRes.json();

            if (Array.isArray(books)) {
                const issued = books.filter(b => b.issuedToId === latestUser.id && b.status === 'ISSUED');
                const reserved = books.filter(b => b.issuedToId === latestUser.id && b.status === 'RESERVED');
                const waitlist = books.filter(b => b.waitlist && b.waitlist.includes(latestUser.id));

                setStats({ issued, reserved, waitlist, fines: latestUser.finesOwed || 0 });
            }

            // 3. Generate QR Data URL
            const qr = await QRCode.toDataURL(latestUser.id, {
                width: 300,
                margin: 2,
                color: { dark: '#1e1b4b', light: '#ffffff' }
            });
            setQrDataUrl(qr);

        } catch (err) {
            console.error('Dashboard synchronization failed:', err);
            setError('Network sync failed. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleRenew = async (bookId) => {
        try {
            const res = await secureFetch(`${API_URL}/books/${bookId}/renew`, { method: 'POST' });
            const result = await res.json();
            if (result.success) {
                alert('Success! Return date extended by 14 days.');
                loadDashboardData();
            } else {
                alert(result.message);
            }
        } catch (err) {
            alert('Renewal failed. Please contact librarian.');
        }
    };

    const handleCancel = (bookId) => {
        alert('Please visit the library desk to cancel active reservations.');
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-gray-400 font-medium">Syncing library cloud...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Error Banner */}
            {error && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 text-amber-800">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* ── Welcome Header ────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        Welcome back, {user?.name.split(' ')[0]} <Sparkles className="text-amber-400 w-6 h-6" />
                    </h1>
                    <p className="text-slate-500 font-medium">Dashboard • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="px-4 py-2 border-r border-slate-100 hidden sm:block">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Status</p>
                        <p className="text-sm font-bold text-emerald-600">Member Verified</p>
                    </div>
                    <Link to="/member/profile" className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors">
                        Quick Edit <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ── Left Sidebar (Global ID Card) ─────────────────── */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                        {/* Decorative elements */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-400/30 transition-colors duration-700"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
                        
                        <div className="flex justify-between items-start mb-10">
                            <div className="space-y-1">
                                <div className="font-black tracking-[0.2em] text-[10px] text-indigo-300 uppercase">Lumina Library</div>
                                <div className="text-[9px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                                    V1.4 DIGITAL PASS <CreditCard className="w-3 h-3 text-indigo-400" />
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                                <User className="w-5 h-5 text-indigo-300" />
                            </div>
                        </div>

                        <div className="flex flex-col items-center mb-8 relative z-10">
                            <div className="relative mb-6">
                                <div className="absolute inset-x-[-20%] inset-y-[-20%] bg-indigo-500 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity"></div>
                                <img 
                                    src={user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=random`} 
                                    alt="User" 
                                    className="w-28 h-28 rounded-full object-cover border-4 border-white/10 relative z-10 shadow-2xl" 
                                />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-center text-white">{user?.name}</h2>
                            <p className="text-indigo-300/80 text-sm font-medium tracking-wide mt-1">{user?.email}</p>
                        </div>

                        {/* QR Code Container */}
                        <div className="bg-white rounded-[2.5rem] p-6 flex justify-center shadow-inner mb-6 transform group-hover:scale-[1.03] transition-all duration-500 ring-4 ring-white/5">
                            {qrDataUrl ? (
                                <img src={qrDataUrl} alt="Library Access QR" className="w-36 h-36 rounded-xl" />
                            ) : (
                                <div className="w-36 h-36 bg-gray-50 rounded-xl flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-indigo-100 animate-spin" />
                                </div>
                            )}
                        </div>

                        <div className="text-center font-mono text-xl tracking-[0.4em] font-black text-white drop-shadow-lg select-all bg-white/5 py-3 rounded-2xl border border-white/5">
                            {user?.id}
                        </div>
                    </div>

                    {stats.fines > 0 && (
                        <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-6 shadow-sm flex items-start gap-4 animate-in slide-in-from-left-4 duration-500">
                            <div className="bg-rose-500 text-white p-2.5 rounded-2xl shadow-lg shadow-rose-200">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-rose-900">Fine Notification</h3>
                                <p className="text-sm text-rose-700 font-medium mb-1 flex items-center gap-1.5">
                                    Outstanding: <span className="text-lg font-black">₹{stats.fines}</span>
                                </p>
                                <p className="text-[11px] text-rose-600 leading-tight">Clear dues at the desk to maintain borrowing privileges.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right Content Area (Activity) ────────────────── */}
                <div className="lg:col-span-8 space-y-8 text-slate-800">
                    
                    {/* Activity Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-indigo-600 rounded-[2.5rem] p-7 text-white shadow-xl shadow-indigo-100 border border-indigo-500">
                            <div className="bg-white/20 w-11 h-11 rounded-2xl flex items-center justify-center mb-5 backdrop-blur-md">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Loans</p>
                            <p className="text-4xl font-black">{stats.issued.length}</p>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-7 shadow-sm group hover:border-amber-200 transition-colors">
                            <div className="bg-amber-50 text-amber-500 w-11 h-11 rounded-2xl flex items-center justify-center mb-5 border border-amber-100 group-hover:bg-amber-100 transition-colors">
                                <Clock className="w-6 h-6" />
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Hold List</p>
                            <p className="text-4xl font-black text-slate-800">{stats.reserved.length}</p>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-7 shadow-sm hidden md:block group hover:border-emerald-200 transition-colors">
                            <div className="bg-emerald-50 text-emerald-500 w-11 h-11 rounded-2xl flex items-center justify-center mb-5 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Waitlist</p>
                            <p className="text-4xl font-black text-slate-800">{stats.waitlist.length}</p>
                        </div>
                    </div>

                    {/* Currently Issued Section */}
                    <section>
                        <div className="flex justify-between items-end mb-6 px-1">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                    <span className="w-2 h-7 bg-indigo-600 rounded-full"></span>
                                    On My Shelf
                                </h3>
                                <p className="text-slate-400 text-sm font-medium mt-1">Books currently issued to you</p>
                            </div>
                            <Link to="/member/search-books" className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:text-indigo-700 underline underline-offset-8">Explore All</Link>
                        </div>

                        {stats.issued.length === 0 ? (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-16 text-center group cursor-pointer hover:bg-white hover:border-indigo-200 transition-all duration-500">
                                <div className="bg-white w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100 group-hover:rotate-12 transition-transform duration-500">
                                    <BookOpen className="w-10 h-10 text-slate-200" />
                                </div>
                                <h4 className="font-black text-slate-400 text-xl mb-2 tracking-tight">No active loans</h4>
                                <p className="text-sm text-slate-400 max-w-xs mx-auto font-medium">Browse our catalog to borrow books.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {stats.issued.map(book => {
                                    const isOverdue = new Date() > new Date(book.dueDate);
                                    return (
                                        <div key={book.id} className={`group bg-white border rounded-[2.5rem] p-6 flex gap-6 hover:shadow-2xl hover:translate-y-[-6px] transition-all duration-500 ${isOverdue ? 'border-rose-100 bg-rose-50/30' : 'border-slate-50'}`}>
                                            <div className="relative shrink-0">
                                                <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                                <img src={book.coverUrl} className="w-24 h-32 object-cover rounded-2xl shadow-xl rotate-[-3deg] group-hover:rotate-0 transition-all duration-500 relative z-10" />
                                                {isOverdue && <div className="absolute -top-2 -left-2 bg-rose-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-lg z-20 border-2 border-white uppercase tracking-tighter">Overdue</div>}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <h4 className="font-black text-slate-900 leading-[1.2] line-clamp-2 text-lg">{book.title}</h4>
                                                    <p className="text-xs text-slate-400 font-bold tracking-tight mt-1.5">{book.author}</p>
                                                </div>
                                                <div className="mt-5 space-y-3">
                                                     <div className="flex items-center gap-2">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${isOverdue ? 'bg-rose-500 animate-pulse' : 'bg-indigo-300'}`}></div>
                                                        <p className={`text-[11px] font-black uppercase tracking-tight ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>
                                                            Due {new Date(book.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </p>
                                                     </div>
                                                     <button 
                                                        onClick={() => handleRenew(book.id)}
                                                        className="w-full bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-widest py-3 rounded-2xl border border-slate-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm active:scale-95"
                                                     >
                                                        Extend Period
                                                     </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </section>

                    {/* Pending Reservations */}
                    {stats.reserved.length > 0 && (
                        <section className="animate-in slide-in-from-bottom-8 duration-700">
                             <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 pl-1 mb-6 mt-12">
                                <span className="w-2 h-7 bg-amber-400 rounded-full"></span>
                                Pickup Desk
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {stats.reserved.map(book => (
                                    <div key={book.id} className="bg-amber-50/50 border border-amber-100 rounded-[2.5rem] p-6 flex gap-6 group hover:bg-amber-50 transition-colors">
                                        <img src={book.coverUrl} className="w-16 h-24 object-cover rounded-xl shadow-xl border-2 border-white group-hover:scale-110 transition-transform" />
                                        <div className="flex-1">
                                            <h4 className="font-black text-amber-900 leading-tight line-clamp-1">{book.title}</h4>
                                            <p className="text-[10px] text-amber-700 font-black uppercase tracking-widest mt-2">Hold until {new Date(book.dueDate).toLocaleDateString()}</p>
                                            <div className="mt-5 flex gap-3">
                                                <div className="bg-amber-500 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-lg shadow-amber-200 uppercase tracking-widest">
                                                    Reserved
                                                </div>
                                                <button 
                                                    onClick={() => handleCancel(book.id)}
                                                    className="text-xs font-black text-amber-800 opacity-60 hover:opacity-100 transition-opacity hover:underline"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s ease-in-out infinite;
                }
            `}} />
        </div>
    );
};

export default MemberDashboard;
