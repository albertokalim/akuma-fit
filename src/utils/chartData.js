import { formatDate, filterByDateRange } from './data.js';

export const calculateDelta = (measurements, field) => {
    if (!measurements || measurements.length < 2) return null;
    
    const first = measurements.find(m => m[field] !== null && m[field] !== undefined);
    const last = [...measurements].reverse().find(m => m[field] !== null && m[field] !== undefined);
    
    if (!first || !last || first.id === last.id) return null;
    
    const delta = Number(last[field]) - Number(first[field]);
    return Math.round(delta * 10) / 10;
};

export const calculateVelocity = (measurements, field) => {
    if (!measurements || measurements.length < 2) return null;
    
    const sorted = [...measurements].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    const first = sorted.find(m => m[field] !== null && m[field] !== undefined);
    const last = [...sorted].reverse().find(m => m[field] !== null && m[field] !== undefined);
    
    if (!first || !last || first.id === last.id) return null;
    
    const delta = Number(last[field]) - Number(first[field]);
    const daysDiff = (new Date(last.created_at) - new Date(first.created_at)) / (1000 * 60 * 60 * 24);
    
    if (daysDiff === 0) return null;
    
    const velocityPerWeek = (delta / daysDiff) * 7;
    return Math.round(velocityPerWeek * 100) / 100;
};

export const getCurrentValue = (measurements, field) => {
    if (!measurements || measurements.length === 0) return null;
    const last = [...measurements].reverse().find(m => m[field] !== null && m[field] !== undefined);
    return last ? last[field] : null;
};

/**
 * Construye datos para gráficos a partir de mediciones
 * 
 * @param {Array} measurements - Array de mediciones
 * @param {Array} options - Array de opciones de medición { key, label, color }
 * @param {string} startDate - Fecha de inicio (opcional)
 * @param {string} endDate - Fecha de fin (opcional)
 * @returns {Array} - Datos formateados para el gráfico
 */
export const buildChartData = (measurements, options, startDate = null, endDate = null) => {
    const filtered = startDate || endDate 
        ? filterByDateRange(measurements, startDate, endDate)
        : measurements;

    return filtered.map(m => {
        const point = { date: formatDate(m.created_at, { year: undefined }) };
        options.forEach(opt => {
            if (m[opt.key] !== null && m[opt.key] !== undefined) {
                point[opt.key] = Number(m[opt.key]);
            }
        });
        return point;
    });
};

/**
 * Construye configuración de líneas activas para gráficos
 * 
 * @param {Array} allOptions - Todas las opciones disponibles
 * @param {Array} selectedKeys - Keys seleccionadas
 * @returns {Array} - Configuración de líneas activas
 */
export const buildActiveLines = (allOptions, selectedKeys) => {
    return allOptions
        .filter(opt => selectedKeys.includes(opt.key))
        .map(opt => ({
            dataKey: opt.key,
            name: opt.label,
            color: opt.color,
        }));
};
