import { useState, useEffect } from 'react';
import { 
    User, Mail, Phone, MapPin, Calendar, IdCard, 
    Edit3, Save, X, Camera, CheckCircle2, AlertCircle, 
    Loader2, ShieldCheck, Fingerprint 
} from 'lucide-react';
import { getCurrentUser, loginUser, secureFetch } from '../../utils/auth';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        photoUrl: ''
    });

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const currentUser = getCurrentUser();
            if (!currentUser || !currentUser.id) {
                console.error('No logged-in user or ID found in localStorage');
                setLoading(false);
                return;
            }

            const res = await secureFetch(`${API_URL}/users/${currentUser.id}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const result = await res.json();

            if (result.success && result.user) {
                // Ensure ID field is preserved if backend uses _id
                const userData = { ...result.user, id: result.user.id || currentUser.id };
                setUser(userData);
                setFormData({
                    name: userData.name || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    photoUrl: userData.photoUrl || ''
                });
                // Sync session storage
                loginUser(userData);
            } else {
                console.error('API returned failure:', result.message);
                setMessage({ type: 'error', text: result.message || 'Profile session expired. Please log in again.' });
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setMessage({ type: 'error', text: 'Connection failed. Ensure backend is running.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaveLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await secureFetch(`${API_URL}/users/${user.id}`, {
                method: 'PATCH',
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (result.success) {
                setUser(result.user);
                loginUser(result.user);
                setIsEditing(false);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                
                // Clear message after 3 seconds
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server error. Please try again.' });
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Loading your profile...</p>
            </div>
        );
    }

    if (!user) return (
        <div className="p-8 text-center text-red-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Profile Not Found</h2>
            <p>We couldn't load your profile information. Please try logging in again.</p>
        </div>
    );

    const hasFines = (user.finesOwed || 0) > 0;

    return (
        <div className="centered-page px-4 pb-20">
            {/* ── Header Section ────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="page-title">Member Profile</h1>
                    <p className="page-subtitle">Manage your personal information and account status</p>
                </div>
                
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 font-semibold hover:bg-indigo-100 transition-all active:scale-95"
                    >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl border border-gray-200 font-semibold hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saveLoading}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                            {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            {message.text && (
                <div className={`flex items-center gap-3 p-4 rounded-xl border mb-6 animate-in fade-in slide-in-from-top-4 duration-300 ${
                    message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="font-medium text-sm">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ── Left Column: Avatar & Status ───────────────────── */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card-section text-center relative pt-12">
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                                user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                                {user.status}
                            </span>
                        </div>

                        {/* Avatar */}
                        <div className="relative inline-block group mb-4">
                            <img 
                                src={formData.photoUrl || user.photoUrl} 
                                alt="Profile" 
                                className="w-32 h-32 rounded-3xl object-cover ring-4 ring-white shadow-xl mx-auto"
                            />
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                        <p className="text-gray-500 text-sm mb-6">{user.email}</p>

                        <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
                            <div className="flex items-center justify-between text-xs px-2">
                                <span className="text-gray-400 font-medium">Member ID</span>
                                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{user.id}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs px-2">
                                <span className="text-gray-400 font-medium">Joined Library</span>
                                <span className="text-gray-700 font-semibold">{user.joinedDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Fine Summary Card */}
                    <div className={`card-section ${hasFines ? 'bg-red-50/50 border-red-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg ${hasFines ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-800">Account Health</h3>
                        </div>
                        
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Fines Owed</p>
                                <p className={`text-3xl font-black ${hasFines ? 'text-red-600' : 'text-emerald-600'}`}>
                                    ₹{user.finesOwed || 0}
                                </p>
                            </div>
                            {hasFines && (
                                <div className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold uppercase tracking-tighter animate-pulse">
                                    Action Required
                                </div>
                            )}
                        </div>
                        <p className="text-xs mt-4 text-gray-500 leading-relaxed font-medium">
                            {hasFines 
                                ? "Outstanding fines must be settled at the librarian's desk." 
                                : "Your account is in good standing."}
                        </p>
                    </div>
                </div>

                {/* ── Right Column: Details & Forms ──────────────────── */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card-section-lg">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Fingerprint className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-800">Identity Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                                    <User className="w-3 h-3" /> Full Name
                                </label>
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    value={isEditing ? formData.name : user.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className={isEditing ? "form-input-edit" : "form-input-readonly-v2"}
                                />
                            </div>

                            {/* Email (Read Only) */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                                    <Mail className="w-3 h-3" /> Email Address
                                </label>
                                <input 
                                    type="email" 
                                    disabled
                                    value={user.email}
                                    className="form-input-locked"
                                />
                                <p className="text-[10px] text-gray-400 pl-1 italic">Email cannot be changed after registration</p>
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                                    <Phone className="w-3 h-3" /> Phone Number
                                </label>
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    value={isEditing ? formData.phone : (user.phone || 'Not provided')}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className={isEditing ? "form-input-edit" : "form-input-readonly-v2"}
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>

                            {/* Aadhaar (Locked) */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                                    <IdCard className="w-3 h-3" /> Aadhaar ID
                                </label>
                                <input 
                                    type="text" 
                                    disabled
                                    value={user.aadhaar || 'Verified Primary Account'}
                                    className="form-input-locked font-mono"
                                />
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                                    <MapPin className="w-3 h-3" /> Residential Address
                                </label>
                                <textarea 
                                    disabled={!isEditing}
                                    value={isEditing ? formData.address : (user.address || 'Not provided')}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    rows="3"
                                    className={isEditing ? "form-textarea-edit" : "form-textarea-readonly-v2"}
                                    placeholder="Enter your full street address..."
                                />
                            </div>

                            {/* Photo URL (Only visible in edit) */}
                            {isEditing && (
                                <div className="md:col-span-2 space-y-1.5 animate-in slide-in-from-bottom-2 duration-300">
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                                        <Camera className="w-3 h-3" /> Profile Image URL
                                    </label>
                                    <input 
                                        type="text" 
                                        value={formData.photoUrl}
                                        onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                                        className="form-input-edit"
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center gap-4">
                            <div className="bg-violet-50 p-3 rounded-xl text-violet-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">Account Age</p>
                                <p className="font-bold text-gray-800">
                                    {Math.floor((new Date() - new Date(user.joinedDate)) / (1000 * 60 * 60 * 24))} Days
                                </p>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center gap-4">
                            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">Active Status</p>
                                <p className="font-bold text-gray-800">Verified Member</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Injected Styles for the new classes used here */}
            <style dangerouslySetInnerHTML={{ __html: `
                .form-input-readonly-v2 {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background-color: transparent;
                    border: 1px solid #f1f5f9;
                    border-radius: 0.75rem;
                    color: #334155;
                    font-weight: 600;
                    cursor: default;
                }
                .form-input-locked {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background-color: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 0.75rem;
                    color: #94a3b8;
                    cursor: not-allowed;
                }
                .form-input-edit {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background-color: white;
                    border: 2px solid #eef2ff;
                    border-radius: 0.75rem;
                    color: #1e293b;
                    outline: none;
                    transition: all 0.2s;
                }
                .form-input-edit:focus {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
                }
                .form-textarea-readonly-v2 {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background-color: transparent;
                    border: 1px solid #f1f5f9;
                    border-radius: 0.75rem;
                    color: #334155;
                    font-weight: 600;
                    resize: none;
                }
                .form-textarea-edit {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background-color: white;
                    border: 2px solid #eef2ff;
                    border-radius: 0.75rem;
                    color: #1e293b;
                    outline: none;
                    transition: all 0.2s;
                    resize: none;
                }
                .form-textarea-edit:focus {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
                }
            `}} />
        </div>
    );
};

export default Profile;
