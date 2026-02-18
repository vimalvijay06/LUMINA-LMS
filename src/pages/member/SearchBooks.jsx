import { useState, useEffect } from 'react';
import { db } from '../../utils/mockData';
import { getCurrentUser } from '../../utils/auth';
import { Search, MapPin, Map, BookOpen, Clock, AlertCircle, Filter, ArrowUpDown, X } from 'lucide-react';

const SearchBooks = () => {
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchField, setSearchField] = useState('TITLE');
    const [sortBy, setSortBy] = useState('RECENT');
    const [refreshTick, setRefreshTick] = useState(0); // increment to force re-fetch

    const [books, setBooks] = useState([]);
    const [user] = useState(getCurrentUser());
    const [selectedBookForMap, setSelectedBookForMap] = useState(null);

    // Refresh Data
    useEffect(() => {
        // Always read fresh from db.books (getter returns live array)
        // Deduplicate by id as a safety net
        const seen = new Set();
        const allBooks = db.books.filter(b => {
            if (seen.has(b.id)) return false;
            seen.add(b.id);
            return true;
        });

        let result = [...allBooks];

        // 1. Search Filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(b => {
                const val = (b[searchField.toLowerCase()] || '').toLowerCase();
                return val.includes(term);
            });
        }

        // 2. Status Filter
        if (filterStatus !== 'ALL') {
            if (filterStatus === 'AVAILABLE') {
                result = result.filter(b => b.status === 'AVAILABLE');
            } else if (filterStatus === 'ISSUED') {
                result = result.filter(b => b.status === 'ISSUED');
            } else if (filterStatus === 'WAITLIST') {
                result = result.filter(b => b.waitlist.includes(user.id));
            }
        }

        // 3. Sorting
        result.sort((a, b) => {
            if (sortBy === 'AZ') return a.title.localeCompare(b.title);
            if (sortBy === 'RECENT') return b.id > a.id ? 1 : -1;
            if (sortBy === 'POPULAR') return b.waitlist.length - a.waitlist.length;
            return 0;
        });

        setBooks(result);
    }, [searchTerm, filterStatus, searchField, sortBy, user.id, refreshTick]);

    const handleAction = (type, bookId) => {
        if (type === 'reserve') {
            const res = db.reserveBook(bookId, user.id);
            if (res.message) alert(res.message);
        }
        // Increment tick → triggers useEffect to re-read db.books (no page reload)
        setRefreshTick(t => t + 1);
    };

    return (
        <div className="space-y-6 relative min-h-screen">
            {/* Header & Controls */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Explore Library</h1>
                        <p className="text-gray-500">Search for books, check availability, and reserve.</p>
                    </div>
                    <div className="text-sm text-gray-400">
                        {books.length} results found
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input Group */}
                    <div className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder={`Search by ${searchField.toLowerCase()}...`}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <select
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchField}
                            onChange={(e) => setSearchField(e.target.value)}
                        >
                            <option value="TITLE">Title</option>
                            <option value="AUTHOR">Author</option>
                            <option value="CATEGORY">Category</option>
                            <option value="ISBN">ISBN</option>
                        </select>
                    </div>

                    {/* Filter & Sort Group */}
                    <div className="flex gap-2">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                className="pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-medium focus:outline-none hover:bg-gray-50 appearance-none cursor-pointer"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="ALL">All Status</option>
                                <option value="AVAILABLE">Available Only</option>
                                <option value="ISSUED">Issued Only</option>
                                <option value="WAITLIST">My Waitlists</option>
                            </select>
                        </div>

                        <div className="relative">
                            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                className="pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-medium focus:outline-none hover:bg-gray-50 appearance-none cursor-pointer"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="RECENT">Recently Added</option>
                                <option value="AZ">A - Z</option>
                                <option value="POPULAR">Most Popular</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Book Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {books.map(book => {
                    const isWaitlisted = book.waitlist.includes(user.id);
                    const isReservedByMe = book.status === 'RESERVED' && book.issuedTo === user.id;
                    const isIssuedToMe = book.status === 'ISSUED' && book.issuedTo === user.id;

                    return (
                        <div key={book.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex sm:flex-row flex-col gap-4">
                            <div className="relative group sm:w-28 sm:h-40 w-full h-48 flex-shrink-0">
                                <img src={book.coverUrl} className="w-full h-full object-cover rounded-lg shadow-sm bg-gray-200" />
                                <button
                                    onClick={() => setSelectedBookForMap(book)}
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-lg"
                                >
                                    <MapPin size={24} className="mb-1" />
                                    <span className="text-xs font-bold">Locate</span>
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{book.title}</h3>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${book.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            isReservedByMe ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                isIssuedToMe ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                    'bg-red-50 text-red-600 border border-red-100'
                                            }`}>
                                            {isReservedByMe ? 'Ready for Pickup' : isIssuedToMe ? 'Borrowed' : book.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">{book.author}</p>
                                    <p className="text-gray-400 text-xs mt-1 bg-gray-50 inline-block px-2 py-1 rounded">{book.category}</p>
                                    <p className="text-gray-300 text-[10px] mt-1 font-mono">ISBN: {book.isbn || 'N/A'}</p>
                                </div>

                                <div className="flex gap-3 mt-4">
                                    {book.status === 'AVAILABLE' ? (
                                        <button onClick={() => handleAction('reserve', book.id)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium shadow-sm flex items-center justify-center gap-2 transition-colors">
                                            <BookOpen size={16} /> Reserve Now
                                        </button>
                                    ) : isReservedByMe ? (
                                        <div className="flex-1 bg-amber-50 border border-amber-200 text-amber-700 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                                            <Clock size={16} /> Pick up by {book.dueDate}
                                        </div>
                                    ) : isIssuedToMe ? (
                                        <div className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                                            <BookOpen size={16} /> Enjoy Reading!
                                        </div>
                                    ) : isWaitlisted ? (
                                        <div className="flex-1 bg-gray-50 border border-gray-200 text-gray-500 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                                            <span>In Waitlist</span>
                                            <span className="bg-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded-full font-bold">#{book.waitlist.indexOf(user.id) + 1}</span>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleAction('reserve', book.id)} className="flex-1 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                            <Clock size={16} /> Join Waitlist ({book.waitlist.length})
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {books.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No books found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters.</p>
                </div>
            )}

            {/* Map Modal */}
            {selectedBookForMap && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-4xl h-[600px] flex flex-col shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50 z-10">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Map className="text-indigo-600" />
                                    Locate "{selectedBookForMap.title}"
                                </h2>
                                <p className="text-sm text-gray-500 ml-8">
                                    Rack: <span className="font-bold text-gray-800">{selectedBookForMap.location.rack}</span> •
                                    Shelf: {selectedBookForMap.location.shelf} •
                                    Section: {selectedBookForMap.location.section}
                                </p>
                            </div>
                            <button onClick={() => setSelectedBookForMap(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X /></button>
                        </div>

                        {/* Map Canvas - Read Only Mode */}
                        <div className="flex-1 relative bg-gray-100 overflow-auto cursor-grab active:cursor-grabbing">
                            <div className="absolute top-0 left-0 w-[3000px] h-[3000px] origin-top-left"
                                style={{
                                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}>
                                {db.layout.map(item => {
                                    const isTarget = item.label === selectedBookForMap.location.rack && item.type === 'rack';

                                    return (
                                        <div
                                            key={item.id}
                                            style={{
                                                position: 'absolute',
                                                left: item.x, top: item.y,
                                                width: item.width, height: item.height,
                                                transform: `rotate(${item.rotation}deg)`,
                                                zIndex: isTarget ? 50 : 1
                                            }}
                                            className={`
                                                flex items-center justify-center font-bold text-xs select-none transition-all duration-500 border
                                                ${item.type === 'rack' ? 'bg-white shadow-sm' : ''}
                                                ${item.type === 'wall' ? 'bg-gray-700 border-gray-700' : ''}
                                                ${item.type === 'entrance' ? 'bg-red-50 border-dashed border-red-300' : ''}
                                                ${item.type === 'desk' ? 'bg-emerald-500 opacity-50 border-emerald-600' : ''}
                                                ${isTarget ? 'ring-4 ring-indigo-500 shadow-2xl scale-110 !bg-indigo-50 !text-indigo-700 !border-indigo-200 z-50' : 'text-gray-400 border-gray-300'}
                                            `}
                                        >
                                            {item.type !== 'wall' && item.label}
                                            {isTarget && (
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full whitespace-nowrap text-sm shadow-lg animate-bounce">
                                                    You are here
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t text-center text-sm text-gray-500">
                            Scroll to Zoom • Drag to Move
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBooks;
