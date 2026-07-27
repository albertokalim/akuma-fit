import { formatDate, filterByDateRange } from './data.js';

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
