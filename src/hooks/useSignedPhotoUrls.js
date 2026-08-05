import { useState, useEffect } from 'react';
import { photoService } from '../services/photoService.js';

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
                const urlMap = {};
                await Promise.all(
                    storagePaths.map(async (path) => {
                        if (path) {
                            try {
                                urlMap[path] = await photoService.getSignedUrl(path);
                            } catch {
                                urlMap[path] = null;
                            }
                        }
                    })
                );
                if (active) setUrls(urlMap);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchUrls();

        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- se recalcula por contenido, no por referencia
    }, [JSON.stringify(storagePaths)]);

    return { urls, loading };
};
