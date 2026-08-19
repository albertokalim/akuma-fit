/**
 * Normaliza los campos numéricos de un objeto: convierte cada valor a número
 * o a `null` cuando está vacío (cadena vacía, `undefined` o `null`).
 *
 * @param {Object} data - Objeto con los datos a normalizar.
 * @param {string[]} numericFields - Nombres de los campos a tratar como numéricos.
 * @returns {Object} Copia del objeto con los campos numéricos normalizados.
 */
export const normalizeNumericFields = (data, numericFields) => {
    const result = { ...data };
    numericFields.forEach(field => {
        result[field] = result[field] ? Number(result[field]) : null;
    });
    return result;
};

/**
 * Formatea una fecha ISO al formato local español (es-ES), por defecto
 * `dd/mm/yyyy`.
 *
 * @param {string} dateString - Fecha en formato ISO.
 * @param {Object} [options] - Opciones extra para `Date.prototype.toLocaleDateString`.
 * @returns {string} Fecha formateada en español.
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
 * Filtra una lista de mediciones por rango de fechas sobre el campo
 * `created_at`. El límite superior es inclusivo (hasta las 23:59:59.999
 * del día indicado).
 *
 * @param {Array<{created_at: string}>} measurements - Mediciones a filtrar.
 * @param {string|null} startDate - Fecha de inicio (YYYY-MM-DD) o `null`.
 * @param {string|null} endDate - Fecha de fin (YYYY-MM-DD) o `null`.
 * @returns {Array} Mediciones cuya fecha cae dentro del rango.
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
