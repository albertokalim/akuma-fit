

/**
 * Tabla de datos genérica con columnas configurables. Cada columna puede
 * definir `render(value, row)` para personalizar la celda.
 *
 * @param {Object} props - Props del componente.
 * @param {Array<{key: string, label: string, width?: string, render?: Function}>} props.columns - Columnas.
 * @param {Array<Object>} props.data - Filas de datos.
 * @param {string} [props.emptyMessage='No hay datos disponibles'] - Mensaje cuando no hay datos.
 */
function DataTable({ columns, data, emptyMessage = 'No hay datos disponibles' }) {
    if (!data || data.length === 0) {
        return (
            <div className="data-table-empty">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="data-table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                style={col.width ? { width: col.width } : undefined}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={row.id || rowIndex}>
                            {columns.map((col) => (
                                <td key={col.key}>
                                    {col.render
                                        ? col.render(row[col.key], row)
                                        : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;