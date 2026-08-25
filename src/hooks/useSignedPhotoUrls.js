import { useState, useEffect } from 'react';
import { photoService } from '../services/photoService.js';

/**
 * Obtiene URLs firmadas para una lista de rutas de almacenamiento de fotos y
 * expone el mapa de URLs por ruta junto con el estado de carga. Vuelve a
 * consultar cuando cambia el contenido de `storagePaths`.
 *
 * @param {string[]} storagePaths - Rutas de almacenamiento de las fotos.
 * @returns {{urls: Object<string, string>, loading: boolean}} Mapa de URLs y estado de carga.
 */
export const useSignedPhotoUrls = (storagePaths) => {
    const [urls, setUrls] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchUrls = async () => {
            if (!storagePaths || storagePaths.length === 0) {
                setUrls({});
                return;
            }

            setLoading(true);
            try {
                const urlMap = await photoService.getSignedUrls(storagePaths.filter(Boolean));
                if (active) setUrls(urlMap);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchUrls();

        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(storagePaths)]);

    return { urls, loading };
};
