/**
 * Normaliza campos numéricos en un objeto de datos
 * Convierte valores a números o null si están vacíos
 * 
 * @param {Object} data - Objeto con los datos
 * @param {string[]} numericFields - Array con los nombres de los campos numéricos
 * @returns {Object} - Objeto con los campos numéricos normalizados
 */
export const normalizeNumericFields = (data, numericFields) => {
    const result = { ...data };
    numericFields.forEach(field => {
        result[field] = result[field] ? Number(result[field]) : null;
    });
    return result;
};

/**
 * Formatea una fecha a formato locale español
 * 
 * @param {string} dateString - String de fecha ISO
 * @param {Object} options - Opciones de formato para toLocaleDateString
 * @returns {string} - Fecha formateada
 */
export const formatDate = (dateString, options = {}) => {
    const defaultOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options
    };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', defaultOptions);
};

/**
 * Filtra mediciones por rango de fechas
 * 
 * @param {Array} measurements - Array de mediciones
 * @param {string} startDate - Fecha de inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha de fin (YYYY-MM-DD)
 * @returns {Array} - Mediciones filtradas
 */
export const filterByDateRange = (measurements, startDate, endDate) => {
    return measurements.filter(m => {
        const measurementDate = new Date(m.created_at);

        if (startDate) {
            const start = new Date(startDate);
            if (measurementDate < start) return false;
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (measurementDate > end) return false;
        }

        return true;
    });
};
