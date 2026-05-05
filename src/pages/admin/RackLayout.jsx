import { useState, useEffect } from 'react';
import { secureFetch } from '../../utils/auth';
import { Save, Plus, Trash2, Camera, MapPin, Search, Edit3, X, AlertCircle, Upload, Loader2 } from 'lucide-react';

const RackLayout = () => {
    const [rackPhotos, setRackPhotos] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingRackId, setEditingRackId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [newRackData, setNewRackData] = useState({ id: '', url: '' });

    const fetchRacks = async () => {
        try {
            const res = await secureFetch(`${import.meta.env.VITE_API_URL}/racks`);
            const data = await res.json();
            setRackPhotos(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchRacks(); }, []);

    const handleSaveRack = async (id, url, pins) => {
        try {
            const res = await secureFetch(`${import.meta.env.VITE_API_URL}/racks`, {
                method: 'POST',
                body: JSON.stringify({ id, url, pins })
            });
            const result = await res.json();
            if (result.success) fetchRacks();
        } catch (err) { alert("Save failed."); }
    };

    const addOrUpdateRack = (e) => {
        e.preventDefault();
        if (!newRackData.url) { alert("Please upload or provide an image URL."); return; }
        handleSaveRack(newRackData.id, newRackData.url, rackPhotos[newRackData.id]?.pins || {});
        setIsAddModalOpen(false);
        setNewRackData({ id: '', url: '' });
    };

    const handleFileUpload = (file) => {
        if (!file) return;
        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewRackData(prev => ({ ...prev, url: reader.result }));
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const addPin = (e) => {
        if (!editingRackId) return;
        const rect = e.target.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const shelf = prompt("Enter Shelf Name (e.g., A, B, Top):");
        if (!shelf) return;

        const updatedPins = { ...rackPhotos[editingRackId].pins, [shelf]: { x: Math.round(x), y: Math.round(y) } };
        handleSaveRack(editingRackId, rackPhotos[editingRackId].url, updatedPins);
    };

    const removePin = (shelfId) => {
        const updatedPins = { ...rackPhotos[editingRackId].pins };
        delete updatedPins[shelfId];
        handleSaveRack(editingRackId, rackPhotos[editingRackId].url, updatedPins);
    };

    const filteredRacks = Object.keys(rackPhotos).filter(id => 
        id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Camera className="text-indigo-600" /> Rack Library Map
                    </h1>
                    <p className="text-gray-500 text-sm">Upload rack photos and pin shelf locations for member visual guidance.</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm">
                    <Plus size={18} /> Add New Rack Photo
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search Rack ID..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredRacks.map(id => (
                            <div key={id} onClick={() => setEditingRackId(id)} className={`bg-white rounded-2xl p-4 border-2 transition-all cursor-pointer ${editingRackId === id ? 'border-indigo-600 shadow-lg' : 'border-transparent hover:border-gray-200'}`}>
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border flex-shrink-0">
                                        <img src={rackPhotos[id].url} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800">Rack {id}</h3>
                                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-black">{Object.keys(rackPhotos[id].pins || {}).length} Pins</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:w-[450px]">
                    {editingRackId ? (
                        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden sticky top-6">
                            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                <h3 className="font-bold">Pins for Rack {editingRackId}</h3>
                                <button onClick={() => setEditingRackId(null)}><X size={20} /></button>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="relative rounded-xl overflow-hidden cursor-crosshair border">
                                    <img src={rackPhotos[editingRackId].url} className="w-full h-auto" onClick={addPin} />
                                    {Object.entries(rackPhotos[editingRackId].pins || {}).map(([shelf, pos]) => (
                                        <div key={shelf} className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[8px] font-black border-2 border-white shadow-lg" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
                                            {shelf}
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    {Object.entries(rackPhotos[editingRackId].pins || {}).map(([shelf, pos]) => (
                                        <div key={shelf} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-xs">
                                            <span>Shelf <b>{shelf}</b> ({pos.x}%, {pos.y}%)</span>
                                            <button onClick={() => removePin(shelf)} className="text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-gray-400">
                            <MapPin size={40} className="opacity-10 mb-2" />
                            <p className="text-sm">Select a rack to edit pins</p>
                        </div>
                    )}
                </div>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <form onSubmit={addOrUpdateRack} className="bg-white rounded-3xl w-full max-w-md p-8 space-y-4">
                        <h3 className="text-xl font-bold">New Rack Photo</h3>
                        
                        <div 
                            className="relative group w-full aspect-video bg-gray-50 rounded-2xl border-4 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-400"
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-500'); }}
                            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-indigo-500'); }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-indigo-500');
                                handleFileUpload(e.dataTransfer.files[0]);
                            }}
                        >
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            {newRackData.url ? (
                                <img src={newRackData.url} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-6">
                                    {isUploading ? <Loader2 className="mx-auto text-indigo-500 animate-spin" /> : <Upload className="mx-auto text-gray-300 mb-2" size={32} />}
                                    <p className="text-[10px] font-bold text-gray-400">DRAG & DROP RACK PHOTO</p>
                                </div>
                            )}
                        </div>

                        <input required className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={newRackData.id} onChange={e => setNewRackData({...newRackData, id: e.target.value.toUpperCase()})} placeholder="Rack ID (e.g. R1)" />
                        
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                            <div className="relative text-[8px] text-gray-400 font-bold bg-white px-2 inline-block uppercase tracking-widest">OR MANUAL URL</div>
                        </div>

                        <input className="w-full p-4 bg-gray-50 border rounded-2xl outline-none text-xs" value={newRackData.url} onChange={e => setNewRackData({...newRackData, url: e.target.value})} placeholder="Direct Image URL" />
                        
                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 text-gray-500 font-bold">Cancel</button>
                            <button type="submit" disabled={isUploading || !newRackData.url} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50">
                                Save Rack
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default RackLayout;
