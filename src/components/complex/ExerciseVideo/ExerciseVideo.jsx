import { useAsyncData } from '../../../hooks/useAsyncData.js';
import { exerciseVideoService } from '../../../services/exerciseService.js';

/**
 * Reproductor de vídeo de demostración de un ejercicio.
 *
 * @param {Object} props - Props del componente.
 * @param {number} props.exerciseId - Id del ejercicio.
 * @param {string} [props.emptyMessage] - Texto a mostrar si no hay vídeo.
 */
function ExerciseVideo({ exerciseId, emptyMessage }) {
    const { data: videoUrl, loading } = useAsyncData(
        async () => await exerciseVideoService.getSignedUrl(exerciseId),
        [exerciseId]
    );

    if (loading) {
        return <div className="loading-state">Cargando video...</div>;
    }

    if (!videoUrl) {
        return emptyMessage
            ? <p className="exercise-detail-text">{emptyMessage}</p>
            : null;
    }

    return (
        <video controls src={videoUrl} className="video-preview">
            Tu navegador no soporta videos.
        </video>
    );
}

export default ExerciseVideo;
