 
/**
 * Selector desplegable de clientes.
 *
 * @param {Object} props - Props del componente.
 * @param {Array<Object>} props.clients - Lista de clientes.
 * @param {string|number} [props.selectedClientId] - Cliente seleccionado.
 * @param {(clientId: string) => void} props.onChange - Callback de cambio.
 * @param {string} [props.className] - Clases extra.
 */
function ClientSelector({ clients, selectedClientId, onChange, className = '' }) {
    return (
        <div className={className}>
            <label htmlFor="client-select">Selecciona un cliente:</label>
            <select
                id="client-select"
                value={selectedClientId || ''}
                onChange={(e) => onChange(e.target.value)}
            >
                {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                        {client.name ? `${client.name} ${client.surname || ''}` : client.user_id}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default ClientSelector;
