import { formatDate, filterByDateRange } from './data.js';

/**
 * Calcula la diferencia entre el primer y el último valor no nulo de un
 * campo en una serie de mediciones (en el orden en que llegan).
 *
 * @param {Array<Object>} measurements - Lista de mediciones.
 * @param {string} field - Campo numérico sobre el que calcular el delta.
 * @returns {number|null} Delta redondeado a 1 decimal, o `null` si no hay
 *   al menos dos mediciones con valor.
 */
export const calculateDelta = (measurements, field) => {
    if (!measurements || measurements.length < 2) return null;
    
    const first = measurements.find(m => m[field] !== null && m[field] !== undefined);
    const last = [...measurements].reverse().find(m => m[field] !== null && m[field] !== undefined);
    
    if (!first || !last || first.id === last.id) return null;
    
    const delta = Number(last[field]) - Number(first[field]);
    return Math.round(delta * 10) / 10;
};

/**
 * Calcula la velocidad de cambio semanal de un campo entre la primera y la
 * última medición (ordenadas por fecha), expresada como variación por semana.
 *
 * @param {Array<Object>} measurements - Lista de mediciones.
 * @param {string} field - Campo numérico sobre el que calcular la velocidad.
 * @returns {number|null} Variación por semana redondeada a 2 decimales, o
 *   `null` si no se puede calcular.
 */
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

/**
 * Devuelve el último valor no nulo de un campo en una serie de mediciones.
 *
 * @param {Array<Object>} measurements - Lista de mediciones.
 * @param {string} field - Campo cuyo valor se quiere obtener.
 * @returns {*} Último valor no nulo del campo, o `null` si no existe.
 */
export const getCurrentValue = (measurements, field) => {
    if (!measurements || measurements.length === 0) return null;
    const last = [...measurements].reverse().find(m => m[field] !== null && m[field] !== undefined);
    return last ? last[field] : null;
};

/**
 * Construye los puntos de datos para un gráfico a partir de una lista de
 * mediciones, opcionalmente filtradas por rango de fechas. Cada punto incluye
 * la fecha formateada y las claves indicadas en `options`.
 *
 * @param {Array<Object>} measurements - Lista de mediciones.
 * @param {Array<{key: string}>} options - Campos a incluir en cada punto.
 * @param {string|null} [startDate] - Fecha de inicio (YYYY-MM-DD).
 * @param {string|null} [endDate] - Fecha de fin (YYYY-MM-DD).
 * @returns {Array<Object>} Puntos de datos con `date` y los campos solicitados.
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
 * Filtra las opciones de gráfico que están seleccionadas y las transforma en
 * la forma que espera Recharts para pintar líneas (`dataKey`, `name`, `color`).
 *
 * @param {Array<{key: string, label: string, color: string}>} allOptions - Todas las opciones disponibles.
 * @param {string[]} selectedKeys - Claves de las opciones seleccionadas.
 * @returns {Array<{dataKey: string, name: string, color: string}>} Líneas a pintar.
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
