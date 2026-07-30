import { useState } from 'react';
import { photoService } from '../../../services/photoService.js';
import { formatDate } from '../../../utils/data.js';
import './PhotoCompare.css';

const POSITION_LABELS = {
    front: 'Frontal',
    left: 'Lateral Izquierdo',
    right: 'Lateral Derecho',
    back: 'Dorsal'
};

const POSITIONS = ['front', 'left', 'right', 'back'];

function PhotoCompare({ photos }) {
    const groupedPhotos = photos.reduce((acc, photo) => {
        if (!acc[photo.taken_at]) {
            acc[photo.taken_at] = {};
        }
        acc[photo.taken_at][photo.position] = photo;
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedPhotos).sort((a, b) => 
        new Date(a) - new Date(b)
    );

    const [selectedPosition, setSelectedPosition] = useState('front');
    const [beforeDate, setBeforeDate] = useState(sortedDates[0] || '');
    const [afterDate, setAfterDate] = useState(sortedDates[sortedDates.length - 1] || '');

    const beforePhoto = groupedPhotos[beforeDate]?.[selectedPosition];
    const afterPhoto = groupedPhotos[afterDate]?.[selectedPosition];

    if (sortedDates.length < 2) {
        return (
            <div className="photo-compare-empty">
                <p>Se necesitan al menos 2 sesiones de fotos para comparar.</p>
            </div>
        );
    }

    return (
        <div className="photo-compare">
            <div className="photo-compare-controls">
                <div className="compare-control-group">
                    <label htmlFor="position-select">Posición:</label>
                    <select
                        id="position-select"
                        value={selectedPosition}
                        onChange={(e) => setSelectedPosition(e.target.value)}
                    >
                        {POSITIONS.map(pos => (
                            <option key={pos} value={pos}>{POSITION_LABELS[pos]}</option>
                        ))}
                    </select>
                </div>

                <div className="compare-control-group">
                    <label htmlFor="before-date">Antes:</label>
                    <select
                        id="before-date"
                        value={beforeDate}
                        onChange={(e) => setBeforeDate(e.target.value)}
                    >
                        {sortedDates.map(date => (
                            <option key={date} value={date}>{formatDate(date)}</option>
                        ))}
                    </select>
                </div>

                <div className="compare-control-group">
                    <label htmlFor="after-date">Después:</label>
                    <select
                        id="after-date"
                        value={afterDate}
                        onChange={(e) => setAfterDate(e.target.value)}
                    >
                        {sortedDates.map(date => (
                            <option key={date} value={date}>{formatDate(date)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="photo-compare-view">
                <div className="compare-panel">
                    <div className="compare-panel-header">
                        <span className="compare-label">Antes</span>
                        <span className="compare-date">{formatDate(beforeDate)}</span>
                    </div>
                    {beforePhoto ? (
                        <div className="compare-image-container">
                            <img 
                                src={photoService.getPublicUrl(beforePhoto.storage_path)} 
                                alt={`${POSITION_LABELS[selectedPosition]} - Antes`}
                            />
                        </div>
                    ) : (
                        <div className="compare-no-photo">
                            <p>No hay foto para esta posición</p>
                        </div>
                    )}
                </div>

                <div className="compare-panel">
                    <div className="compare-panel-header">
                        <span className="compare-label">Después</span>
                        <span className="compare-date">{formatDate(afterDate)}</span>
                    </div>
                    {afterPhoto ? (
                        <div className="compare-image-container">
                            <img 
                                src={photoService.getPublicUrl(afterPhoto.storage_path)} 
                                alt={`${POSITION_LABELS[selectedPosition]} - Después`}
                            />
                        </div>
                    ) : (
                        <div className="compare-no-photo">
                            <p>No hay foto para esta posición</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PhotoCompare;
