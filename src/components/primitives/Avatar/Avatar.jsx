import './Avatar.css';

function Avatar({ src, alt, size = 'medium' }) {
    return (
        <img
            src={src}
            alt={alt}
            className={`avatar avatar-${size}`}
        />
    );
}

export default Avatar;
