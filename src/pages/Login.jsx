import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, Library, ShieldCheck, User } from 'lucide-react';
import { db } from '../utils/mockData';
import { loginUser } from '../utils/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Determine context based on navigation
    const navigate = useNavigate();
    const location = useLocation();
    const predefinedRole = location.state?.role || '';

    useEffect(() => {
        // Pre-fill email for demo purposes if role is selected
        if (predefinedRole === 'ADMIN') setEmail('admin@library.com');
        if (predefinedRole === 'MEMBER') setEmail('vimal@example.com');
    }, [predefinedRole]);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate network delay
        setTimeout(() => {
            const result = db.login(email, password);

            if (result.success) {
                // Security Check: If user came from a specific portal link, ensure role matches
                if (predefinedRole && result.user.role !== predefinedRole) {
                    setError(`Access Denied: You cannot login to the ${predefinedRole} portal with a ${result.user.role} account.`);
                    setLoading(false);
                    return;
                }

                loginUser(result.user);
                const from = location.state?.from?.pathname || (result.user.role === 'ADMIN' ? '/admin/dashboard' : '/member/dashboard');
                navigate(from, { replace: true });
            } else {
                setError(result.message);
                setLoading(false);
            }
        }, 800);
    };



    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-indigo-200/20 rounded-full blur-3xl"></div>
                <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-violet-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden relative z-10 border border-slate-100">
                <div className={`p-8 text-center ${predefinedRole === 'ADMIN' ? 'bg-slate-900' : 'bg-indigo-600'}`}>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                            {predefinedRole === 'ADMIN' ? (
                                <ShieldCheck className="w-8 h-8 text-white" />
                            ) : predefinedRole === 'MEMBER' ? (
                                <User className="w-8 h-8 text-white" />
                            ) : (
                                <Library className="w-8 h-8 text-white" />
                            )}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {predefinedRole ? `${predefinedRole} Portal` : 'Welcome Back'}
                    </h2>
                    <p className={`${predefinedRole === 'ADMIN' ? 'text-slate-400' : 'text-indigo-100'}`}>
                        Sign in to access your account
                    </p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r flex items-center shadow-sm">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 focus:bg-white"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full font-semibold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg 
                            ${predefinedRole === 'ADMIN'
                                    ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-200'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}`}
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign In'}
                        </button>

                        {!predefinedRole && (
                            <div className="text-center mt-4 text-xs text-gray-400">
                                <p>Demo Admin: admin@library.com / admin</p>
                                <p>Demo Member: vimal@example.com / user123</p>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-100">
                            <Link to="/" className="text-sm text-gray-500 hover:text-gray-800">Back</Link>
                            <span className="text-gray-300">|</span>
                            {predefinedRole === 'ADMIN' ? (
                                <Link to="/admin-register" className="text-sm text-slate-600 hover:text-slate-900 font-bold">Register Admin</Link>
                            ) : (
                                <Link to="/register" className="text-sm text-indigo-600 hover:underline font-medium">New Member?</Link>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
