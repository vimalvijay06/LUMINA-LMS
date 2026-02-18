import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../utils/mockData';
import { ShieldCheck, Loader2 } from 'lucide-react';

const AdminRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        branch: '',
        district: '',
        librarianName: '',
        librarianId: '',
        phone: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        // Simulate API call
        setTimeout(() => {
            const { confirmPassword, ...data } = formData;
            const result = db.registerAdmin(data);

            if (result.success) {
                alert('Admin Registration Successful!');
                navigate('/login', { state: { role: 'ADMIN' } });
            } else {
                setError(result.message);
                setLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                {/* Left Panel */}
                <div className="bg-slate-900 p-8 text-white md:w-1/3 flex flex-col justify-center text-center">
                    <div className="mx-auto bg-white/10 p-4 rounded-full mb-4">
                        <ShieldCheck size={40} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Admin Portal</h2>
                    <p className="text-slate-400 text-sm">Register new library branch administrator.</p>
                </div>

                {/* Right Panel - Form */}
                <div className="p-8 md:w-2/3">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Admin Account</h2>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input type="text" name="name" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                <input type="email" name="email" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500" onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                                <input type="password" name="password" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm Password</label>
                                <input type="password" name="confirmPassword" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500" onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Library Branch</label>
                                <input type="text" name="branch" required placeholder="e.g. Central Library" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">District</label>
                                <input type="text" name="district" required placeholder="e.g. Chennai" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500" onChange={handleChange} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Librarian Name</label>
                                <input type="text" name="librarianName" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Librarian ID</label>
                                <input type="text" name="librarianId" required placeholder="LIB-001" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500" onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Official Phone</label>
                            <input type="tel" name="phone" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500" onChange={handleChange} />
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors flex justify-center items-center gap-2">
                            {loading ? <Loader2 className="animate-spin" /> : 'Register Administrator'}
                        </button>

                        <div className="text-center text-sm text-gray-500 mt-4">
                            Already have an account? <br />
                            <Link to="/login" state={{ role: 'ADMIN' }} className="text-slate-700 font-bold hover:underline">
                                Login to Admin Portal
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminRegister;
