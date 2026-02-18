import { useState, useRef, useEffect } from 'react';
import { db } from '../../utils/mockData';
import { Save, Plus, Trash2, Copy, Move, RotateCw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const GRID_SIZE = 20;

const RackLayout = () => {
    const [items, setItems] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [zoom, setZoom] = useState(1);

    // Interaction State
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const canvasRef = useRef(null);

    useEffect(() => {
        // Load initial layout
        const savedLayout = db.layout || [];
        setItems(savedLayout.map(i => ({
            ...i,
            x: i.x || 100, y: i.y || 100,
            width: i.width || 100, height: i.height || 100,
            rotation: i.rotation || 0
        })));
    }, []);

    const handleAddItem = (type) => {
        const id = 'el-' + Date.now();
        let newItem = { id, type, x: 200, y: 200, width: 100, height: 100, rotation: 0, label: '' };

        if (type === 'rack') { newItem.width = 60; newItem.height = 140; newItem.label = `R${items.filter(i => i.type === 'rack').length + 1}`; }
        else if (type === 'desk') { newItem.width = 140; newItem.height = 80; newItem.label = 'Admin Desk'; }
        else if (type === 'wall') { newItem.width = 300; newItem.height = 20; }
        else if (type === 'entrance') { newItem.width = 120; newItem.height = 40; newItem.label = 'ENTRY'; }
        else if (type === 'pillar') { newItem.width = 40; newItem.height = 40; }

        setItems([...items, newItem]);
        setSelectedId(id);
    };

    const updateItem = (id, changes) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...changes } : item));
    };

    const saveLayout = () => {
        db.saveLayout(items);
        alert('Layout Saved Successfully!');
    };

    // --- Drag Logic ---
    const handleMouseDown = (e, id) => {
        e.stopPropagation();
        setSelectedId(id);
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleCanvasMouseMove = (e) => {
        if (!isDragging || !selectedId) return;

        const dx = (e.clientX - dragStart.x) / zoom; // Adjust for zoom
        const dy = (e.clientY - dragStart.y) / zoom;

        setDragStart({ x: e.clientX, y: e.clientY });

        setItems(prev => prev.map(item => {
            if (item.id !== selectedId) return item;

            let newX = item.x + dx;
            let newY = item.y + dy;

            // Snap to grid
            newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
            newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;

            return { ...item, x: newX, y: newY };
        }));
    };

    const handleCanvasMouseUp = () => {
        setIsDragging(false);
    };

    const selectedItem = items.find(i => i.id === selectedId);

    // Render Helpers
    const renderItem = (item) => {
        const isSelected = selectedId === item.id;

        const style = {
            left: item.x, top: item.y,
            width: item.width, height: item.height,
            transform: `rotate(${item.rotation}deg)`,
            zIndex: isSelected ? 10 : 1,
            position: 'absolute',
            cursor: isDragging && isSelected ? 'grabbing' : 'grab',
        };

        if (item.type === 'rack') {
            return (
                <div key={item.id} style={style} onMouseDown={(e) => handleMouseDown(e, item.id)}
                    className={`bg-white border text-gray-700 flex items-center justify-center font-bold font-mono text-sm shadow-sm select-none
                    ${isSelected ? 'border-primary-500 ring-2 ring-primary-500/50' : 'border-gray-400'}`}
                >
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, #000 19px, #000 20px)' }} />
                    {item.label}
                </div>
            );
        }
        if (item.type === 'desk') {
            return (
                <div key={item.id} style={style} onMouseDown={(e) => handleMouseDown(e, item.id)}
                    className={`bg-emerald-500 border-2 border-emerald-600 text-white flex items-center justify-center font-bold text-xs rounded-lg shadow-md select-none
                    ${isSelected ? 'ring-2 ring-emerald-300' : ''}`}
                >
                    {item.label || 'Desk'}
                </div>
            );
        }
        if (item.type === 'wall') {
            return (
                <div key={item.id} style={style} onMouseDown={(e) => handleMouseDown(e, item.id)}
                    className={`bg-gray-700 border border-gray-800 shadow-sm ${isSelected ? 'ring-2 ring-gray-400' : ''}`}
                />
            );
        }
        if (item.type === 'entrance') {
            return (
                <div key={item.id} style={style} onMouseDown={(e) => handleMouseDown(e, item.id)}
                    className={`bg-red-50 border-2 border-dashed border-red-500 text-red-500 flex items-center justify-center font-bold tracking-widest text-xs select-none
                    ${isSelected ? 'bg-red-100' : ''}`}
                >
                    {item.label || 'EXIT'}
                </div>
            );
        }
        return (
            <div key={item.id} style={style} onMouseDown={(e) => handleMouseDown(e, item.id)}
                className={`bg-gray-400 rounded-full border-2 border-gray-500 ${isSelected ? 'ring-2 ring-gray-300' : ''}`}
            />
        );
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-100 -m-8 rounded-none">
            {/* Sidebar Tools */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-10 shadow-lg">
                <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-700 flex justify-between items-center">
                    <span>Studio Tools</span>
                    <button onClick={saveLayout} className="text-primary-600 hover:text-primary-700" title="Save">
                        <Save size={18} />
                    </button>
                </div>

                <div className="p-4 space-y-6 overflow-y-auto flex-1">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Structure</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleAddItem('wall')} className="p-3 border rounded hover:bg-gray-50 flex flex-col items-center gap-1 text-xs text-gray-600">
                                <div className="w-8 h-1 bg-gray-600 mb-1"></div> Wall
                            </button>
                            <button onClick={() => handleAddItem('entrance')} className="p-3 border rounded hover:bg-gray-50 flex flex-col items-center gap-1 text-xs text-gray-600">
                                <div className="w-6 h-4 border border-dashed border-red-500 mb-1"></div> Door
                            </button>
                            <button onClick={() => handleAddItem('pillar')} className="p-3 border rounded hover:bg-gray-50 flex flex-col items-center gap-1 text-xs text-gray-600">
                                <div className="w-4 h-4 rounded-full bg-gray-400 mb-1"></div> Pillar
                            </button>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Furniture</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleAddItem('rack')} className="p-3 border rounded hover:bg-gray-50 flex flex-col items-center gap-1 text-xs text-gray-600">
                                <div className="w-4 h-6 border border-gray-400 bg-white mb-1"></div> Rack
                            </button>
                            <button onClick={() => handleAddItem('desk')} className="p-3 border rounded hover:bg-gray-50 flex flex-col items-center gap-1 text-xs text-gray-600">
                                <div className="w-6 h-4 bg-emerald-500 rounded mb-1"></div> Admin Desk
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <button onClick={saveLayout} className="w-full bg-indigo-600 text-white py-2 rounded shadow hover:bg-indigo-700 flex items-center justify-center gap-2 font-medium">
                        <Save size={16} /> Save Layout
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative bg-gray-200 overflow-hidden cursor-move"
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseDown={() => setSelectedId(null)} // Deselect on click bg
            >
                {/* Canvas Transform Container */}
                <div
                    ref={canvasRef}
                    className="absolute bg-white shadow-2xl origin-top-left"
                    style={{
                        width: '3000px',
                        height: '3000px',
                        transform: `scale(${zoom})`,
                        backgroundSize: '20px 20px',
                        backgroundImage: 'linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px)'
                    }}
                >
                    {items.map(renderItem)}
                </div>

                {/* Floating Controls */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur border border-gray-200 px-4 py-2 rounded-full shadow-lg flex items-center gap-4 text-gray-600 z-50">
                    <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="hover:text-indigo-600"><ZoomOut size={18} /></button>
                    <span className="text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="hover:text-indigo-600"><ZoomIn size={18} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-2"></div>
                    <button onClick={() => setZoom(1)} className="hover:text-indigo-600" title="Reset"><Maximize size={18} /></button>
                </div>
            </div>

            {/* Properties Panel */}
            <div className="w-72 bg-white border-l border-gray-200 p-6 flex flex-col z-10 shadow-lg">
                <h3 className="font-bold text-gray-800 mb-6 border-b pb-2">Properties</h3>

                {selectedItem ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Label</label>
                            <input
                                type="text"
                                value={selectedItem.label || ''}
                                onChange={(e) => updateItem(selectedId, { label: e.target.value })}
                                className="w-full mt-1 p-2 border rounded"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Width</label>
                                <input
                                    type="number"
                                    value={selectedItem.width}
                                    onChange={(e) => updateItem(selectedId, { width: parseInt(e.target.value) })}
                                    className="w-full mt-1 p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Height</label>
                                <input
                                    type="number"
                                    value={selectedItem.height}
                                    onChange={(e) => updateItem(selectedId, { height: parseInt(e.target.value) })}
                                    className="w-full mt-1 p-2 border rounded"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Rotation</label>
                            <div className="flex gap-2">
                                <input
                                    type="range" min="0" max="360" step="15"
                                    value={selectedItem.rotation || 0}
                                    onChange={(e) => updateItem(selectedId, { rotation: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                                <span className="text-xs w-8 text-right font-mono">{selectedItem.rotation}°</span>
                            </div>
                            <button onClick={() => updateItem(selectedId, { rotation: ((selectedItem.rotation || 0) + 45) % 360 })} className="mt-2 text-xs flex items-center gap-1 text-indigo-600">
                                <RotateCw size={12} /> Rotate +45°
                            </button>
                        </div>

                        <div className="pt-6 border-t mt-auto space-y-2">
                            <button onClick={() => {
                                const newItem = { ...selectedItem, id: 'el-' + Date.now(), x: selectedItem.x + 20, y: selectedItem.y + 20 };
                                setItems([...items, newItem]);
                                setSelectedId(newItem.id);
                            }} className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded text-gray-700 hover:bg-gray-50">
                                <Copy size={16} /> Duplicate
                            </button>
                            <button onClick={() => {
                                if (confirm('Delete item?')) {
                                    setItems(items.filter(i => i.id !== selectedId));
                                    setSelectedId(null);
                                }
                            }} className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-600 py-2 rounded hover:bg-red-100">
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-400 mt-20">
                        <Move size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Select an item to edit properties</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RackLayout;
