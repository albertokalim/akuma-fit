import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiCalendar, FiUser } from 'react-icons/fi';
import Button from '../../components/primitives/Button/Button.jsx';
import { mealPlanService } from '../../services/mealPlanService.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';

function MealPlans() {
    const navigate = useNavigate();
    const [reloadKey, setReloadKey] = useState(0);

    const { data: plans, loading, error } = useAsyncData(
        () => mealPlanService.getAll(),
        [reloadKey],
        []
    );

    const handleDelete = async (plan) => {
        if (!window.confirm(`¿Eliminar el plan "${plan.title}"? Se perderán sus días y asignaciones.`)) return;

        try {
            await mealPlanService.delete(plan.id);
            setReloadKey(key => key + 1);
        } catch (err) {
            window.alert(`No se pudo eliminar: ${err.message}`);
        }
    };

    return (
        <div className="diet-page">
            <div className="page-container">
                <div className="page-header">
                    <h1 className="page-title">Dietas</h1>
                    <Button onClick={() => navigate('/app/dietas/new')}>
                        <FiPlus size={18} />
                        <span>Nuevo plan</span>
                    </Button>
                </div>

                {loading ? (
                    <div className="loading-state">Cargando planes...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : plans.length === 0 ? (
                    <div className="empty-state">
                        <p>Aún no hay planes de alimentación. Crea el primero.</p>
                    </div>
                ) : (
                    <div className="recipes-grid">
                        {plans.map(plan => (
                            <div
                                key={plan.id}
                                className="routine-card clickable"
                                onClick={() => navigate(`/app/dietas/${plan.id}/edit`)}
                            >
                                <div className="recipe-card-header">
                                    <h3 className="routine-card-title">{plan.title}</h3>
                                    <button
                                        className="btn-icon btn-icon-danger"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleDelete(plan);
                                        }}
                                        title="Eliminar plan"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>

                                {plan.description && (
                                    <p className="routine-card-comment">{plan.description}</p>
                                )}

                                <div className="routine-card-footer">
                                    <span className="routine-card-stat">
                                        <FiCalendar size={14} />
                                        {' '}
                                        {plan.dayCount} {plan.dayCount === 1 ? 'día' : 'días'}
                                    </span>
                                    <span className="routine-card-stat">
                                        <FiUser size={14} />
                                        {' '}
                                        {plan.clients.length} {plan.clients.length === 1 ? 'cliente' : 'clientes'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MealPlans;
