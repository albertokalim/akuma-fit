import { useState } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { foodService } from '../../services/foodService.js';
import { parseFoodCsv, CSV_HEADER, CSV_EXAMPLE } from '../../utils/dietCsv.js';

const EMPTY_ROW = {
    name: '',
    brand: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    serving_size: '',
};

const GRID_COLUMNS = [
    { key: 'name', label: 'Nombre *' },
    { key: 'brand', label: 'Marca' },
    { key: 'calories', label: 'Kcal' },
    { key: 'protein', label: 'Prot' },
    { key: 'carbs', label: 'Carbs' },
    { key: 'fat', label: 'Grasa' },
    { key: 'fiber', label: 'Fibra' },
    { key: 'serving_size', label: 'Ración' },
];

function toNumeric(value) {
    if (value === '' || value === null || value === undefined) return null;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
}

/**
 * Importación masiva de alimentos con dos modalidades:
 *  - Grid: mini-hoja de cálculo para teclear varias filas a mano.
 *  - CSV: pegar el contenido de un CSV (cabecera + filas) y validarlo.
 */
function FoodBulkImport({ onClose, onSaved }) {
    const [tab, setTab] = useState('grid');
    const [rows, setRows] = useState([{ ...EMPTY_ROW }, { ...EMPTY_ROW }, { ...EMPTY_ROW }]);
    const [csvText, setCsvText] = useState('');
    const [csvErrors, setCsvErrors] = useState([]);
    const [csvPreview, setCsvPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const handleCellChange = (rowIndex, key, value) => {
        setRows(prev => prev.map((row, index) => (
            index === rowIndex ? { ...row, [key]: value } : row
        )));
    };

    const addRow = () => {
        setRows(prev => [...prev, { ...EMPTY_ROW }]);
    };

    const removeRow = (rowIndex) => {
        setRows(prev => prev.filter((_, index) => index !== rowIndex));
    };

    const validGridRows = rows.filter(row => row.name.trim() !== '');

    const handleImportGrid = async () => {
        if (validGridRows.length === 0) return;

        setSubmitting(true);
        setSubmitError(null);

        try {
            await foodService.createBulk(validGridRows.map(row => ({
                name: row.name.trim(),
                brand: row.brand.trim() || null,
                calories: toNumeric(row.calories),
                protein: toNumeric(row.protein),
                carbs: toNumeric(row.carbs),
                fat: toNumeric(row.fat),
                fiber: toNumeric(row.fiber),
                serving_size: row.serving_size.trim() || null,
            })));
            onSaved();
        } catch (err) {
            setSubmitError(err.message);
            setSubmitting(false);
        }
    };

    const handleParseCsv = () => {
        const { rows: parsedRows, errors } = parseFoodCsv(csvText);
        setCsvErrors(errors);
        setCsvPreview(errors.length === 0 ? parsedRows : null);
    };

    const handleImportCsv = async () => {
        if (!csvPreview || csvPreview.length === 0) return;

        setSubmitting(true);
        setSubmitError(null);

        try {
            await foodService.createBulk(csvPreview);
            onSaved();
        } catch (err) {
            setSubmitError(err.message);
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content diet-modal diet-modal-wide"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 className="modal-title">Importar alimentos</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="reports-tabs">
                    <button
                        className={`tab-button ${tab === 'grid' ? 'active' : ''}`}
                        onClick={() => setTab('grid')}
                    >
                        Grid
                    </button>
                    <button
                        className={`tab-button ${tab === 'csv' ? 'active' : ''}`}
                        onClick={() => setTab('csv')}
                    >
                        CSV
                    </button>
                </div>

                <div className="modal-body">
                    {tab === 'grid' ? (
                        <>
                            <p className="section-help">
                                Macros por 100 g. Sólo se importan las filas con nombre.
                            </p>
                            <div className="diet-bulk-grid-wrapper">
                                <table className="diet-bulk-grid">
                                    <thead>
                                        <tr>
                                            {GRID_COLUMNS.map(column => (
                                                <th key={column.key}>{column.label}</th>
                                            ))}
                                            <th />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {GRID_COLUMNS.map(column => (
                                                    <td key={column.key}>
                                                        <input
                                                            type={column.key === 'name' || column.key === 'brand' || column.key === 'serving_size' ? 'text' : 'number'}
                                                            min="0"
                                                            step="0.1"
                                                            value={row[column.key]}
                                                            onChange={(event) => handleCellChange(rowIndex, column.key, event.target.value)}
                                                            className="diet-bulk-input"
                                                        />
                                                    </td>
                                                ))}
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn-icon btn-icon-danger"
                                                        onClick={() => removeRow(rowIndex)}
                                                        title="Eliminar fila"
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button type="button" className="btn-outline" onClick={addRow}>
                                <FiPlus size={14} />
                                <span>Añadir fila</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="section-help">
                                Pega el contenido de un CSV. Cabecera esperada:
                            </p>
                            <code className="diet-csv-header">{CSV_HEADER}</code>
                            <textarea
                                className="diet-csv-textarea"
                                rows={8}
                                value={csvText}
                                onChange={(event) => {
                                    setCsvText(event.target.value);
                                    setCsvErrors([]);
                                    setCsvPreview(null);
                                }}
                                placeholder={CSV_EXAMPLE}
                            />
                            <button
                                type="button"
                                className="btn-outline"
                                onClick={handleParseCsv}
                                disabled={!csvText.trim()}
                            >
                                Validar CSV
                            </button>

                            {csvErrors.length > 0 && (
                                <div className="diet-csv-errors">
                                    {csvErrors.map((error, index) => (
                                        <p key={index}>{error}</p>
                                    ))}
                                </div>
                            )}

                            {csvPreview && (
                                <div className="success-message">
                                    {csvPreview.length} alimentos listos para importar.
                                </div>
                            )}
                        </>
                    )}

                    {submitError && <div className="error-message">{submitError}</div>}
                </div>

                <div className="diet-modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={submitting}>
                        Cancelar
                    </button>
                    {tab === 'grid' ? (
                        <button
                            className="btn-primary"
                            onClick={handleImportGrid}
                            disabled={validGridRows.length === 0 || submitting}
                        >
                            {submitting
                                ? 'Importando...'
                                : `Importar ${validGridRows.length} ${validGridRows.length === 1 ? 'alimento' : 'alimentos'}`}
                        </button>
                    ) : (
                        <button
                            className="btn-primary"
                            onClick={handleImportCsv}
                            disabled={!csvPreview || csvPreview.length === 0 || submitting}
                        >
                            {submitting
                                ? 'Importando...'
                                : `Importar ${csvPreview?.length || 0} ${csvPreview?.length === 1 ? 'alimento' : 'alimentos'}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FoodBulkImport;
