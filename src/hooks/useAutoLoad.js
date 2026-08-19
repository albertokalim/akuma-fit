import { useEffect } from 'react';

 
export const useAutoLoad = (loadFn) => {
    useEffect(() => {
        loadFn();
    }, [loadFn]);

    return { reload: loadFn };
};
