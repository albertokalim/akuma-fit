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

export const calculateStreak = (checkIns) => {
    if (!checkIns || checkIns.length === 0) return 0;

    const sorted = [...checkIns]
        .map((ci) => new Date(ci.created_at))
        .sort((a, b) => b - a);

    const weeks = [...new Set(sorted.map((d) => getWeekNumber(d)))].sort((a, b) => b - a);

    if (weeks.length === 0) return 0;

    const currentWeek = getWeekNumber(new Date());
    const lastWeek = getWeekNumber(new Date(Date.now() - 7 * 86400000));

    if (weeks[0] !== currentWeek && weeks[0] !== lastWeek) return 0;

    let streak = 1;
    for (let i = 0; i < weeks.length - 1; i++) {
        if (weeks[i] - weeks[i + 1] === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

export const calculateAverageAdherence = (checkIns, field) => {
    if (!checkIns || checkIns.length === 0) return 0;

    const values = checkIns
        .map((ci) => ADHERENCE_MAP[ci[field]])
        .filter((v) => v !== undefined);

    if (values.length === 0) return 0;

    return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
};

export const calculateAverage = (checkIns, field) => {
    if (!checkIns || checkIns.length === 0) return 0;

    const values = checkIns
        .map((ci) => Number(ci[field]))
        .filter((v) => !isNaN(v) && v !== null);

    if (values.length === 0) return 0;

    return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10;
};

export const buildChartData = (checkIns) => {
    if (!checkIns || checkIns.length === 0) return [];

    return [...checkIns]
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((ci) => {
            const date = new Date(ci.created_at);
            return {
                date: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
                hunger: ci.hunger_level !== null ? Number(ci.hunger_level) : null,
                rest: ci.rest_quality !== null ? Number(ci.rest_quality) : null,
                diet: ADHERENCE_MAP[ci.diet_adherence] ?? null,
                training: ADHERENCE_MAP[ci.training_adherence] ?? null,
            };
        });
};

export const generateInsights = (checkIns) => {
    if (!checkIns || checkIns.length < 2) return [];

    const sorted = [...checkIns].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    const insights = [];

    const recent = sorted.slice(-4);
    const avgRestRecent = calculateAverage(recent, 'rest_quality');
    const avgHungerRecent = calculateAverage(recent, 'hunger_level');

    if (sorted.length >= 8) {
        const previous = sorted.slice(-8, -4);
        const avgRestPrev = calculateAverage(previous, 'rest_quality');
        const restDiff = avgRestRecent - avgRestPrev;

        if (restDiff > 0.5) {
            insights.push({
                type: 'positive',
                text: `Tu descanso ha mejorado un ${Math.abs(restDiff).toFixed(1)} punto${restDiff > 1 ? 's' : ''} respecto a las 4 semanas anteriores.`,
            });
        } else if (restDiff < -0.5) {
            insights.push({
                type: 'warning',
                text: `Tu descanso ha empeorado ${Math.abs(restDiff).toFixed(1)} punto${restDiff < -1 ? 's' : ''} respecto a las 4 semanas anteriores.`,
            });
        }

        const avgHungerPrev = calculateAverage(previous, 'hunger_level');
        const hungerDiff = avgHungerRecent - avgHungerPrev;

        if (hungerDiff < -0.5) {
            insights.push({
                type: 'positive',
                text: `Estás pasando menos hambre que antes (${Math.abs(hungerDiff).toFixed(1)} punto${hungerDiff < -1 ? 's' : ''} menos).`,
            });
        } else if (hungerDiff > 0.5) {
            insights.push({
                type: 'warning',
                text: `Estás pasando más hambre que antes (${Math.abs(hungerDiff).toFixed(1)} punto${hungerDiff > 1 ? 's' : ''} más).`,
            });
        }
    }

    const dietTotal = calculateAverageAdherence(sorted, 'diet_adherence');
    const trainingTotal = calculateAverageAdherence(sorted, 'training_adherence');

    if (dietTotal >= 80) {
        insights.push({
            type: 'positive',
            text: `Tu adherencia a la dieta es excelente (${dietTotal}% de media).`,
        });
    } else if (dietTotal >= 50) {
        insights.push({
            type: 'neutral',
            text: `Tu adherencia media a la dieta es del ${dietTotal}%.`,
        });
    } else if (sorted.length >= 3) {
        insights.push({
            type: 'warning',
            text: `Tu adherencia a la dieta es baja (${dietTotal}%). Intenta seguir el plan más de cerca.`,
        });
    }

    if (trainingTotal >= 80) {
        insights.push({
            type: 'positive',
            text: `Tu adherencia al entrenamiento es excelente (${trainingTotal}% de media).`,
        });
    } else if (trainingTotal >= 50) {
        insights.push({
            type: 'neutral',
            text: `Tu adherencia media al entrenamiento es del ${trainingTotal}%.`,
        });
    } else if (sorted.length >= 3) {
        insights.push({
            type: 'warning',
            text: `Tu adherencia al entrenamiento es baja (${trainingTotal}%).`,
        });
    }

    const bestWeek = sorted.reduce(
        (best, ci) => {
            const score =
                (ADHERENCE_MAP[ci.diet_adherence] || 0) +
                (ADHERENCE_MAP[ci.training_adherence] || 0) +
                (ci.rest_quality || 0) * 10 -
                (ci.hunger_level || 0) * 5;

            return score > best.score ? { ci, score } : best;
        },
        { ci: null, score: -Infinity }
    );

    if (bestWeek.ci && sorted.length >= 3) {
        const date = new Date(bestWeek.ci.created_at);
        insights.push({
            type: 'positive',
            text: `Tu mejor semana fue la del ${date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })}.`,
        });
    }

    return insights.slice(0, 4);
};
