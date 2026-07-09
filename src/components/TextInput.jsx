
function TextInput({ id, type, placeholder, onChange }){
    return <input
        id={id}
        type={type}
        placeholder={placeholder || 'TextInput'}
        onChange={onChange}
    />
}

export default TextInput;