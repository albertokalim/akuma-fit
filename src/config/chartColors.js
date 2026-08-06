// Colores compartidos para graficos (Recharts no puede leer var(--...) directamente
// en todos los props, por eso se centralizan aqui en vez de duplicarse por vista).
// Mantener sincronizado con src/styles/tokens.css
export const CHART_COLORS = {
    primary: '#a78bfa',   // --color-primary
    success: '#4ade80',   // --color-success
    info: '#60a5fa',
    warning: '#fbbf24',   // --color-warning
    error: '#f87171',     // --color-error
};
