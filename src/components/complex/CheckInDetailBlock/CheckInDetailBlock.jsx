import { getAdherenceClass, ADHERENCE_MAP } from '../../../utils/checkInStats.js';

/**
 * Detalle de un check-in, en modo compacto (tarjeta de historial) o completo
 * (bloques por categoría).
 *
 * @param {Object} props - Props del componente.
 * @param {Object} props.checkIn - Datos del check-in.
 * @param {boolean} [props.compact=false] - Si se muestra el modo compacto.
 */
function CheckInDetailBlock({ checkIn, compact = false }) {
    if (!checkIn) return null;

    if (compact) {
        return (
            <div className="history-card-content">
                <div className="history-detail">
                    <span className="detail-label">Dieta:</span>
                    <span>{checkIn.diet_adherence}</span>
                </div>
                {checkIn.diet_adherence_reason && (
                    <div className="history-detail reason">
                        <span className="detail-label">Motivo dieta:</span>
                        <span>{checkIn.diet_adherence_reason}</span>
                    </div>
                )}
                <div className="history-detail">
                    <span className="detail-label">Entrenamiento:</span>
                    <span>{checkIn.training_adherence}</span>
                </div>
                {checkIn.training_adherence_reason && (
                    <div className="history-detail reason">
                        <span className="detail-label">Motivo entreno:</span>
                        <span>{checkIn.training_adherence_reason}</span>
                    </div>
                )}
                <div className="history-detail">
                    <span className="detail-label">Cardio:</span>
                    <span>{checkIn.cardio_adherence}</span>
                </div>
                <div className="history-detail">
                    <span className="detail-label">Rendimiento gym:</span>
                    <span>{checkIn.gym_performance}/5</span>
                </div>
                {checkIn.avg_daily_steps && (
                    <div className="history-detail">
                        <span className="detail-label">Pasos diarios:</span>
                        <span>{checkIn.avg_daily_steps}</span>
                    </div>
                )}
                <div className="history-detail">
                    <span className="detail-label">Descanso:</span>
                    <span>{checkIn.rest_quality}/10</span>
                </div>
                {checkIn.avg_sleep_hours && (
                    <div className="history-detail">
                        <span className="detail-label">Horas sueño:</span>
                        <span>{checkIn.avg_sleep_hours}h</span>
                    </div>
                )}
                <div className="history-detail">
                    <span className="detail-label">Energía:</span>
                    <span>{checkIn.energy_level}/10</span>
                </div>
                <div className="history-detail">
                    <span className="detail-label">Hambre:</span>
                    <span>{checkIn.hunger_level}/10</span>
                </div>
                <div className="history-detail text-detail">
                    <span className="detail-label">Cómo te has sentido:</span>
                    <p>{checkIn.how_do_you_feel}</p>
                </div>
                {checkIn.comments && (
                    <div className="history-detail text-detail">
                        <span className="detail-label">Comentarios:</span>
                        <p>{checkIn.comments}</p>
                    </div>
                )}
                {checkIn.next_week_goal && (
                    <div className="history-detail text-detail">
                        <span className="detail-label">Objetivo próxima semana:</span>
                        <p>{checkIn.next_week_goal}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="checkin-blocks">
            <div className="checkin-block">
                <h3 className="block-title">Adherencia y cumplimiento</h3>
                <div className="block-content">
                    <div className="checkin-field">
                        <span className="field-label">Dieta:</span>
                        <span className={`field-value ${getAdherenceClass(ADHERENCE_MAP[checkIn.diet_adherence])}`}>
                            {checkIn.diet_adherence}
                        </span>
                    </div>
                    {checkIn.diet_adherence_reason && (
                        <div className="checkin-field reason">
                            <span className="field-label">Motivo:</span>
                            <span className="field-value">{checkIn.diet_adherence_reason}</span>
                        </div>
                    )}
                    <div className="checkin-field">
                        <span className="field-label">Entrenamiento:</span>
                        <span className={`field-value ${getAdherenceClass(ADHERENCE_MAP[checkIn.training_adherence])}`}>
                            {checkIn.training_adherence}
                        </span>
                    </div>
                    {checkIn.training_adherence_reason && (
                        <div className="checkin-field reason">
                            <span className="field-label">Motivo:</span>
                            <span className="field-value">{checkIn.training_adherence_reason}</span>
                        </div>
                    )}
                    <div className="checkin-field">
                        <span className="field-label">Cardio:</span>
                        <span className="field-value">{checkIn.cardio_adherence}</span>
                    </div>
                </div>
            </div>

            <div className="checkin-block">
                <h3 className="block-title">Rendimiento deportivo</h3>
                <div className="block-content">
                    <div className="checkin-field">
                        <span className="field-label">Rendimiento gym:</span>
                        <span className="field-value">{checkIn.gym_performance}/5</span>
                    </div>
                    {checkIn.avg_daily_steps && (
                        <div className="checkin-field">
                            <span className="field-label">Pasos diarios:</span>
                            <span className="field-value">{checkIn.avg_daily_steps}</span>
                        </div>
                    )}
                    {checkIn.next_week_goal && (
                        <div className="checkin-field">
                            <span className="field-label">Objetivo próxima semana:</span>
                            <span className="field-value">{checkIn.next_week_goal}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="checkin-block">
                <h3 className="block-title">Bienestar y recuperación</h3>
                <div className="block-content">
                    <div className="checkin-field">
                        <span className="field-label">Descanso:</span>
                        <span className="field-value">{checkIn.rest_quality}/10</span>
                    </div>
                    {checkIn.avg_sleep_hours && (
                        <div className="checkin-field">
                            <span className="field-label">Horas de sueño:</span>
                            <span className="field-value">{checkIn.avg_sleep_hours}h</span>
                        </div>
                    )}
                    <div className="checkin-field">
                        <span className="field-label">Energía:</span>
                        <span className="field-value">{checkIn.energy_level}/10</span>
                    </div>
                    <div className="checkin-field">
                        <span className="field-label">Hambre:</span>
                        <span className="field-value">{checkIn.hunger_level}/10</span>
                    </div>
                </div>
            </div>

            <div className="checkin-block">
                <h3 className="block-title">Feedback subjetivo</h3>
                <div className="block-content">
                    <div className="checkin-field">
                        <span className="field-label">¿Cómo te has sentido?</span>
                        <p className="field-value text-block">{checkIn.how_do_you_feel}</p>
                    </div>
                    {checkIn.comments && (
                        <div className="checkin-field">
                            <span className="field-label">Comentarios:</span>
                            <p className="field-value text-block">{checkIn.comments}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CheckInDetailBlock;
