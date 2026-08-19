/**
 * Convierte un tipo MIME de imagen a su extensión de archivo. Si el MIME no
 * está soportado, devuelve `png` por defecto.
 *
 * @param {string} mime - Tipo MIME (p. ej. `image/jpeg`).
 * @returns {string} Extensión del archivo (sin punto).
 */
export const mimeToExtension = (mime) => {
    const map = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
    return map[mime] || 'png';
};

/**
 * Redimensiona una imagen a un tamaño máximo (por el lado más largo),
 * manteniendo la proporción, mediante un canvas. Devuelve un nuevo `File`
 * redimensionado con el mismo nombre y tipo.
 *
 * @param {File} file - Archivo de imagen original.
 * @param {number} [maxSize=200] - Tamaño máximo en píxeles del lado más largo.
 * @returns {Promise<File>} Imagen redimensionada.
 */
export const resizeImage = (file, maxSize = 200) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxSize) {
                    height = Math.round((height * maxSize) / width);
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(new File([blob], file.name, { type: blob.type }));
                    } else {
                        reject(new Error('Error al redimensionar la imagen'));
                    }
                },
                file.type,
                0.9
            );
            
            URL.revokeObjectURL(img.src);
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error('Error al cargar la imagen'));
        };
        
        img.src = URL.createObjectURL(file);
    });
};
