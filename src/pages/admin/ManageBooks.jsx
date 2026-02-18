import { useState, useEffect } from 'react';
import { db } from '../../utils/mockData';
import { Search, Plus, X, Image as ImageIcon, Edit, Trash2 } from 'lucide-react';

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '', author: '', category: '', rack: '', shelf: '', section: '', coverUrl: ''
    });

    const loadBooks = () => {
        // Deduplicate by id — safety net against any stale data
        const seen = new Set();
        const fresh = db.books.filter(b => {
            if (seen.has(b.id)) return false;
            seen.add(b.id);
            return true;
        });
        setBooks([...fresh]);
    };

    useEffect(() => {
        loadBooks();
    }, []);

    const handleDelete = (book) => {
        if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
        const result = db.deleteBook(book.id);
        if (!result.success) {
            alert(result.message);
            return;
        }
        loadBooks(); // refresh list
    };

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        (b.category || '').toLowerCase().includes(search.toLowerCase()) ||
        (b.location?.rack || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenModal = (book = null) => {
        if (book) {
            setEditingBook(book);
            setFormData({
                title: book.title,
                author: book.author,
                category: book.category,
                rack: book.location.rack,
                shelf: book.location.shelf,
                section: book.location.section,
                coverUrl: book.coverUrl
            });
        } else {
            setEditingBook(null);
            setFormData({ title: '', author: '', category: '', rack: '', shelf: '', section: '', coverUrl: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, coverUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const bookData = {
            title: formData.title,
            author: formData.author,
            category: formData.category || 'General',
            coverUrl: formData.coverUrl,
            location: {
                rack: formData.rack,
                shelf: formData.shelf,
                section: formData.section
            }
        };

        if (editingBook) {
            db.updateBook({ id: editingBook.id, ...bookData });
        } else {
            db.addBook({
                id: 'B' + Date.now(),
                ...bookData,
                status: 'AVAILABLE',
                issuedTo: null,
                dueDate: null,
                waitlist: []
            });
        }
        setBooks([...db.books]); // Force refresh with live data
        handleCloseModal();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Books Inventory</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search books..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus size={18} /> Add New Book
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Book Details</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600">Location</th>
                            <th className="p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredBooks.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">No books found.</td>
                            </tr>
                        ) : (
                            filteredBooks.map(book => (
                                <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex gap-4 items-center">
                                            <img src={book.coverUrl || 'https://placehold.co/50x75?text=Cover'} alt="cover" className="w-10 h-14 object-cover rounded shadow-sm border border-gray-200" />
                                            <div>
                                                <div className="font-semibold text-gray-800">{book.title}</div>
                                                <div className="text-sm text-gray-500">{book.author}</div>
                                                <div className="text-xs text-gray-400 mt-1 font-mono">{book.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${book.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                            book.status === 'RESERVED' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {book.status}
                                        </span>
                                        {(book.status !== 'AVAILABLE' && book.issuedTo) && (
                                            <div className="text-xs text-gray-500 mt-2">
                                                {book.status === 'RESERVED' ? 'Reserved For:' : 'Issued To:'} <span className="font-medium text-gray-700">{book.issuedTo}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm font-medium text-gray-700">Rack {book.location.rack}</div>
                                        <div className="text-xs text-gray-500">Shelf {book.location.shelf} ({book.location.section})</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(book)}
                                                className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(book)}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Image Upload */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 transition relative group">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                {formData.coverUrl ? (
                                    <img src={formData.coverUrl} alt="Preview" className="h-32 mx-auto rounded shadow-sm object-contain" />
                                ) : (
                                    <div className="py-4">
                                        <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                                        <span className="text-sm text-gray-500">Click or Drag to upload cover</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input type="text" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                    <input type="text" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <input type="text" placeholder="Fiction, Sci-Fi..." className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rack</label>
                                    <input type="text" placeholder="R1" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.rack} onChange={e => setFormData({ ...formData, rack: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shelf</label>
                                    <input type="text" placeholder="A" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.shelf} onChange={e => setFormData({ ...formData, shelf: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                    <input type="text" placeholder="Fiction" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={handleCloseModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200">Save Book</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBooks;
