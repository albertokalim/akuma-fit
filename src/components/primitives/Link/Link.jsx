import React from 'react';

function Link({ text, onClick, href = '#', className }) {
    return (
        <a
            href={href}
            className={className}
            onClick={onClick}
        >
            {text}
        </a>
    );
}

export default Link;
