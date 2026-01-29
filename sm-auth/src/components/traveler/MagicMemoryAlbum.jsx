import { Camera, ArrowLeft, Download, Share2, Heart, MapPin, Calendar, X, ChevronLeft, ChevronRight, Grid, Sparkles } from 'lucide-react';
import { useState } from 'react';

const albums = [
  {
    id: 1,
    title: 'Dhaka Adventures',
    date: 'Nov 2024',
    location: 'Dhaka',
    cover: 'https://images.unsplash.com/photo-1513563326940-e76e4641069e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMG5pZ2h0fGVufDF8fHx8MTc2NTQ3NTIxMXww&ixlib=rb-4.1.0&q=80&w=1080',
    photos: [
      { id: 1, url: 'https://images.unsplash.com/photo-1513563326940-e76e4641069e?w=800', caption: 'Dhaka skyline at night', date: 'Nov 12, 2024' },
      { id: 2, url: 'https://images.unsplash.com/photo-1523928208303-e88e7ff2c801?w=800', caption: 'Local market vibes', date: 'Nov 12, 2024' },
      { id: 3, url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', caption: 'Traditional rickshaw art', date: 'Nov 13, 2024' },
      { id: 4, url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', caption: 'Amazing street food', date: 'Nov 13, 2024' },
      { id: 5, url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800', caption: 'Beautiful sunset view', date: 'Nov 14, 2024' },
      { id: 6, url: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800', caption: 'Heritage architecture', date: 'Nov 14, 2024' },
      { id: 7, url: 'https://images.unsplash.com/photo-1519456264917-42d0aa2e0625?w=800', caption: 'City lights', date: 'Nov 15, 2024' },
      { id: 8, url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800', caption: 'Cultural performance', date: 'Nov 15, 2024' },
      { id: 9, url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800', caption: 'Modern Dhaka', date: 'Nov 15, 2024' },
      { id: 10, url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800', caption: 'Traffic chaos', date: 'Nov 16, 2024' },
      { id: 11, url: 'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800', caption: 'Riverside evening', date: 'Nov 16, 2024' },
      { id: 12, url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', caption: 'Restaurant visit', date: 'Nov 16, 2024' },
    ]
  },
  {
    id: 2,
    title: 'Sundarbans Trip',
    date: 'Oct 2024',
    location: 'Sundarbans',
    cover: 'https://images.unsplash.com/photo-1708943081020-2082b47e21ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW5nbGFkZXNoJTIwdHJhdmVsfGVufDF8fHx8MTc2NTUxNTMyMHww&ixlib=rb-4.1.0&q=80&w=1080',
    photos: [
      { id: 13, url: 'https://images.unsplash.com/photo-1708943081020-2082b47e21ba?w=800', caption: 'Mangrove forests', date: 'Oct 10, 2024' },
      { id: 14, url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800', caption: 'Boat journey', date: 'Oct 10, 2024' },
      { id: 15, url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800', caption: 'Wildlife spotting', date: 'Oct 11, 2024' },
      { id: 16, url: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=800', caption: 'Sunset over water', date: 'Oct 11, 2024' },
      { id: 17, url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Morning mist', date: 'Oct 12, 2024' },
      { id: 18, url: 'https://images.unsplash.com/photo-1523928208303-e88e7ff2c801?w=800', caption: 'Local village', date: 'Oct 12, 2024' },
    ]
  },
  {
    id: 3,
    title: 'Cox\'s Bazar Beach',
    date: 'Sep 2024',
    location: 'Cox\'s Bazar',
    cover: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHN1bnNldHxlbnwxfHx8fDE3NjU0MjY2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    photos: [
      { id: 19, url: 'https://images.unsplash.com/photo-1647962431451-d0fdaf1cf21c?w=800', caption: 'Beautiful sunset', date: 'Sep 5, 2024' },
      { id: 20, url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', caption: 'Beach waves', date: 'Sep 5, 2024' },
      { id: 21, url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800', caption: 'Morning beach walk', date: 'Sep 6, 2024' },
      { id: 22, url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', caption: 'Local seafood', date: 'Sep 6, 2024' },
      { id: 23, url: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800', caption: 'Beach activities', date: 'Sep 7, 2024' },
      { id: 24, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', caption: 'Calm waters', date: 'Sep 7, 2024' },
    ]
  }
];

export function MagicMemoryAlbum({ onBack, selectedAlbumId }) {
  const [selectedAlbum, setSelectedAlbum] = useState(selectedAlbumId ? albums.find(a => a.id === selectedAlbumId) : null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  if (selectedAlbum) {
    const currentIndex = selectedAlbum.photos.findIndex(p => p.id === lightboxPhoto?.id);

    const nextPhoto = () => {
      if (currentIndex < selectedAlbum.photos.length - 1) {
        setLightboxPhoto(selectedAlbum.photos[currentIndex + 1]);
      }
    };

    const prevPhoto = () => {
      if (currentIndex > 0) {
        setLightboxPhoto(selectedAlbum.photos[currentIndex - 1]);
      }
    };

    return (
      <div className="space-y-6">
       
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-8 text-white">
          <button
            onClick={() => setSelectedAlbum(null)}
            className="flex items-center gap-2 mb-4 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Albums</span>
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl mb-2">{selectedAlbum.title}</h2>
              <div className="flex items-center gap-4 text-purple-100">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedAlbum.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedAlbum.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  <span>{selectedAlbum.photos.length} photos</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

       
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-purple-900 mb-2">AI Magic Insights</h4>
              <p className="text-sm text-purple-800 leading-relaxed mb-3">
                Your photos have been automatically organized by location and time. AI detected {selectedAlbum.photos.length} memorable moments including scenic views, food experiences, and cultural activities.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/50 rounded-lg text-xs text-purple-800">Best moments auto-selected</span>
                <span className="px-3 py-1 bg-white/50 rounded-lg text-xs text-purple-800">Enhanced colors</span>
                <span className="px-3 py-1 bg-white/50 rounded-lg text-xs text-purple-800">Smart grouping</span>
              </div>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedAlbum.photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setLightboxPhoto(photo)}
              className="relative group cursor-pointer aspect-square overflow-hidden rounded-2xl bg-gray-100"
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <p className="text-white text-sm">{photo.caption}</p>
                  <p className="text-white/70 text-xs mt-1">{photo.date}</p>
                </div>
              </div>
              <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Heart className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>

        
        {lightboxPhoto && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {currentIndex > 0 && (
              <button
                onClick={prevPhoto}
                className="absolute left-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all z-10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {currentIndex < selectedAlbum.photos.length - 1 && (
              <button
                onClick={nextPhoto}
                className="absolute right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all z-10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}

            <div className="max-w-6xl w-full">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.caption}
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              />
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mt-4">
                <h3 className="text-white text-xl mb-2">{lightboxPhoto.caption}</h3>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span>{lightboxPhoto.date}</span>
                  <span>•</span>
                  <span>{currentIndex + 1} / {selectedAlbum.photos.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-8 text-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-4 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2">Magic Memory Albums</h2>
            <p className="text-purple-100">AI-powered photo organization from your travels</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all border border-white/30">
            <Camera className="w-5 h-5" />
            <span>Create Album</span>
          </button>
        </div>
      </div>

     
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Grid className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl mb-1">{albums.length}</div>
          <p className="text-sm text-gray-600">Total Albums</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl mb-1">{albums.reduce((sum, album) => sum + album.photos.length, 0)}</div>
          <p className="text-sm text-gray-600">Total Photos</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl mb-1">{albums.length}</div>
          <p className="text-sm text-gray-600">Locations</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl mb-1">18</div>
          <p className="text-sm text-gray-600">New This Month</p>
        </div>
      </div>

      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <div
            key={album.id}
            onClick={() => setSelectedAlbum(album)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer group"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={album.cover}
                alt={album.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6">
                <h3 className="text-white text-xl mb-2">{album.title}</h3>
                <div className="flex items-center gap-4 text-white/90 text-sm">
                  <div className="flex items-center gap-1">
                    <Camera className="w-4 h-4" />
                    <span>{album.photos.length} photos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{album.date}</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {album.location}
                </div>
              </div>
            </div>
            <div className="p-6">
              <button className="w-full py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all shadow-md">
                View Album
              </button>
            </div>
          </div>
        ))}
      </div>

     
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-purple-900 mb-2">How Magic Albums Work</h4>
            <p className="text-sm text-purple-800 leading-relaxed">
              Our AI automatically organizes your travel photos by date, location, and content. Photos are enhanced, grouped into meaningful moments, and tagged with activities. Simply upload your photos and let the magic happen!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}