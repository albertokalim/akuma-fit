function Label({ text, htmlFor }) {
    return <label htmlFor={htmlFor} >
        {text || 'Label'}
    </label>
}

export default Label;