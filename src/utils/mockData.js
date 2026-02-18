// Persistent Data Store using LocalStorage
// usage: import { db } from './mockData.js'

export const RULES = {
    ISSUE_DAYS: 14,
    FINE_PER_DAY: 10, // ₹10 per day
    MAX_BOOKS_PER_MEMBER: 3,
    MAX_FINE_LIMIT: 50 // Block if fine > ₹50
};

const SEED_USERS = [
    {
        id: 'U001',
        name: 'Admin User',
        email: 'admin@library.com',
        password: 'admin',
        role: 'ADMIN',
        status: 'ACTIVE',
        photoUrl: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
        aadhaar: null,
        referenceId: null,
        finesOwed: 0
    },
    {
        id: 'M001',
        name: 'Vimal Kumar',
        email: 'vimal@example.com',
        password: 'user123',
        role: 'MEMBER',
        status: 'ACTIVE',
        photoUrl: 'https://ui-avatars.com/api/?name=Vimal+Kumar&background=random',
        aadhaar: '123456789012',
        referenceId: 'U001',
        joinedDate: '2023-01-01',
        finesOwed: 0
    }
];

// Helper: date relative to today
const relativeDate = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
};

const SEED_BOOKS = [
    {
        id: 'B001',
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'Classic',
        isbn: '978-0743273565',
        status: 'AVAILABLE',
        location: { rack: 'R1', shelf: 'A', section: 'Fiction' },
        issuedTo: null,
        dueDate: null,
        waitlist: [],
        coverUrl: 'https://placehold.co/150x200?text=Gatsby'
    },
    {
        id: 'B002',
        title: 'Clean Code',
        author: 'Robert C. Martin',
        category: 'Technology',
        isbn: '978-0132350884',
        status: 'ISSUED',
        location: { rack: 'R3', shelf: 'D', section: 'CompSci' },
        issuedTo: 'M001',
        dueDate: relativeDate(7),   // Due 7 days from now — no fake fine
        waitlist: [],
        coverUrl: 'https://placehold.co/150x200?text=Clean+Code'
    },
    {
        id: 'B003',
        title: 'Data Structures using C',
        author: 'Reema Thareja',
        category: 'Technology',
        isbn: '978-0198099307',
        status: 'AVAILABLE',
        location: { rack: 'R3', shelf: 'E', section: 'CompSci' },
        issuedTo: null,
        dueDate: null,
        waitlist: [],
        coverUrl: 'https://placehold.co/150x200?text=DS+in+C'
    }
];

// ── Data Version: bump this whenever seed data structure changes ──────────────
const DATA_VERSION = 'v3';
const storedVersion = localStorage.getItem('lumina_version');

// If version mismatch → wipe stale/corrupted data and re-seed
if (storedVersion !== DATA_VERSION) {
    localStorage.removeItem('lumina_users');
    localStorage.removeItem('lumina_books');
    localStorage.removeItem('lumina_notifications');
    // Keep layout — user-created floor plan should survive resets
    localStorage.setItem('lumina_version', DATA_VERSION);
    console.log('[Lumina] Data version updated. Seed data reset.');
}

// Load from Storage or Initialize
const storedUsers = localStorage.getItem('lumina_users');
const storedBooks = localStorage.getItem('lumina_books');
const storedLayout = localStorage.getItem('lumina_layout');

let USERS, BOOKS, LAYOUT;

try {
    USERS = storedUsers ? JSON.parse(storedUsers) : SEED_USERS;
} catch (e) {
    console.error('Failed to parse users from localStorage', e);
    USERS = SEED_USERS;
}

try {
    BOOKS = storedBooks ? JSON.parse(storedBooks) : SEED_BOOKS;
} catch (e) {
    console.error('Failed to parse books from localStorage', e);
    BOOKS = SEED_BOOKS;
}

try {
    LAYOUT = storedLayout ? JSON.parse(storedLayout) : [];
} catch (e) {
    LAYOUT = [];
}

// Helper to save
function save() {
    try {
        localStorage.setItem('lumina_users', JSON.stringify(USERS));
        localStorage.setItem('lumina_books', JSON.stringify(BOOKS));
        localStorage.setItem('lumina_layout', JSON.stringify(LAYOUT));
        return true;
    } catch (e) {
        console.error('Storage Quota Exceeded or Error', e);
        alert('System Warning: Storage is full. Unable to save recent changes.');
        return false;
    }
}

// Initialize persistence immediately
if (!storedUsers) save();

export const db = {
    // Getters ensure we always return the live in-memory array,
    // not a stale snapshot from when the module first loaded.
    get users() { return USERS; },
    get books() { return BOOKS; },
    get layout() { return LAYOUT; },

    saveLayout: (newLayout) => {
        LAYOUT = newLayout;
        save();
        return { success: true };
    },

    // NOTIFICATIONS
    notifications: JSON.parse(localStorage.getItem('lumina_notifications') || '[]'),

    notify: (userId, message, type = 'INFO') => {
        const newNotif = {
            id: Date.now() + Math.random(),
            userId,
            message,
            type, // INFO, SUCCESS, WARNING, ALRET
            date: new Date().toISOString(),
            read: false
        };
        const currentNotifs = JSON.parse(localStorage.getItem('lumina_notifications') || '[]');
        currentNotifs.unshift(newNotif);
        localStorage.setItem('lumina_notifications', JSON.stringify(currentNotifs));
        return true;
    },

    getNotifications: (userId) => {
        const all = JSON.parse(localStorage.getItem('lumina_notifications') || '[]');
        return all.filter(n => n.userId === userId || (userId.startsWith('A') && n.userId === 'ADMIN'));
    },

    markRead: (notifId) => {
        const all = JSON.parse(localStorage.getItem('lumina_notifications') || '[]');
        const index = all.findIndex(n => n.id === notifId);
        if (index !== -1) {
            all[index].read = true;
            localStorage.setItem('lumina_notifications', JSON.stringify(all));
            return true;
        }
        return false;
    },

    // USER METHODS
    login: (email, password) => {
        // Reload from storage to get latest
        let currentUsers;
        try {
            currentUsers = JSON.parse(localStorage.getItem('lumina_users') || '[]');
        } catch (e) {
            currentUsers = [];
        }
        const user = currentUsers.find(u => u.email === email && u.password === password);

        if (!user) return { success: false, message: 'Invalid credentials' };
        if (user.status === 'PENDING') return { success: false, message: 'Account is pending approval' };
        if (user.status === 'REJECTED') return { success: false, message: 'Account was rejected' };
        return { success: true, user };
    },

    register: (data) => {
        if (USERS.find(u => u.email === data.email)) return { success: false, message: 'Email already exists' };
        if (USERS.find(u => u.aadhaar === data.aadhaar)) return { success: false, message: 'Aadhaar already registered' };

        const referrer = USERS.find(u => u.id === data.referenceId && u.status === 'ACTIVE');
        if (!referrer) return { success: false, message: 'Invalid Reference ID' };

        const newUser = {
            id: 'M' + String(Date.now()).slice(-3),
            ...data,
            role: 'MEMBER',
            status: 'PENDING',
            photoUrl: `https://ui-avatars.com/api/?name=${data.name}&background=random`,
            joinedDate: new Date().toISOString().split('T')[0]
        };
        USERS.push(newUser);
        if (!save()) return { success: false, message: 'Storage Error' };
        db.notify('ADMIN', `New Member Registered: ${newUser.name} (${newUser.id})`, 'INFO');
        return { success: true, user: newUser };
    },

    registerAdmin: (data) => {
        if (USERS.find(u => u.email === data.email)) return { success: false, message: 'Email already exists' };

        const newAdmin = {
            id: 'A' + String(Date.now()).slice(-3),
            ...data,
            role: 'ADMIN',
            status: 'ACTIVE',
            photoUrl: `https://ui-avatars.com/api/?name=${data.name}&background=0D8ABC&color=fff`,
            joinedDate: new Date().toISOString().split('T')[0]
        };
        USERS.push(newAdmin);
        if (!save()) return { success: false, message: 'Storage Error' };
        db.notify('ADMIN', `New Admin Added: ${newAdmin.name}`, 'WARNING');
        return { success: true, message: 'Admin Registration Successful' };
    },

    // ADMIN METHODS
    getPendingUsers: () => USERS.filter(u => u.status === 'PENDING'),

    approveUser: (userId) => {
        const user = USERS.find(u => u.id === userId);
        if (user) {
            user.status = 'ACTIVE';
            save(); // Persist
            return { success: true };
        }
        return { success: false };
    },

    // BOOK METHODS
    issueBook: (bookId, memberId) => {
        const book = BOOKS.find(b => b.id === bookId);
        const member = USERS.find(u => u.id === memberId);

        if (!book || !member) return { success: false, message: 'Invalid Book or Member' };

        // Allow issuing if AVAILABLE or if RESERVED by this member
        if (book.status !== 'AVAILABLE' && !(book.status === 'RESERVED' && book.issuedTo === memberId)) {
            return { success: false, message: 'Book is not available (Status: ' + book.status + ')' };
        }

        if (member.status !== 'ACTIVE') return { success: false, message: 'Member is not active' };

        // CONSTRAINT 1: Check Fines
        const currentFines = member.finesOwed || 0;
        if (currentFines > RULES.MAX_FINE_LIMIT) {
            return { success: false, message: `BLOCKED: Member has outstanding fines of ₹${currentFines}. Limit is ₹${RULES.MAX_FINE_LIMIT}.` };
        }

        // CONSTRAINT 2: Check Issue Limit
        const currentlyIssued = BOOKS.filter(b => b.issuedTo === memberId && (b.status === 'ISSUED' || b.status === 'RESERVED')).length;
        if (currentlyIssued >= RULES.MAX_BOOKS_PER_MEMBER) {
            return { success: false, message: `BLOCKED: Issue limit reached (${currentlyIssued}/${RULES.MAX_BOOKS_PER_MEMBER}). Return a book first.` };
        }

        book.status = 'ISSUED';
        book.issuedTo = memberId;

        // CONSTRAINT 3: Auto Due Date
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + RULES.ISSUE_DAYS);
        book.dueDate = dueDate.toISOString().split('T')[0];

        if (!save()) return { success: false, message: 'Storage Error' }; // Persist
        db.notify(memberId, `Book Issued: ${book.title}. Due: ${book.dueDate}`, 'SUCCESS');
        return { success: true, book };
    },

    renewBook: (bookId, memberId) => {
        const book = BOOKS.find(b => b.id === bookId);
        if (!book || book.issuedTo !== memberId || book.status !== 'ISSUED') {
            return { success: false, message: 'Invalid renewal request' };
        }

        // CONSTRAINT 4: No renewal if waitlisted
        if (book.waitlist && book.waitlist.length > 0) {
            return { success: false, message: 'Cannot renew: Book is reserved by other members.' };
        }

        // Extend due date
        const currentDue = new Date(book.dueDate);
        currentDue.setDate(currentDue.getDate() + RULES.ISSUE_DAYS);
        book.dueDate = currentDue.toISOString().split('T')[0];

        save();
        return { success: true, message: `Renewed! New Due Date: ${book.dueDate}` };
    },

    addBook: (book) => {
        BOOKS.push(book);
        if (!save()) return { success: false, message: 'Storage Error: Could not save book.' };
        return { success: true };
    },

    updateBook: (updatedBook) => {
        const index = BOOKS.findIndex(b => b.id === updatedBook.id);
        if (index !== -1) {
            BOOKS[index] = { ...BOOKS[index], ...updatedBook };
            if (!save()) return { success: false, message: 'Storage Error: Could not update book.' };
            return { success: true };
        }
        return { success: false, message: 'Book not found' };
    },

    deleteBook: (bookId) => {
        const index = BOOKS.findIndex(b => b.id === bookId);
        if (index === -1) return { success: false, message: 'Book not found' };
        const book = BOOKS[index];
        if (book.status === 'ISSUED') return { success: false, message: 'Cannot delete: Book is currently issued to a member.' };
        if (book.status === 'RESERVED') return { success: false, message: 'Cannot delete: Book is currently reserved.' };
        BOOKS.splice(index, 1);
        if (!save()) return { success: false, message: 'Storage Error' };
        return { success: true };
    },

    reserveBook: (bookId, memberId) => {
        const book = BOOKS.find(b => b.id === bookId);
        if (!book) return { success: false, message: 'Book not found' };

        // Case 1: Book is Available -> REMOTE BOOKING (Reserve for pickup)
        if (book.status === 'AVAILABLE') {
            book.status = 'RESERVED';
            book.issuedTo = memberId; // Holding it for this user (not yet issued, but reserved)
            book.dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Hold for 2 days
            save();
            return { success: true, message: 'Book Reserved! Pick up within 2 days.' };
        }

        // Case 2: Book is Issued/Reserved -> WAITLIST (Pre-book)

        // Check if already reserved/issued to this user
        if (book.issuedTo === memberId) return { success: false, message: 'You already have this book or have reserved it' };

        // Check if already in waitlist
        if (book.waitlist.includes(memberId)) return { success: false, message: 'You are already in the waitlist' };

        book.waitlist.push(memberId);
        if (!save()) return { success: false, message: 'Storage Error' };
        return { success: true, message: 'Added to Waitlist. You will be notified when available.' };
    },

    cancelReservation: (bookId, memberId) => {
        const book = BOOKS.find(b => b.id === bookId);
        if (!book) return { success: false, message: 'Book not found' };

        // Case 1: Active Reservation
        if (book.status === 'RESERVED' && book.issuedTo === memberId) {
            book.status = 'AVAILABLE';
            book.issuedTo = null;
            book.dueDate = null;

            // Check waitlist again immediately?  
            // If someone else is waiting, they should get it?
            if (book.waitlist.length > 0) {
                const nextUser = book.waitlist.shift();
                book.status = 'RESERVED';
                book.issuedTo = nextUser;
                const reserveDate = new Date();
                reserveDate.setDate(reserveDate.getDate() + 2);
                book.dueDate = reserveDate.toISOString().split('T')[0];
                db.notify(nextUser, `Good News! ${book.title} is now available for pickup.`, 'SUCCESS');
            }

            if (!save()) return { success: false, message: 'Storage Error' };
            return { success: true, message: 'Reservation Cancelled' };
        }

        // Case 2: Waitlist
        const waitlistIndex = book.waitlist.indexOf(memberId);
        if (waitlistIndex !== -1) {
            book.waitlist.splice(waitlistIndex, 1);
            if (!save()) return { success: false, message: 'Storage Error' };
            return { success: true, message: 'Removed from Waitlist' };
        }

        return { success: false, message: 'No active reservation found' };
    },

    returnBook: (bookId) => {
        const book = BOOKS.find(b => b.id === bookId);
        if (!book) return { success: false, message: 'Book not found' };

        if (book.status !== 'ISSUED') return { success: false, message: 'Book is not issued' };

        book.status = 'AVAILABLE';
        const wasIssuedTo = book.issuedTo;

        // CONSTRAINT 5: Calculate Fine
        let fineAmount = 0;
        if (book.dueDate) {
            const today = new Date();
            const due = new Date(book.dueDate);
            // Reset times to compare dates only
            today.setHours(0, 0, 0, 0);
            due.setHours(0, 0, 0, 0);

            if (today > due) {
                const diffTime = Math.abs(today - due);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                fineAmount = diffDays * RULES.FINE_PER_DAY;
            }
        }

        if (fineAmount > 0 && wasIssuedTo) {
            const user = USERS.find(u => u.id === wasIssuedTo);
            if (user) {
                user.finesOwed = (user.finesOwed || 0) + fineAmount;
            }
        }

        book.issuedTo = null; // Clear owner
        book.dueDate = null;

        // Smart Handler: If waitlist exists, automatically RESERVE for next person
        if (book.waitlist.length > 0) {
            const nextUser = book.waitlist.shift(); // Get first person
            book.status = 'RESERVED';
            book.issuedTo = nextUser;
            const reserveDate = new Date();
            reserveDate.setDate(reserveDate.getDate() + 2);
            book.dueDate = reserveDate.toISOString().split('T')[0]; // Hold for 2 days
            db.notify(nextUser, `Good News! ${book.title} is now available for pickup.`, 'SUCCESS');
        }

        save();
        if (wasIssuedTo) db.notify(wasIssuedTo, `Returned: ${book.title}`, 'INFO');
        return { success: true, fine: fineAmount };
    },

    clearFine: (userId) => {
        const user = USERS.find(u => u.id === userId);
        if (user) {
            user.finesOwed = 0;
            save();
            return { success: true };
        }
        return { success: false, message: 'User not found' };
    }
};
