function TextInput({ id, type, placeholder, onChange, hasError, className }){
    const inputClass = hasError ? `${className} input-error` : className;

    return <input
        id={id}
        type={type}
        placeholder={placeholder || 'TextInput'}
        onChange={onChange}
        className={inputClass}
    />
}

export default TextInput;