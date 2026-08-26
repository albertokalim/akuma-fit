

/**
 * Lista de eventos con texto y hora.
 *
 * @param {Object} props - Props del componente.
 * @param {string} props.title - Título de la lista.
 * @param {Array<{text: string, time: string}>} props.items - Eventos a listar.
 */
function EventList({ title, items }) {
    return (
        <div className="event-list">
            <h3 className="event-list-title">{title}</h3>
            <ul className="event-items">
                {items.map((item, index) => (
                    <li key={index} className="event-item">
                        <div className="event-content">
                            <p className="event-text">{item.text}</p>
                            <span className="event-time">{item.time}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EventList;
