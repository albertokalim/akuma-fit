const VARIANT_CLASS = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
};

const SIZE_CLASS = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
};

 
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
