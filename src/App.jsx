import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import AppLayout from './layouts/Layout';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageBooks from './pages/admin/ManageBooks';
import ManageMembers from './pages/admin/ManageMembers';
import IssueReturn from './pages/admin/IssueReturn';
import BookingRequests from './pages/admin/BookingRequests';
import RackLayout from './pages/admin/RackLayout';
import AdminProfile from './pages/admin/Profile';

// Member pages
import MemberDashboard from './pages/member/Dashboard';
import SearchBooks from './pages/member/SearchBooks';
import MemberProfile from './pages/member/Profile';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ── Public ── */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin-register" element={<AdminRegister />} />

                {/* ── Admin (protected) ── */}
                <Route path="/admin" element={<AppLayout allowedRoles={['ADMIN']} />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="manage-books" element={<ManageBooks />} />
                    <Route path="manage-members" element={<ManageMembers />} />
                    <Route path="issue-return" element={<IssueReturn />} />
                    <Route path="booking-requests" element={<BookingRequests />} />
                    <Route path="rack-layout" element={<RackLayout />} />
                    <Route path="profile" element={<AdminProfile />} />
                </Route>

                {/* ── Member (protected) ── */}
                <Route path="/member" element={<AppLayout allowedRoles={['MEMBER']} />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<MemberDashboard />} />
                    <Route path="search-books" element={<SearchBooks />} />
                    <Route path="profile" element={<MemberProfile />} />
                </Route>

                {/* ── Catch-all ── */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
