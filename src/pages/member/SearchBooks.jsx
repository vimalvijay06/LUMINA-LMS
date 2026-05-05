import { useState, useEffect } from 'react';
import { getCurrentUser, secureFetch } from '../../utils/auth';
import { Search, MapPin, Map, BookOpen, Clock, AlertCircle, Filter, ArrowUpDown, X } from 'lucide-react';

const SearchBooks = () => {
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchField, setSearchField] = useState('TITLE');
    const [sortBy, setSortBy] = useState('RECENT');
    const [refreshTick, setRefreshTick] = useState(0); 

    const [books, setBooks] = useState([]);
    const [allBooksFromAPI, setAllBooksFromAPI] = useState([]); 
    const [user] = useState(getCurrentUser() || { id: '' });
    const [selectedBookForMap, setSelectedBookForMap] = useState(null);
    const [rackPhotos, setRackPhotos] = useState({});

    // Fetch from API
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await secureFetch(`${import.meta.env.VITE_API_URL}/books`);
                const data = await res.json();
                setAllBooksFromAPI(data);
            } catch (err) {
                console.error("Fetch Error:", err);
            }
        };
        const fetchRackPhotos = async () => {
            try {
                const res = await secureFetch(`${import.meta.env.VITE_API_URL}/racks`);
                const data = await res.json();
                setRackPhotos(data);
            } catch (err) { console.error(err); }
        };
        fetchBooks();
        fetchRackPhotos();
    }, [refreshTick]);

    // Filter & Sort Logic
    useEffect(() => {
        let result = [...allBooksFromAPI];

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
    }, [searchTerm, filterStatus, searchField, sortBy, user.id, allBooksFromAPI]);

    const handleAction = async (type, bookId) => {
        if (type === 'reserve') {
            try {
                const res = await secureFetch(`${import.meta.env.VITE_API_URL}/books/${bookId}/reserve`, {
                    method: 'POST',
                    body: JSON.stringify({ userId: user.id })
                });
                const result = await res.json();
                
                if (result.success) {
                    alert(result.message);
                    setRefreshTick(prev => prev + 1); // Trigger fetchBooks re-run
                } else {
                    alert(result.message);
                }
            } catch (err) {
                alert("Server Error: Action failed.");
            }
        }
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
            {/* Rack Location Modal */}
            {selectedBookForMap && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Rack Location Guide</h2>
                                    <p className="text-sm text-gray-500">
                                        Find <span className="text-gray-900 font-bold">{selectedBookForMap.title}</span> at Rack <span className="text-indigo-600 font-extrabold">{selectedBookForMap.location.rack}</span>
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedBookForMap(null)} 
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Rack Image Component with Shelf Pin */}
                        <div className="relative aspect-video bg-gray-50 p-8">
                            {rackPhotos[selectedBookForMap.location.rack] ? (
                                <div className="h-full w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white relative group">
                                    <img 
                                        src={rackPhotos[selectedBookForMap.location.rack].url} 
                                        className="w-full h-full object-cover"
                                        alt={`Rack ${selectedBookForMap.location.rack}`}
                                    />
                                    
                                    {/* PRIORITIZE BOOK-SPECIFIC PIN */}
                                    {(selectedBookForMap.location?.position?.x !== null || 
                                      (rackPhotos[selectedBookForMap.location.rack].pins && 
                                       rackPhotos[selectedBookForMap.location.rack].pins[selectedBookForMap.location.shelf])) && (
                                        <div 
                                            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                                            style={{ 
                                                left: `${selectedBookForMap.location?.position?.x ?? rackPhotos[selectedBookForMap.location.rack].pins[selectedBookForMap.location.shelf].x}%`, 
                                                top: `${selectedBookForMap.location?.position?.y ?? rackPhotos[selectedBookForMap.location.rack].pins[selectedBookForMap.location.shelf].y}%` 
                                            }}
                                        >
                                            <div className="relative">
                                                {/* Pulsing Aura */}
                                                <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
                                                {/* Main Pin */}
                                                <div className="relative bg-indigo-600 text-white w-12 h-12 rounded-full flex flex-col items-center justify-center border-4 border-white shadow-[0_0_30px_rgba(79,70,229,0.5)] transform scale-110">
                                                    <span className="text-xs font-black leading-none">{selectedBookForMap.location.shelf}</span>
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-1"></div>
                                                </div>
                                                {/* Tooltip */}
                                                <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-2xl">
                                                    {selectedBookForMap.location?.position?.x ? 'EXACT LOCATION' : 'SHELF AREA'}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="absolute top-8 left-8">
                                        <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-lg font-black border border-white/20">
                                            Rack {selectedBookForMap.location.rack}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full w-full rounded-2xl border-4 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-4">
                                    <Camera size={48} className="opacity-20" />
                                    <p className="text-sm font-medium italic">No photo added for this rack yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Details Footer */}
                        <div className="p-8 bg-gray-50 flex flex-col gap-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <AlertCircle size={16} /> Look for this physical rack in the library.
                                </span>
                                <span className="font-bold text-gray-800">Shelf {selectedBookForMap.location.shelf} • {selectedBookForMap.location.section}</span>
                            </div>
                            <button 
                                onClick={() => setSelectedBookForMap(null)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBooks;
