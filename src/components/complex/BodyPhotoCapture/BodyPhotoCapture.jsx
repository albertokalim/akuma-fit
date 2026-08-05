import { useState, useRef, useEffect } from 'react';
import { FiUser, FiChevronLeft, FiChevronRight, FiRotateCw, FiCamera, FiUpload, FiX } from 'react-icons/fi';


const PHOTO_POSITIONS = [
    { id: 'front', label: 'Frontal', icon: FiUser },
    { id: 'left', label: 'Lateral Izquierdo', icon: FiChevronLeft },
    { id: 'right', label: 'Lateral Derecho', icon: FiChevronRight },
    { id: 'back', label: 'Dorsal', icon: FiRotateCw }
];

function BodyPhotoCapture({ onPhotosChange }) {
    const [photos, setPhotos] = useState({});
    const [cameraOpen, setCameraOpen] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRefs = useRef({});

    const handleFileSelect = (position, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPhotos = { ...photos, [position]: reader.result };
                setPhotos(newPhotos);
                if (onPhotosChange) {
                    onPhotosChange(newPhotos);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTakePhoto = async (position) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            streamRef.current = stream;
            setCurrentPosition(position);
            setCameraOpen(true);
        } catch (err) {
            console.error('Error accediendo a la cámara:', err);
            alert('No se pudo acceder a la cámara. Asegúrate de dar permisos o usa el botón de archivo.');
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && currentPosition) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg');
            
            const newPhotos = { ...photos, [currentPosition]: imageData };
            setPhotos(newPhotos);
            if (onPhotosChange) {
                onPhotosChange(newPhotos);
            }
            
            closeCamera();
        }
    };

    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraOpen(false);
        setCurrentPosition(null);
    };

    useEffect(() => {
        if (cameraOpen && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => {});
        }
    }, [cameraOpen]);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleUploadFromFile = (position) => {
        const input = fileInputRefs.current[position];
        if (input) {
            input.click();
        }
    };

    const handleRemovePhoto = (position) => {
        const newPhotos = { ...photos };
        delete newPhotos[position];
        setPhotos(newPhotos);
        if (onPhotosChange) {
            onPhotosChange(newPhotos);
        }
    };

    return (
        <div className="body-photo-capture">
            <h3 className="body-photo-title">Fotos Corporales</h3>
            <p className="body-photo-description">
                Toma 4 fotos para registrar tu progreso visual. Puedes usar la cámara o subir desde tus archivos.
            </p>

            <div className="photo-grid">
                {PHOTO_POSITIONS.map((position) => (
                    <div key={position.id} className="photo-slot">
                        <label className="photo-label">{position.label}</label>
                        
                        {photos[position.id] ? (
                            <div className="photo-preview">
                                <img src={photos[position.id]} alt={position.label} />
                                <button onClick={() => handleRemovePhoto(position.id)} className="remove-photo-btn">
                                    <span className="button-icon"><FiX size={20} /></span>
                                </button>
                            </div>
                        ) : (
                            <div className="photo-placeholder">
                                <position.icon className="photo-icon" size={48} />
                                <div className="photo-actions">
                                    <button onClick={() => handleTakePhoto(position.id)} className="camera-btn">
                                        <span className="button-icon"><FiCamera size={18} /></span>
                                        <span className="button-text">Cámara</span>
                                    </button>
                                    <button onClick={() => handleUploadFromFile(position.id)} className="upload-btn">
                                        <span className="button-icon"><FiUpload size={18} /></span>
                                        <span className="button-text">Archivo</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <input
                            type="file"
                            ref={(el) => (fileInputRefs.current[position.id] = el)}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileSelect(position.id, e)}
                        />
                    </div>
                ))}
            </div>

            {cameraOpen && (
                <div className="camera-modal">
                    <div className="camera-modal-content">
                        <div className="camera-header">
                            <h4>Capturar Foto</h4>
                            <button onClick={closeCamera} className="close-camera-btn">
                                <span className="button-icon"><FiX size={24} /></span>
                            </button>
                        </div>
                        <div className="camera-preview">
                            <video ref={videoRef} autoPlay playsInline />
                        </div>
                        <div className="camera-actions">
                            <button onClick={closeCamera} className="cancel-camera-btn">
                                <span className="button-text">Cancelar</span>
                            </button>
                            <button onClick={capturePhoto} className="capture-btn">
                                <span className="button-icon"><FiCamera size={18} /></span>
                                <span className="button-text">Capturar</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BodyPhotoCapture;
