import { useState, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useSignedPhotoUrls } from '../../../hooks/useSignedPhotoUrls.js';
import { formatDate } from '../../../utils/data.js';


const POSITION_LABELS = {
    front: 'Frontal',
    left: 'Lateral Izquierdo',
    right: 'Lateral Derecho',
    back: 'Dorsal'
};

function PhotoGallery({ photos }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const storagePaths = useMemo(() => photos.map(p => p.storage_path), [photos]);
    const { urls } = useSignedPhotoUrls(storagePaths);

    const groupedPhotos = photos.reduce((acc, photo) => {
        if (!acc[photo.taken_at]) {
            acc[photo.taken_at] = [];
        }
        acc[photo.taken_at].push(photo);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedPhotos).sort((a, b) => 
        new Date(b) - new Date(a)
    );

    const openLightbox = (date, photoIndex = 0) => {
        setCurrentDate(date);
        setCurrentPhotoIndex(photoIndex);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setCurrentDate(null);
        setCurrentPhotoIndex(0);
    };

    const goToPrevious = () => {
        const currentPhotos = groupedPhotos[currentDate];
        setCurrentPhotoIndex((prev) => 
            prev === 0 ? currentPhotos.length - 1 : prev - 1
        );
    };

    const goToNext = () => {
        const currentPhotos = groupedPhotos[currentDate];
        setCurrentPhotoIndex((prev) => 
            prev === currentPhotos.length - 1 ? 0 : prev + 1
        );
    };

    if (!photos || photos.length === 0) {
        return (
            <div className="photo-gallery-empty">
                <p>No hay fotos registradas.</p>
            </div>
        );
    }

    return (
        <div className="photo-gallery">
            <div className="photo-gallery-dates">
                {sortedDates.map(date => {
                    const datePhotos = groupedPhotos[date];
                    const thumbnail = datePhotos[0];
                    
                    return (
                        <div key={date} className="photo-date-group">
                            <div 
                                className="photo-date-thumbnail"
                                onClick={() => openLightbox(date)}
                            >
                                <img 
                                    src={urls[thumbnail.storage_path]} 
                                    alt={POSITION_LABELS[thumbnail.position]}
                                />
                                <div className="photo-date-overlay">
                                    <span className="photo-date-label">{formatDate(date)}</span>
                                    <span className="photo-count">{datePhotos.length} fotos</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {lightboxOpen && currentDate && (
                <div className="photo-lightbox" onClick={closeLightbox}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <div className="lightbox-header">
                            <h3>{formatDate(currentDate)}</h3>
                            <span className="lightbox-position">
                                {POSITION_LABELS[groupedPhotos[currentDate][currentPhotoIndex].position]}
                            </span>
                        </div>

                        <div className="lightbox-image-container">
                            <button 
                                className="lightbox-nav lightbox-prev" 
                                onClick={goToPrevious}
                                disabled={groupedPhotos[currentDate].length <= 1}
                            >
                                <FiChevronLeft size={32} />
                            </button>

                            <img 
                                src={urls[groupedPhotos[currentDate][currentPhotoIndex].storage_path]} 
                                alt={POSITION_LABELS[groupedPhotos[currentDate][currentPhotoIndex].position]}
                                className="lightbox-image"
                            />

                            <button 
                                className="lightbox-nav lightbox-next" 
                                onClick={goToNext}
                                disabled={groupedPhotos[currentDate].length <= 1}
                            >
                                <FiChevronRight size={32} />
                            </button>
                        </div>

                        <div className="lightbox-thumbnails">
                            {groupedPhotos[currentDate].map((photo, index) => (
                                <div 
                                    key={photo.id}
                                    className={`lightbox-thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentPhotoIndex(index)}
                                >
                                    <img 
                                        src={urls[photo.storage_path]} 
                                        alt={POSITION_LABELS[photo.position]}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PhotoGallery;
