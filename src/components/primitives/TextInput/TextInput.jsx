function TextInput({ id, type, step, placeholder, value, onChange, hasError, className }){
    const inputClass = hasError ? `${className} input-error` : className;

    return <input
        id={id}
        type={type}
        step={step}
        placeholder={placeholder || 'TextInput'}
        value={value}
        onChange={onChange}
        className={inputClass}
    />
}

export default TextInput;