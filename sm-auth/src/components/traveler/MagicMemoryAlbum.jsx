import {
  Camera, ArrowLeft, Share2, Heart, MapPin, Calendar,
  X, ChevronLeft, ChevronRight, Grid, Sparkles, Image, RefreshCw,
  AlertCircle, Lock, Upload, Plus, Trash2, Edit3, Check, Loader
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api';

function authHeaders() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

// ─── Destination fallback images ───────────────────────────────────────────────
const DEST_IMG_MAP = {
  "cox's bazar": ['https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?w=800','https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
  sylhet:        ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800','https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'],
  dhaka:         ['https://images.unsplash.com/photo-1513563326940-e76e4641069e?w=800','https://images.unsplash.com/photo-1523928208303-e88e7ff2c801?w=800'],
  sundarbans:    ['https://images.unsplash.com/photo-1708943081020-2082b47e21ba?w=800'],
  chittagong:    ['https://images.unsplash.com/photo-1594736797933-d1dec6b7262f?w=800'],
  bandarban:     ['https://images.unsplash.com/photo-1578592391689-0e3d1a1b52b9?w=800'],
  rangamati:     ['https://images.unsplash.com/photo-1664834681908-7ee473dfdec4?w=800'],
};
const DEFAULT_IMGS = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
];

function destImages(dest = '') {
  const key = dest.toLowerCase();
  for (const [k, imgs] of Object.entries(DEST_IMG_MAP)) {
    if (key.includes(k)) return imgs;
  }
  return DEFAULT_IMGS;
}

function fmtMonth(d) {
  if (!d) return '';
  const dt = new Date(d);
  return isNaN(dt) ? '' : dt.toLocaleString('default', { month: 'short', year: 'numeric' });
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ─── Build albums from trips + uploaded photos ─────────────────────────────────
function buildAlbums(trips, uploadedPhotos) {
  const tripGroups  = {};
  const photoGroups = {};

  trips.forEach(t => {
    const dest = t.destination || t.location || 'Unknown';
    (tripGroups[dest] = tripGroups[dest] || []).push(t);
  });
  uploadedPhotos.forEach(p => {
    (photoGroups[p.destination] = photoGroups[p.destination] || []).push(p);
  });

  const allDests = new Set([...Object.keys(tripGroups), ...Object.keys(photoGroups)]);

  return [...allDests].map((dest, idx) => {
    const groupTrips  = tripGroups[dest]  || [];
    const groupPhotos = photoGroups[dest] || [];
    const fallbacks   = destImages(dest);

    // Synthetic cover photos from trip data
    const seen = new Set();
    const coverPhotos = [];
    groupTrips.forEach((t, ti) => {
      const imgs = t.image ? [t.image, ...fallbacks] : fallbacks;
      imgs.slice(0, Math.min(3, imgs.length)).forEach((url, pi) => {
        if (seen.has(url)) return;
        seen.add(url);
        coverPhotos.push({
          id: `trip-${t._id}-${pi}`,
          url,
          caption: pi === 0 ? `${dest} – journey` : t.hostInfo ? `Stayed with ${t.hostInfo.name}` : `Exploring ${dest}`,
          date: fmtMonth(t.date || t.startDate),
          source: 'trip',
        });
      });
    });

    // Real uploaded photos (shown first)
    const realPhotos = groupPhotos.map(p => ({
      id: p._id,
      url: p.imageData,
      caption: p.caption || dest,
      date: fmtMonth(p.takenAt || p.createdAt),
      source: 'upload',
      liked: p.liked,
      dbId: p._id,
    }));

    const photos = [...realPhotos, ...coverPhotos];
    const firstDate = groupTrips[0]?.date || groupTrips[0]?.startDate || groupPhotos[0]?.takenAt;
    const cover = realPhotos[0]?.url || groupTrips[0]?.image || fallbacks[0];

    return {
      id: idx + 1,
      title: dest,
      location: dest,
      date: fmtMonth(firstDate),
      cover,
      photos,
      uploadedCount: realPhotos.length,
      tripCount: groupTrips.length,
      rawTrips: groupTrips,
    };
  }).filter(a => a.photos.length > 0);
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <div className="relative w-14 h-14">
      <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
    </div>
    <p className="text-sm text-purple-400">Loading your memories…</p>
  </div>
);

const ErrBox = ({ msg, onRetry }) => (
  <div className="flex flex-col items-center py-16 gap-4 text-center">
    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
      <AlertCircle className="w-7 h-7 text-red-400" />
    </div>
    <div>
      <p className="font-medium text-gray-700">Something went wrong</p>
      <p className="text-sm text-gray-400 mt-1">{msg}</p>
    </div>
    <button onClick={onRetry} className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white rounded-xl text-sm hover:bg-purple-600 transition-all">
      <RefreshCw className="w-4 h-4" /> Retry
    </button>
  </div>
);

// ─── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ trips, onClose, onUploaded }) {
  const fileRef  = useRef();
  const [files,      setFiles]      = useState([]);
  const [dest,       setDest]       = useState('');
  const [customDest, setCustomDest] = useState('');
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [err,        setErr]        = useState('');

  const tripDests = [...new Set(trips.map(t => t.destination || t.location).filter(Boolean))];
  const finalDest = dest === '__custom__' ? customDest.trim() : dest;

  const addFiles = async raw => {
    const picked = [...raw].filter(f => f.type.startsWith('image/')).slice(0, 20);
    const previews = await Promise.all(picked.map(async f => ({
      file: f, preview: URL.createObjectURL(f), caption: '', name: f.name,
    })));
    setFiles(p => [...p, ...previews]);
  };

  const onDrop = e => { e.preventDefault(); addFiles(e.dataTransfer.files); };

  const handleUpload = async () => {
    if (!finalDest) { setErr('Please select or enter a destination.'); return; }
    if (!files.length) { setErr('Please add at least one photo.'); return; }
    setErr(''); setUploading(true); let done = 0;

    for (const item of files) {
      try {
        const imageData = await fileToBase64(item.file);
        await fetch(`${API_BASE}/album-photos`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ imageData, destination: finalDest, caption: item.caption }),
        });
      } catch (e) { console.error(e); }
      setProgress(Math.round((++done / files.length) * 100));
    }

    setUploading(false);
    onUploaded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Add Photos</h3>
              <p className="text-xs text-gray-400">Upload to your memory album</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Destination picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination *</label>
            <select
              value={dest}
              onChange={e => { setDest(e.target.value); setErr(''); }}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">Select destination…</option>
              {tripDests.map(d => <option key={d} value={d}>{d}</option>)}
              <option value="__custom__">+ Enter custom destination</option>
            </select>
            {dest === '__custom__' && (
              <input
                value={customDest}
                onChange={e => setCustomDest(e.target.value)}
                placeholder="e.g. Rangamati"
                className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            )}
          </div>

          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-2xl p-10 text-center cursor-pointer transition-all bg-purple-50/40 hover:bg-purple-50"
          >
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Plus className="w-7 h-7 text-purple-500" />
            </div>
            <p className="text-sm font-medium text-gray-700">Drag & drop photos here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse · up to 20 photos · 10 MB each</p>
          </div>

          {/* Preview */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">{files.length} photo{files.length > 1 ? 's' : ''} ready</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {files.map((item, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-100">
                    <img src={item.preview} alt="" className="w-full h-28 object-cover" />
                    <button
                      onClick={() => setFiles(f => f.filter((_, j) => j !== i))}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="p-2">
                      <input
                        value={item.caption}
                        onChange={e => setFiles(f => f.map((p, j) => j === i ? { ...p, caption: e.target.value } : p))}
                        placeholder="Caption…"
                        className="w-full text-xs bg-transparent focus:outline-none text-gray-500 placeholder-gray-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {err && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{err}
            </p>
          )}

          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500"><span>Uploading…</span><span>{progress}%</span></div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button onClick={onClose} disabled={uploading} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || !files.length || !finalDest}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:from-purple-600 hover:to-fuchsia-600 transition-all flex items-center justify-center gap-2"
          >
            {uploading
              ? <><Loader className="w-4 h-4 animate-spin" /> Uploading…</>
              : <><Upload className="w-4 h-4" /> Upload {files.length > 0 ? files.length : ''} Photo{files.length !== 1 ? 's' : ''}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Album detail ──────────────────────────────────────────────────────────────
function AlbumDetail({ album, trips, onBack, onPhotoDeleted, onPhotoPatched, onRefresh }) {
  const [lightbox,       setLightbox]       = useState(null);
  const [editingId,      setEditingId]      = useState(null);
  const [captionDraft,   setCaptionDraft]   = useState('');
  const [showUpload,     setShowUpload]     = useState(false);
  const [deleteConfirm,  setDeleteConfirm]  = useState(null);

  const photos = album.photos;
  const lbIdx  = photos.findIndex(p => p.id === lightbox?.id);

  useEffect(() => {
    if (!lightbox) return;
    const h = e => {
      if (e.key === 'ArrowRight' && lbIdx < photos.length - 1) setLightbox(photos[lbIdx + 1]);
      if (e.key === 'ArrowLeft'  && lbIdx > 0)                 setLightbox(photos[lbIdx - 1]);
      if (e.key === 'Escape')                                   setLightbox(null);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [lightbox, lbIdx, photos]);

  const apiPatch = async (dbId, body) => {
    const r = await fetch(`${API_BASE}/album-photos/${dbId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body) });
    return r.json();
  };

  const handleDelete = async photo => {
    if (photo.source !== 'upload') return;
    if (deleteConfirm !== photo.id) { setDeleteConfirm(photo.id); return; }
    setDeleteConfirm(null);
    await fetch(`${API_BASE}/album-photos/${photo.dbId}`, { method: 'DELETE', headers: authHeaders() });
    if (lightbox?.id === photo.id) setLightbox(null);
    onPhotoDeleted(photo.dbId);
  };

  const handleLike = async photo => {
    if (photo.source !== 'upload') return;
    const data = await apiPatch(photo.dbId, { liked: !photo.liked });
    if (data.success) onPhotoPatched(photo.dbId, { liked: data.photo.liked });
  };

  const saveCaption = async photo => {
    if (photo.source === 'upload') {
      const data = await apiPatch(photo.dbId, { caption: captionDraft });
      if (data.success) onPhotoPatched(photo.dbId, { caption: captionDraft });
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {showUpload && (
        <UploadModal trips={trips} onClose={() => setShowUpload(false)} onUploaded={() => { setShowUpload(false); onRefresh(); }} />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white shadow-xl shadow-purple-200">
        <button onClick={onBack} className="flex items-center gap-2 mb-5 hover:bg-white/20 px-3 py-2 rounded-lg transition-all text-sm w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Albums
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-3">{album.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-purple-100 text-sm">
              {album.date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{album.date}</span>}
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{album.location}</span>
              <span className="flex items-center gap-1"><Camera className="w-4 h-4" />{photos.length} photos</span>
              {album.uploadedCount > 0 && <span>📤 {album.uploadedCount} uploaded</span>}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all text-sm font-semibold shadow"
            >
              <Plus className="w-4 h-4" /> Add Photos
            </button>
            <button className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all"><Share2 className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-2 border-purple-100 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-purple-900 font-semibold text-sm mb-1">AI Magic Insights</h4>
            <p className="text-xs text-purple-800 leading-relaxed">
              {photos.length} memories detected across {album.tripCount} trip{album.tripCount !== 1 ? 's' : ''} to {album.location}.
              {album.uploadedCount > 0
                ? ` You've personally added ${album.uploadedCount} photo${album.uploadedCount !== 1 ? 's' : ''}.`
                : ' Upload your own photos to enrich this album!'}
            </p>
          </div>
        </div>
      </div>

      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Image className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 text-sm">No photos yet.</p>
          <button onClick={() => setShowUpload(true)} className="px-5 py-2.5 bg-purple-500 text-white rounded-xl text-sm hover:bg-purple-600 transition-all">
            Upload First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="relative group aspect-square overflow-hidden rounded-2xl bg-gray-100 cursor-pointer">
              {/* Image */}
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onClick={() => setLightbox(photo)}
                onError={e => { e.target.src = DEFAULT_IMGS[0]; }}
              />

              {/* Caption overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={() => setLightbox(photo)}
              >
                <div className="absolute bottom-0 inset-x-0 p-3">
                  <p className="text-white text-xs font-medium truncate">{photo.caption}</p>
                  {photo.date && <p className="text-white/50 text-xs">{photo.date}</p>}
                </div>
              </div>

              {/* Action bar (upload photos only) */}
              {photo.source === 'upload' && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); handleLike(photo); }} className="p-1.5 bg-white/90 rounded-full shadow">
                    <Heart className={`w-3.5 h-3.5 ${photo.liked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setEditingId(photo.id); setCaptionDraft(photo.caption || ''); }} className="p-1.5 bg-white/90 rounded-full shadow">
                    <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  {deleteConfirm === photo.id ? (
                    <button onClick={e => { e.stopPropagation(); handleDelete(photo); }} className="px-2 py-1 bg-red-500 text-white rounded-full text-[10px] font-semibold shadow">
                      Sure?
                    </button>
                  ) : (
                    <button onClick={e => { e.stopPropagation(); setDeleteConfirm(photo.id); }} className="p-1.5 bg-white/90 rounded-full shadow">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  )}
                </div>
              )}

              {/* Inline caption editor */}
              {editingId === photo.id && (
                <div className="absolute inset-x-0 bottom-0 bg-white/95 p-3 flex gap-2" onClick={e => e.stopPropagation()}>
                  <input
                    autoFocus
                    value={captionDraft}
                    onChange={e => setCaptionDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveCaption(photo); if (e.key === 'Escape') setEditingId(null); }}
                    placeholder="Add caption…"
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-300"
                  />
                  <button onClick={() => saveCaption(photo)} className="p-1.5 bg-purple-500 rounded-lg"><Check className="w-3.5 h-3.5 text-white" /></button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 rounded-lg"><X className="w-3.5 h-3.5 text-gray-500" /></button>
                </div>
              )}

              {/* "Yours" badge */}
              {photo.source === 'upload' && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-purple-500/90 rounded-full text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Yours
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button onClick={() => setLightbox(null)} className="absolute top-5 right-5 p-3 bg-white/10 hover:bg-white/20 rounded-full z-10"><X className="w-5 h-5 text-white" /></button>
          {lbIdx > 0 && (
            <button onClick={() => setLightbox(photos[lbIdx - 1])} className="absolute left-5 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full z-10">
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          {lbIdx < photos.length - 1 && (
            <button onClick={() => setLightbox(photos[lbIdx + 1])} className="absolute right-5 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full z-10">
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}
          <div className="max-w-5xl w-full">
            <img src={lightbox.url} alt={lightbox.caption} className="w-full h-auto max-h-[75vh] object-contain rounded-2xl" onError={e => { e.target.src = DEFAULT_IMGS[0]; }} />
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mt-4 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{lightbox.caption}</p>
                <p className="text-white/50 text-sm">{lightbox.date} · {lbIdx + 1} / {photos.length}</p>
              </div>
              {lightbox.source === 'upload' && (
                <div className="flex gap-2">
                  <button onClick={() => handleLike(lightbox)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                    <Heart className={`w-5 h-5 ${lightbox.liked ? 'fill-red-400 text-red-400' : 'text-white'}`} />
                  </button>
                  {deleteConfirm === lightbox.id ? (
                    <button onClick={() => handleDelete(lightbox)} className="px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold transition-all">
                      Confirm Delete
                    </button>
                  ) : (
                    <button onClick={() => setDeleteConfirm(lightbox.id)} className="p-2.5 bg-white/10 hover:bg-red-500/40 rounded-xl transition-all">
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function MagicMemoryAlbum({ onBack, selectedAlbumId }) {
  const [albums,   setAlbums]   = useState([]);
  const [trips,    setTrips]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [authed,   setAuthed]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [showUp,   setShowUp]   = useState(false);
  const [stats,    setStats]    = useState({ total: 0, photos: 0, locations: 0, thisMonth: 0 });

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) { setAuthed(false); setLoading(false); return; }

    try {
      const [tR, pR] = await Promise.all([
        fetch(`${API_BASE}/trips`,        { headers: authHeaders() }),
        fetch(`${API_BASE}/album-photos`, { headers: authHeaders() }),
      ]);
      if (tR.status === 401 || pR.status === 401) { setAuthed(false); setLoading(false); return; }

      const [tD, pD] = await Promise.all([tR.json(), pR.json()]);
      const tripList  = tD.trips   || [];
      const photoList = pD.photos  || [];

      setTrips(tripList);
      const built = buildAlbums(tripList, photoList);
      setAlbums(built);

      const now = new Date();
      const thisMonth = photoList.filter(p => {
        const d = new Date(p.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }).length;

      setStats({
        total:    built.length,
        photos:   built.reduce((s, a) => s + a.photos.length, 0),
        locations: built.length,
        thisMonth,
      });

      if (selectedAlbumId) {
        const found = built.find(a => a.id === selectedAlbumId);
        if (found) setSelected(found);
      }
    } catch (e) { setError(e.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [selectedAlbumId]);

  useEffect(() => { load(); }, [load]);

  // Keep selected album fresh after load
  useEffect(() => {
    if (!selected) return;
    const fresh = albums.find(a => a.id === selected.id);
    if (fresh) setSelected(fresh);
  }, [albums]);

  // Patch a photo's fields locally
  const patchPhoto = useCallback((dbId, fields) => {
    const update = alb => ({
      ...alb,
      photos: alb.photos.map(p => p.dbId === dbId ? { ...p, ...fields } : p),
    });
    setAlbums(prev => prev.map(update));
    setSelected(prev => prev ? update(prev) : prev);
  }, []);

  // Remove a photo locally
  const removePhoto = useCallback((dbId) => {
    const update = alb => ({
      ...alb,
      photos: alb.photos.filter(p => p.dbId !== dbId),
      uploadedCount: Math.max(0, alb.uploadedCount - 1),
    });
    setAlbums(prev => prev.map(update).filter(a => a.photos.length > 0));
    setSelected(prev => prev ? update(prev) : prev);
  }, []);

  // ── Album detail view ──
  if (selected) {
    return (
      <AlbumDetail
        album={selected}
        trips={trips}
        onBack={() => setSelected(null)}
        onPhotoDeleted={removePhoto}
        onPhotoPatched={patchPhoto}
        onRefresh={load}
      />
    );
  }

  // ── Album list view ──
  return (
    <div className="space-y-6">
      {showUp && <UploadModal trips={trips} onClose={() => setShowUp(false)} onUploaded={load} />}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white shadow-xl shadow-purple-200">
        <button onClick={onBack} className="flex items-center gap-2 mb-5 hover:bg-white/20 px-3 py-2 rounded-lg transition-all text-sm w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Magic Memory Albums</h2>
            <p className="text-purple-200 text-sm">AI-powered memories from your real trips</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUp(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all text-sm font-semibold shadow"
            >
              <Plus className="w-4 h-4" /> Add Photos
            </button>
            <button
              onClick={load}
              className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all border border-white/30"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Grid   className="w-6 h-6 text-purple-600" />, bg: 'bg-purple-100', val: stats.total,     label: 'Albums' },
          { icon: <Camera className="w-6 h-6 text-blue-600"   />, bg: 'bg-blue-100',   val: stats.photos,    label: 'Total Photos' },
          { icon: <MapPin className="w-6 h-6 text-green-600"  />, bg: 'bg-green-100',  val: stats.locations, label: 'Destinations' },
          { icon: <Sparkles className="w-6 h-6 text-orange-500" />, bg: 'bg-orange-100', val: stats.thisMonth, label: 'Added This Month' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-3xl font-bold text-gray-800 mb-1">{loading ? '–' : s.val}</div>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? <Spinner /> : !authed ? (
        <div className="flex flex-col items-center py-20 gap-4 text-center">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
            <Lock className="w-7 h-7 text-purple-400" />
          </div>
          <p className="font-medium text-gray-700">Sign in to view your albums</p>
        </div>
      ) : error ? <ErrBox msg={error} onRetry={load} /> : albums.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-5 text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center">
            <Image className="w-10 h-10 text-purple-200" />
          </div>
          <div>
            <p className="font-semibold text-gray-700 text-lg">No albums yet</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              Albums are built from your trips. Book a trip or upload your first photo to start.
            </p>
          </div>
          <button
            onClick={() => setShowUp(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-purple-200 hover:from-purple-600 hover:to-fuchsia-600 transition-all"
          >
            <Upload className="w-4 h-4" /> Upload Your First Photo
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map(album => (
            <div
              key={album.id}
              onClick={() => setSelected(album)}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer group"
            >
              <div className="relative h-60 overflow-hidden">
                <img
                  src={album.cover}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={e => { e.target.src = DEFAULT_IMGS[0]; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <h3 className="text-white text-lg font-bold mb-1.5">{album.title}</h3>
                  <div className="flex items-center gap-3 text-white/80 text-xs">
                    <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5" />{album.photos.length} photos</span>
                    {album.date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{album.date}</span>}
                    {album.uploadedCount > 0 && <span>📤 {album.uploadedCount} yours</span>}
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{album.location}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <button className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-xl text-sm font-medium shadow-md shadow-purple-100 hover:from-purple-600 hover:to-fuchsia-600 transition-all">
                  View Album
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-2 border-purple-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-purple-900 font-semibold mb-1.5">How Magic Albums Work</h4>
            <p className="text-sm text-purple-800 leading-relaxed">
              Albums are automatically built from your real trip history. Each destination becomes its own album.
              Click <strong>Add Photos</strong> to upload your personal pictures — they'll appear instantly in the right album, marked as <em>Yours</em>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}