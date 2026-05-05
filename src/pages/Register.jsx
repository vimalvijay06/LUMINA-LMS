import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, UserPlus, BookOpen, MapPin, Phone, CreditCard, Lock, User, Mail, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

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
    
    // Aadhaar-specific validation state
    const [aadhaarError, setAadhaarError] = useState('');
    const [aadhaarOk, setAadhaarOk] = useState(false);

    // Allow only digit characters and max 12 length
    const handleAadhaarChange = (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 12);
        setFormData(prev => ({ ...prev, aadhaar: digitsOnly }));
        setAadhaarError('');
        setAadhaarOk(digitsOnly.length === 12);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        if (formData.aadhaar.length !== 12) {
            setError('Aadhaar Number must be exactly 12 digits.');
            setLoading(false);
            return;
        }

        const { confirmPassword, ...data } = formData;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (result.success) {
                setSuccess('Application Submitted! Please wait for admin approval.');
                setTimeout(() => navigate('/login', { state: { role: 'MEMBER' } }), 2000);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Server Error: Connection failed. Check if backend is running.');
        }
        setLoading(false);
    };

    return (
        <div className="register-wrapper">
            <div className="register-card">

                {/* ── Left Panel: Visual & Info ───────────────────── */}
                <div className="register-left-panel">
                    {/* Decorative Circles */}
                    <div className="register-deco-circle-tr"></div>
                    <div className="register-deco-circle-bl"></div>

                    <div>
                        <div className="register-logo-box">
                            <UserPlus size={32} className="text-white" />
                        </div>
                        <h1 className="register-heading">Member Registration</h1>
                        <p className="register-subtext">
                            Apply for a library membership to access books and digital resources.
                        </p>

                    </div>

                    <div className="register-footer">&copy; 2026 Lumina Library Systems</div>
                </div>

                {/* ── Right Panel: Form ───────────────────────────── */}
                <div className="register-right-panel">
                    <div className="register-form-header">
                        <h2 className="register-form-title">Membership Application</h2>
                        <Link to="/login" className="register-login-link">Login Instead</Link>
                    </div>

                    {error && (
                        <div className="alert-error">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert-success">
                            <ShieldCheck size={16} />
                            {success} - Redirecting...
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="register-form">

                        {/* Row 1: Name + Email */}
                        <div className="register-form-grid">
                            <div className="field-group">
                                <label className="form-label">Full Name</label>
                                <div className="relative">
                                    <div className="input-icon-wrapper">
                                        <User size={16} className="input-icon" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="form-input"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="field-group">
                                <label className="form-label">Email</label>
                                <div className="relative">
                                    <div className="input-icon-wrapper">
                                        <Mail size={16} className="input-icon" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="form-input"
                                        placeholder="john@example.com"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Phone + Reference ID */}
                        <div className="register-form-grid">
                            <div className="field-group">
                                <label className="form-label">Phone Number</label>
                                <div className="relative">
                                    <div className="input-icon-wrapper">
                                        <Phone size={16} className="input-icon" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        className="form-input"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="field-group">
                                <label className="form-label">Reference ID</label>
                                <div className="relative">
                                    <div className="input-icon-wrapper">
                                        <User size={16} className="input-icon" />
                                    </div>
                                    <input
                                        type="text"
                                        name="referenceId"
                                        required
                                        className="form-input"
                                        placeholder="Ref ID (e.g. M001)"
                                        value={formData.referenceId}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="field-group">
                            <label className="form-label">Residential Address</label>
                            <div className="relative">
                                <div className="input-icon-wrapper-top">
                                    <MapPin size={16} className="input-icon" />
                                </div>
                                <textarea
                                    name="address"
                                    required
                                    rows="2"
                                    className="form-textarea"
                                    placeholder="Full street address, District, Pincode"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Aadhaar */}
                        <div className="field-group">
                            <div className="flex justify-between items-center">
                                <label className="form-label">Aadhaar Number</label>
                                {/* Live digit counter */}
                                <span className={`text-xs font-mono font-bold ${formData.aadhaar.length === 12 ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                    {formData.aadhaar.length}/12
                                </span>
                            </div>
                            <div className="relative">
                                <div className="input-icon-wrapper">
                                    <CreditCard size={16} className="input-icon" />
                                </div>
                                <input
                                    type="text"
                                    name="aadhaar"
                                    required
                                    inputMode="numeric"
                                    placeholder="Enter 12-digit Aadhaar Number"
                                    maxLength="12"
                                    className={`form-input-mono ${aadhaarError
                                            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                                            : aadhaarOk
                                                ? 'border-green-400 focus:ring-green-400 focus:border-green-400'
                                                : ''
                                        }`}
                                    value={formData.aadhaar}
                                    onChange={handleAadhaarChange}
                                />
                                {/* Status icon on the right */}
                                {(aadhaarError || aadhaarOk) && (
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        {aadhaarOk
                                            ? <CheckCircle2 size={18} className="text-green-500" />
                                            : <XCircle size={18} className="text-red-500" />
                                        }
                                    </div>
                                )}
                            </div>
                            {/* Inline error below field */}
                            {aadhaarError && (
                                <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                                    <XCircle size={12} />
                                    {aadhaarError}
                                </p>
                            )}
                            {aadhaarOk && (
                                <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                    <CheckCircle2 size={12} />
                                    Aadhaar verified — no duplicates found.
                                </p>
                            )}
                        </div>

                        {/* Row 3: Passwords */}
                        <div className="register-form-grid">
                            <div className="field-group">
                                <label className="form-label">Create Password</label>
                                <div className="relative">
                                    <div className="input-icon-wrapper">
                                        <Lock size={16} className="input-icon" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="form-input"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="field-group">
                                <label className="form-label">Confirm Password</label>
                                <div className="relative">
                                    <div className="input-icon-wrapper">
                                        <Lock size={16} className="input-icon" />
                                    </div>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        className="form-input"
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? <Loader2 className="animate-spin" /> : 'Apply for Membership'}
                        </button>

                        <p className="register-tos">
                            By registering, you agree to Lumina Library's Terms & Conditions.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
