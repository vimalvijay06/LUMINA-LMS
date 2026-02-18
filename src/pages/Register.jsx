import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../utils/mockData';
import { Loader2, UserPlus, BookOpen, MapPin, Phone, CreditCard, Lock, User, Mail, ShieldCheck } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        aadhaar: '',
        referenceId: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (formData.aadhaar.length !== 12) {
            setError('Aadhaar Number must be exactly 12 digits');
            setLoading(false);
            return;
        }

        setTimeout(() => {
            const { confirmPassword, ...data } = formData;
            const result = db.register(data);

            if (result.success) {
                setSuccess('Application Submitted Successfully!');
                // Optional: Clear form or redirect
                setTimeout(() => navigate('/login', { state: { role: 'MEMBER' } }), 2000);
            } else {
                setError(result.message);
            }
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

                {/* Left Panel: Visual & Info */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-white md:w-5/12 flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                    <div>
                        <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                            <UserPlus size={32} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-4">Join Our Community of Readers</h1>
                        <p className="text-indigo-100 leading-relaxed mb-6">
                            Unlock access to thousands of books, digital resources, and exclusive member events.
                            Start your journey today.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-indigo-100">
                                <BookOpen size={20} />
                                <span className="text-sm font-medium">Unlimited borrowing privileges</span>
                            </div>
                            <div className="flex items-center gap-3 text-indigo-100">
                                <CreditCard size={20} />
                                <span className="text-sm font-medium">Digital Membership Card</span>
                            </div>
                            <div className="flex items-center gap-3 text-indigo-100">
                                <ShieldCheck size={20} />
                                <span className="text-sm font-medium">Secure & Private Access</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-sm text-indigo-200">
                        &copy; 2026 Lumina Library Systems
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className="p-10 md:w-7/12 bg-white">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Membership Application</h2>
                        <Link to="/login" className="text-sm text-indigo-600 font-bold hover:underline">
                            Login Instead
                        </Link>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-pulse">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
                            <ShieldCheck size={16} />
                            {success} - Redirecting...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-300"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-300"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-300"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Reference ID</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="referenceId"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-300"
                                        placeholder="Ref ID (e.g. M001)"
                                        value={formData.referenceId}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Residential Address</label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <MapPin size={16} className="text-gray-400" />
                                </div>
                                <textarea
                                    name="address"
                                    required
                                    rows="2"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-300 resize-none"
                                    placeholder="Full street address, District, Pincode"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Aadhaar Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CreditCard size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="aadhaar"
                                    required
                                    placeholder="12-digit Aadhaar Number"
                                    maxLength="12"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-300 tracking-wide font-mono"
                                    value={formData.aadhaar}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Create Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-300"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-300"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all transform active:scale-[0.99] flex justify-center items-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Apply for Membership'}
                        </button>

                        <p className="text-xs text-center text-gray-400 mt-4">
                            By registering, you agree to Lumina Library's Terms & Conditions.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
