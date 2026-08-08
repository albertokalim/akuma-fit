import { useAsyncData } from '../../../hooks/useAsyncData.js';
import { exerciseVideoService } from '../../../services/exerciseService.js';

/**
 * Video explicativo de un ejercicio (firmado desde Supabase Storage).
 * Si `emptyMessage` se proporciona, se muestra cuando el ejercicio no tiene
 * video; si no, el componente no renderiza nada.
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
