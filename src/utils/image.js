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
                        resolve(new File([blob], file.name, { type: file.type }));
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
