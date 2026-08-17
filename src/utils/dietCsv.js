export const CSV_COLUMNS = ['name', 'brand', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'serving_size'];

const NUMERIC_COLUMNS = ['calories', 'protein', 'carbs', 'fat', 'fiber'];

export const CSV_HEADER = CSV_COLUMNS.join(',');

export const CSV_EXAMPLE = `${CSV_HEADER}
Pechuga de pollo,,165,31,0,3.6,0,100 g
Arroz blanco cocido,,130,2.7,28,0.3,0.4,100 g
"Yogur griego","Marca X",97,9,3.9,5,0,"1 tarrina (125 g)"`;

/**
 * Divide una línea CSV respetando campos entrecomillados (con comillas
 * dobles escapadas estilo RFC 4180).
 */
function splitCsvLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current);
    return values;
}

/**
 * Convierte el texto de un CSV en filas de alimentos listas para
 * foodService.createBulk. Devuelve { rows, errors }: si hay errores, la
 * vista debe mostrarlos y no importar nada.
 */
export function parseFoodCsv(text) {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

    if (lines.length === 0) {
        return { rows: [], errors: ['El CSV está vacío.'] };
    }

    const header = splitCsvLine(lines[0]).map(column => column.trim().toLowerCase());

    if (!header.includes('name')) {
        return { rows: [], errors: ['El CSV debe incluir una cabecera con al menos la columna "name" (nombre).'] };
    }

    const rows = [];
    const errors = [];

    for (let i = 1; i < lines.length; i += 1) {
        const values = splitCsvLine(lines[i]);
        const row = {};

        header.forEach((column, index) => {
            row[column] = values[index]?.trim() ?? '';
        });

        if (!row.name) {
            errors.push(`Línea ${i + 1}: falta el nombre.`);
            continue;
        }

        let hasError = false;

        for (const column of NUMERIC_COLUMNS) {
            const rawValue = row[column];

            if (rawValue === '' || rawValue === undefined) {
                row[column] = null;
                continue;
            }

            const numericValue = Number(String(rawValue).replace(',', '.'));

            if (Number.isNaN(numericValue)) {
                errors.push(`Línea ${i + 1}: la columna "${column}" no tiene un número válido ("${rawValue}").`);
                hasError = true;
            } else {
                row[column] = numericValue;
            }
        }

        if (!hasError) {
            rows.push({
                name: row.name,
                brand: row.brand || null,
                calories: row.calories ?? null,
                protein: row.protein ?? null,
                carbs: row.carbs ?? null,
                fat: row.fat ?? null,
                fiber: row.fiber ?? null,
                serving_size: row.serving_size || null,
            });
        }
    }

    return { rows, errors };
}
