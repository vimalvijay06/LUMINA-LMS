import { useState, useEffect } from 'react';
import { Search, Plus, X, Image as ImageIcon, Edit, Trash2, MapPin, AlertCircle, Upload, Sparkles, Loader2 } from 'lucide-react';
import { secureFetch } from '../../utils/auth';

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [rackPhotos, setRackPhotos] = useState({});
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [inspectingBook, setInspectingBook] = useState(null);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '', author: '', category: '', rack: '', shelf: '', section: '', coverUrl: '', description: '',
        x: null, y: null
    });

    const loadData = async () => {
        try {
            const [booksRes, racksRes] = await Promise.all([
                secureFetch(`${import.meta.env.VITE_API_URL}/books`),
                secureFetch(`${import.meta.env.VITE_API_URL}/racks`)
            ]);
            setBooks(await booksRes.json());
            setRackPhotos(await racksRes.json());
        } catch (err) { console.error(err); }
    };

    useEffect(() => { loadData(); }, []);

    const handleDelete = async (book) => {
        if (!confirm(`Delete "${book.title}"?`)) return;
        try {
            await secureFetch(`${import.meta.env.VITE_API_URL}/books/${book.id}`, { method: 'DELETE' });
            loadData();
        } catch (err) { alert("Delete failed"); }
    };

    const handleOpenModal = (book = null) => {
        if (book) {
            setEditingBook(book);
            setFormData({
                title: book.title, author: book.author, category: book.category,
                rack: book.location.rack, shelf: book.location.shelf, section: book.location.section || '',
                coverUrl: book.coverUrl,
                description: book.description || '',
                x: book.location.position?.x || null,
                y: book.location.position?.y || null
            });
        } else {
            setEditingBook(null);
            setFormData({ title: '', author: '', category: '', rack: '', shelf: '', section: '', coverUrl: '', description: '', x: null, y: null });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, coverUrl: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleRackClick = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setFormData(prev => ({ ...prev, x: Math.round(x), y: Math.round(y) }));
    };

    const generateAiDescription = async () => {
        if (!formData.title || !formData.author) {
            alert("Please enter title and author first.");
            return;
        }
        setIsGeneratingAi(true);
        try {
            const res = await secureFetch(`${import.meta.env.VITE_API_URL}/ai/generate-description`, {
                method: 'POST',
                body: JSON.stringify({ title: formData.title, author: formData.author })
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, description: data.description }));
            }
        } catch (err) {
            alert("AI generation failed.");
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const bookData = {
            ...formData,
            location: { 
                rack: formData.rack, 
                shelf: formData.shelf, 
                section: formData.section,
                position: { x: formData.x, y: formData.y }
            }
        };
        const method = editingBook ? 'PATCH' : 'POST';
        const url = editingBook ? `${import.meta.env.VITE_API_URL}/books/${editingBook.id}` : `${import.meta.env.VITE_API_URL}/books`;
        
        try {
            const res = await secureFetch(url, {
                method,
                body: JSON.stringify(bookData)
            });
            const result = await res.json();
            if (result.success) {
                loadData();
                handleCloseModal();
            } else {
                alert("Error: " + result.message);
            }
        } catch (err) { alert("Server Error"); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Library Assets</h1>
                    <p className="text-gray-400 text-sm">Managing {books.length} real-time books in MongoDB.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                         <input className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none" placeholder="Quick search..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100">
                        <Plus size={18} /> Register Book
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.filter(b => (b.title || '').toLowerCase().includes(search.toLowerCase())).map(book => (
                    <div key={book.id} className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50">
                            <img src={book.coverUrl || 'https://placehold.co/300x400?text=No+Cover'} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                <button onClick={(e) => { e.stopPropagation(); setInspectingBook(book); }} className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-full text-blue-600 hover:bg-blue-600 hover:text-white transition-all" title="Inspect Book"><Search size={16} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleOpenModal(book); }} className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-full text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all" title="Edit Book"><Edit size={16} /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(book); }} className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all" title="Delete Book"><Trash2 size={16} /></button>
                            </div>
                            <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-white text-[10px] font-black uppercase tracking-widest leading-none">Rack {book.location.rack}</p>
                                    {(book.waitlist && book.waitlist.length > 0) && (
                                        <span className="bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                                            QUEUE: {book.waitlist.length}
                                        </span>
                                    )}
                                </div>
                                <p className="text-white/60 text-[8px] font-bold">Shelf {book.location.shelf} • {book.location.section || 'General'}</p>
                                {book.waitlist && book.waitlist.length > 0 && (
                                    <p className="text-white/40 text-[7px] mt-1 font-mono truncate">IDs: {book.waitlist.join(', ')}</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-4 px-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-800 line-clamp-1">{book.title}</h3>
                                    <p className="text-xs text-gray-400 font-medium">{book.author}</p>
                                </div>
                                <span className="bg-gray-100 text-gray-500 text-[9px] font-mono px-1.5 py-0.5 rounded border border-gray-200">
                                    {book.id}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-7xl shadow-2xl overflow-hidden my-auto flex flex-col lg:flex-row">
                        
                        {/* LEFT: Book Image & Description */}
                        <div className="lg:w-1/4 bg-gray-50 p-8 border-r flex flex-col">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Book Assets</h3>
                            
                            <div className="relative group w-full aspect-[3/4] bg-white rounded-3xl border-4 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-400 mb-6">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                {formData.coverUrl ? (
                                    <img src={formData.coverUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-6">
                                        <Upload className="mx-auto text-gray-300 mb-2" size={32} />
                                        <p className="text-[10px] font-bold text-gray-400">BOOK PHOTO</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Brief Description</label>
                                    <button 
                                        type="button"
                                        onClick={generateAiDescription}
                                        disabled={isGeneratingAi}
                                        className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors disabled:opacity-50"
                                    >
                                        {isGeneratingAi ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                        AI GEN
                                    </button>
                                </div>
                                <textarea 
                                    className="w-full h-32 p-4 bg-white border border-gray-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium text-gray-600"
                                    placeholder="Write a brief summary or use AI generate..."
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* MIDDLE: Precision Pinning (Visual Map) */}
                        <div className="lg:w-2/4 bg-gray-950 p-8 flex flex-col">
                            <div className="mb-6">
                                <h3 className="text-white text-lg font-black flex items-center gap-2 uppercase tracking-widest">
                                    <MapPin className="text-indigo-400" size={18} /> Physical Mapping
                                </h3>
                                <p className="text-gray-500 text-[10px] font-bold mt-1">SELECT RACK, THEN CLICK PHOTO TO PIN BOOK LOCATION</p>
                            </div>

                            <div className="flex-1 flex flex-col justify-center">
                                {rackPhotos[formData.rack] ? (
                                    <div className="relative rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-3xl bg-black transition-all">
                                        <img 
                                            src={rackPhotos[formData.rack].url} 
                                            className="w-full h-auto cursor-crosshair opacity-70" 
                                            onClick={handleRackClick}
                                        />
                                        
                                        {formData.x !== null && (
                                            <div 
                                                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
                                                style={{ left: `${formData.x}%`, top: `${formData.y}%` }}
                                            >
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
                                                    <div className="relative bg-white text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center shadow-2xl border-2 border-indigo-600">
                                                        <MapPin size={16} fill="currentColor" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {Object.entries(rackPhotos[formData.rack].pins || {}).map(([s, p]) => (
                                            <div key={s} className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-white/20 rounded-full flex items-center justify-center text-[8px] font-bold text-white/30" style={{ left: `${p.x}%`, top: `${p.y}%` }}>{s}</div>
                                        ))}
                                    </div>
                                ) : formData.rack && rackPhotos[formData.rack] ? (
                                    <div className="relative rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-3xl bg-black transition-all">
                                         <img 
                                            src={rackPhotos[formData.rack].url} 
                                            className="w-full h-auto cursor-crosshair opacity-70" 
                                            onClick={handleRackClick}
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-video border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-gray-600 p-8 text-center bg-white/5">
                                        <AlertCircle size={32} className="mb-4 opacity-10" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Enter Rack ID to view Map</p>
                                    </div>
                                ) }
                            </div>
                        </div>

                        {/* RIGHT: Data Form */}
                        <form onSubmit={handleSubmit} className="lg:w-1/4 p-8 space-y-6 bg-white flex flex-col justify-between border-l">
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">{editingBook ? 'Update Book' : 'New Registration'}</h2>
                                        {editingBook && <p className="text-[10px] font-mono text-gray-400">ID: {editingBook.id}</p>}
                                    </div>
                                    <button type="button" onClick={handleCloseModal} className="text-gray-300 hover:text-gray-900"><X size={24} /></button>
                                </div>

                                <div className="space-y-4">
                                    <input required className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none text-sm font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Book Title" />
                                    <input required className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none text-sm font-bold" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} placeholder="Author" />
                                    <input className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none text-sm font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Category" />
                                    
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <div className="bg-indigo-50 p-3 rounded-2xl">
                                            <label className="text-[8px] font-black text-indigo-400 uppercase text-center block mb-1">Rack ID</label>
                                            <input required className="w-full bg-transparent text-center font-black text-indigo-700 outline-none" value={formData.rack} onChange={e => setFormData({...formData, rack: e.target.value.toUpperCase()})} placeholder="R1" />
                                        </div>
                                        <div className="bg-indigo-50 p-3 rounded-2xl">
                                            <label className="text-[8px] font-black text-indigo-400 uppercase text-center block mb-1">Shelf</label>
                                            <input required className="w-full bg-transparent text-center font-black text-indigo-700 outline-none" value={formData.shelf} onChange={e => setFormData({...formData, shelf: e.target.value})} placeholder="A" />
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-3 rounded-2xl">
                                        <label className="text-[8px] font-black text-gray-400 uppercase text-center block mb-1">Detailed Section</label>
                                        <input required className="w-full bg-transparent text-center font-bold text-gray-700 outline-none" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} placeholder="e.g. Left Corner" />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                                {editingBook ? 'UPDATE RECODE' : 'SAVE TO ASSETS'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* ── Inspection Modal ────────────────────────────────── */}
            {inspectingBook && (
                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
                    <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col md:flex-row">
                            {/* Left: Visuals */}
                            <div className="md:w-1/3 bg-gray-50 p-8 border-r">
                                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl mb-6">
                                    <img src={inspectingBook.coverUrl || 'https://placehold.co/300x400?text=No+Cover'} className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${inspectingBook.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {inspectingBook.status}
                                        </span>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Physical Location</p>
                                        <p className="text-sm font-bold text-gray-800">Rack {inspectingBook.location.rack} • Shelf {inspectingBook.location.shelf}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{inspectingBook.location.section || 'General Section'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Details & Map */}
                            <div className="md:w-2/3 p-10 space-y-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-indigo-600 font-mono text-xs font-bold tracking-widest uppercase mb-1">Asset ID: {inspectingBook.id}</p>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{inspectingBook.title}</h2>
                                        <p className="text-lg text-gray-400 font-medium mt-2">by {inspectingBook.author}</p>
                                    </div>
                                    <button onClick={() => setInspectingBook(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={24} /></button>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</p>
                                        <p className="text-sm font-bold text-gray-800">{inspectingBook.category || 'Uncategorized'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ISBN Number</p>
                                        <p className="text-sm font-bold text-gray-800">{inspectingBook.isbn || 'N/A'}</p>
                                    </div>
                                </div>

                                {inspectingBook.waitlist && inspectingBook.waitlist.length > 0 && (
                                    <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Waitlist Queue ({inspectingBook.waitlist.length})</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {inspectingBook.waitlist.map((id, idx) => (
                                                <span key={id} className="bg-white border border-amber-200 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold text-amber-700 shadow-sm">
                                                    #{idx + 1}: {id}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Location Mapping</p>
                                    {rackPhotos[inspectingBook.location.rack] ? (
                                        <div className="relative rounded-3xl overflow-hidden border-2 border-gray-100 shadow-inner group">
                                            <img src={rackPhotos[inspectingBook.location.rack].url} className="w-full h-auto" />
                                            {/* Pin display logic */}
                                            {(inspectingBook.location?.position?.x !== null || (rackPhotos[inspectingBook.location.rack].pins && rackPhotos[inspectingBook.location.rack].pins[inspectingBook.location.shelf])) && (
                                                <div 
                                                    className="absolute -translate-x-1/2 -translate-y-1/2"
                                                    style={{ 
                                                        left: `${inspectingBook.location?.position?.x ?? rackPhotos[inspectingBook.location.rack].pins[inspectingBook.location.shelf].x}%`, 
                                                        top: `${inspectingBook.location?.position?.y ?? rackPhotos[inspectingBook.location.rack].pins[inspectingBook.location.shelf].y}%` 
                                                    }}
                                                >
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
                                                        <div className="relative bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-xl">
                                                            <MapPin size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                            Map unavailable for Rack {inspectingBook.location.rack}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBooks;
