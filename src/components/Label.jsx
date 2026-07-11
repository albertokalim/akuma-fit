function Label({ text, htmlFor, className }) {
    return <label htmlFor={htmlFor} className={className}>
        {text || 'Label'}
    </label>
}

export default Label;