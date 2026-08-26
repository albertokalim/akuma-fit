/** Mapa de variantes del botón a sus clases CSS. */
const VARIANT_CLASS = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
};

/** Mapa de tamaños del botón a sus clases CSS. */
const SIZE_CLASS = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
};

 
/**
 * Botón reutilizable. Compone las clases CSS existentes
 * (btn-primary/btn-secondary/btn-outline + btn-sm/btn-lg) en lugar de repetir
 * combinaciones de className en cada vista.
 *
 * @param {Object} props - Props del componente.
 * @param {'primary'|'secondary'|'outline'} [props.variant='primary'] - Variante visual.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Tamaño del botón.
 * @param {string} [props.className] - Clases extra.
 */
function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }) {
    const classes = [VARIANT_CLASS[variant] ?? VARIANT_CLASS.primary, SIZE_CLASS[size], className]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classes} {...rest}>
            {children}
        </button>
    );
}

export default Button;
