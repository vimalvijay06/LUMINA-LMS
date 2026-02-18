import { Link, useNavigate } from 'react-router-dom';
import { Library, BookOpen, Users, ShieldCheck, Search, LayoutGrid, ArrowRight } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            {/* --- Navigation --- */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <Library className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                Lumina LMS
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/login', { state: { role: 'MEMBER' } })}
                                className="text-slate-600 hover:text-indigo-600 font-medium px-3 py-2 transition-colors"
                            >
                                Member Login
                            </button>
                            <button
                                onClick={() => navigate('/login', { state: { role: 'ADMIN' } })}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
                            >
                                Admin Portal <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <header className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                        <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                            <div className="inline-flex items-center px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wide uppercase mb-6">
                                <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2 animate-pulse"></span>
                                Next Gen Library System
                            </div>
                            <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                                <span className="block xl:inline">Smart Management for</span>{' '}
                                <span className="block text-indigo-600 xl:inline">Modern Libraries</span>
                            </h1>
                            <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                Experience a seamless digital ecosystem for managing books, members, and library resources.
                                Features an advanced floor-plan studio, digital ID cards, and real-time tracking.
                            </p>
                            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex gap-4 flex-col sm:flex-row">
                                <button onClick={() => navigate('/login', { state: { role: 'MEMBER' } })} className="px-8 py-3.5 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 md:text-lg md:px-10 shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1">
                                    Get Started as Member
                                </button>
                                <Link to="/register" className="px-8 py-3.5 border border-slate-200 text-base font-medium rounded-lg text-indigo-600 bg-white hover:bg-slate-50 md:text-lg md:px-10 transition-all">
                                    Apply for Membership
                                </Link>
                            </div>
                        </div>
                        <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                            <div className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md bg-white p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="absolute -top-4 -left-4 w-20 h-20 bg-indigo-400/20 rounded-full blur-2xl"></div>
                                <div className="relative bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                                    <div className="p-4 border-b bg-white flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        </div>
                                        <div className="h-2 w-20 bg-slate-200 rounded-full"></div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="h-32 bg-indigo-50 rounded-lg flex items-center justify-center border-2 border-dashed border-indigo-200">
                                            <LayoutGrid className="text-indigo-300 w-12 h-12" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Features Grid --- */}
            <div className="bg-slate-50 py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
                        <p className="mt-1 text-3xl font-extrabold text-slate-900 sm:text-4xl sm:tracking-tight">
                            Everything needed to run a library.
                        </p>
                    </div>
                    <div className="mt-16">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon={Search}
                                title="Smart Book Search"
                                desc="Members can find books instantly, locate them on a visual floor map, and reserve them remotely."
                            />
                            <FeatureCard
                                icon={LayoutGrid}
                                title="Visual Floor Studio"
                                desc="Admins can design and update the library layout with a drag-and-drop editor."
                            />
                            <FeatureCard
                                icon={Users}
                                title="Member Management"
                                desc="Track memberships, approvals, fines, and borrowing history in one dashboard."
                            />
                            <FeatureCard
                                icon={ShieldCheck}
                                title="Role-Based Security"
                                desc="Secure login portals for Admins and Members with dedicated permissions."
                            />
                            <FeatureCard
                                icon={BookOpen}
                                title="Waitlist System"
                                desc="Automated queue management for popular books with notification alerts."
                            />
                            <FeatureCard
                                icon={Library}
                                title="Digital ID Cards"
                                desc="Members get a unique QR-code based ID for quick scanning at the desk."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Footer --- */}
            <footer className="bg-white border-t border-slate-200">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center md:flex-row flex-col gap-4">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Library className="w-5 h-5" />
                            <span className="font-semibold text-slate-500">Lumina LMS</span>
                        </div>
                        <p className="text-center text-base text-slate-400">
                            &copy; 2026 Lumina Library Systems. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="pt-6">
        <div className="flow-root bg-white rounded-2xl px-6 pb-8 h-full shadow-sm hover:shadow-md transition-shadow border border-slate-100">
            <div className="-mt-6">
                <div>
                    <span className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </span>
                </div>
                <h3 className="mt-8 text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
                <p className="mt-5 text-base text-slate-500">{desc}</p>
            </div>
        </div>
    </div>
);

export default Landing;
