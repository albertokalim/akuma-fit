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
