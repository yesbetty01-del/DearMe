import { useEffect, useState } from 'react';
import { getStoredAttachmentUrl } from '../utils/attachmentStorage';

const useAttachmentUri = (attachment) => {
    const [storedUri, setStoredUri] = useState(null);
    const storageId = attachment?.storageId;

    useEffect(() => {
        let active = true;
        setStoredUri(null);
        if (!storageId || attachment?.uri) return () => { active = false; };

        getStoredAttachmentUrl(storageId)
            .then((uri) => {
                if (active) setStoredUri(uri);
            })
            .catch(() => {
                if (active) setStoredUri(null);
            });

        return () => { active = false; };
    }, [attachment?.uri, storageId]);

    return attachment?.uri || storedUri;
};

export default useAttachmentUri;
