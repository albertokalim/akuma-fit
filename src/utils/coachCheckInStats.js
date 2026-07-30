const ADHERENCE_MAP = {
    'Totalmente': 100,
    'Parcialmente': 50,
    'Nada': 0,
};

const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const yearStart = new Date(d.getFullYear(), 0, 4);
    return d.getFullYear() * 100 + Math.round(((d - yearStart) / 604800000) + 1);
};

const calculateAverageAdherence = (checkIns, field) => {
    if (!checkIns || checkIns.length === 0) return 0;

    const values = checkIns
        .map((ci) => ADHERENCE_MAP[ci[field]])
        .filter((v) => v !== undefined);

    if (values.length === 0) return 0;

    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
};

const calculateAverage = (checkIns, field) => {
    if (!checkIns || checkIns.length === 0) return 0;

    const values = checkIns
        .map((ci) => Number(ci[field]))
        .filter((v) => !isNaN(v) && v !== null);

    if (values.length === 0) return 0;

    return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10;
};

export const generateCoachAlerts = (checkIns) => {
    if (!checkIns || checkIns.length === 0) return [];

    const alerts = [];
    const sorted = [...checkIns].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    const recent = sorted.slice(-3);
    const minCheckInsForTrend = 3;

    if (sorted.length >= minCheckInsForTrend) {
        const avgDietRecent = calculateAverageAdherence(recent, 'diet_adherence');
        if (avgDietRecent < 50) {
            alerts.push({
                type: 'warning',
                text: `Baja adherencia a la dieta en las últimas 3 semanas (${avgDietRecent}% de media).`,
            });
        }

        const avgTrainingRecent = calculateAverageAdherence(recent, 'training_adherence');
        if (avgTrainingRecent < 50) {
            alerts.push({
                type: 'warning',
                text: `Baja adherencia al entrenamiento en las últimas 3 semanas (${avgTrainingRecent}% de media).`,
            });
        }

        const avgEnergyRecent = calculateAverage(recent, 'energy_level');
        if (avgEnergyRecent > 0 && avgEnergyRecent <= 4) {
            alerts.push({
                type: 'warning',
                text: `Nivel de energía bajo sostenido (${avgEnergyRecent}/10 de media en las últimas 3 semanas).`,
            });
        }

        const avgRestRecent = calculateAverage(recent, 'rest_quality');
        if (avgRestRecent > 0 && avgRestRecent <= 5) {
            alerts.push({
                type: 'warning',
                text: `Recuperación insuficiente (${avgRestRecent}/10 de media en las últimas 3 semanas).`,
            });
        }

        const avgHungerRecent = calculateAverage(recent, 'hunger_level');
        if (avgHungerRecent >= 7) {
            alerts.push({
                type: 'warning',
                text: `Nivel de hambre elevado (${avgHungerRecent}/10 de media en las últimas 3 semanas).`,
            });
        }
    }

    // Detectar racha rota: si han pasado 2+ semanas sin check-in
    const currentWeek = getWeekNumber(new Date());
    const lastCheckInWeek = sorted.length > 0 ? getWeekNumber(sorted[sorted.length - 1].created_at) : null;
    
    if (lastCheckInWeek && currentWeek - lastCheckInWeek >= 2) {
        // Calcular la racha que tenía antes de romperse
        const weekNumbers = [...new Set(sorted.map(ci => getWeekNumber(ci.created_at)))].sort((a, b) => b - a);
        
        let streak = 1;
        for (let i = 0; i < weekNumbers.length - 1; i++) {
            if (weekNumbers[i] - weekNumbers[i + 1] === 1) {
                streak++;
            } else {
                break;
            }
        }
        
        if (streak >= 2) {
            alerts.push({
                type: 'warning',
                text: `Racha rota: tenía ${streak} semanas consecutivas de check-ins.`,
            });
        }
    }

    return alerts;
};
