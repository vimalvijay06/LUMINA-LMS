import { BookOpen } from 'lucide-react';

const BookCard = ({ book, onAction, actionLabel, actionColor = 'indigo' }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group flex flex-col h-full">
            <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = 'https://placehold.co/150x200?text=No+Cover' }}
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm text-gray-700">
                    {book.category}
                </div>
                <div className={`absolute bottom-0 left-0 right-0 p-1 text-white text-xs font-bold text-center uppercase tracking-wider ${book.status === 'AVAILABLE' ? 'bg-green-500/90' :
                        book.status === 'ISSUED' ? 'bg-red-500/90' : 'bg-amber-500/90'
                    }`}>
                    {book.status}
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                    <div>
                        <h3 className="font-bold text-gray-800 line-clamp-1 text-lg leading-tight" title={book.title}>{book.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{book.author}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
                        <span className="flex items-center gap-1"><BookOpen size={14} /> {book.location.section}</span>
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono text-xs">{book.location.rack}-{book.location.shelf}</span>
                    </div>
                </div>

                {onAction && (
                    <button
                        onClick={() => onAction(book)}
                        disabled={book.status !== 'AVAILABLE' && actionLabel === 'Issue'} // specific logic can be handled by parent, but basic check here
                        className={`w-full mt-4 py-2 rounded-lg text-sm font-semibold text-white transition-all shadow-sm active:scale-95
               ${actionColor === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : ''}
               ${actionColor === 'green' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : ''}
               ${actionColor === 'red' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : ''}
             `}
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
};

export default BookCard;
