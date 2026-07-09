
function TextInput({ type, placeholder, onChange }){
    return <input
        type={type}
        placeholder={placeholder || 'TextInput'}
        onChange={onChange}
    />
}

export default TextInput;