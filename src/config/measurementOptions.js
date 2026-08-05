/**
 * Opciones de medidas corporales compartidas entre las vistas de progreso
 * (cliente) y reportes (coach), para evitar tener el mismo array duplicado
 * en ambos archivos con el riesgo de que diverjan.
 */
export const MEASUREMENT_OPTIONS = [
    { key: 'weight', label: 'Peso (kg)', color: '#a78bfa' },
    { key: 'chest', label: 'Pecho (cm)', color: '#4ade80' },
    { key: 'waist', label: 'Cintura (cm)', color: '#f87171' },
    { key: 'hip', label: 'Cadera (cm)', color: '#60a5fa' },
];
