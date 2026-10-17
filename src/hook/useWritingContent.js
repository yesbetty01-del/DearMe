import { useCallback, useMemo, useState } from 'react';

const createTextBlock = () => ({
    id: `text-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type: 'text',
    value: '',
});

const useWritingContent = (initialBlocks) => {
    const [blocks, setBlocks] = useState(() => initialBlocks?.length
        ? initialBlocks.map((block) => ({ ...block, id: block.id || createTextBlock().id }))
        : [createTextBlock()]);

    const content = useMemo(() => blocks
        .filter((block) => block.type === 'text' && block.value.trim())
        .map((block) => block.value)
        .join('\n\n')
        .trim(), [blocks]);
    const attachments = useMemo(() => blocks.filter((block) => block.type !== 'text'), [blocks]);
    const contentBlocks = useMemo(() => blocks.filter((block) => block.type !== 'text' || block.value.trim()), [blocks]);
    const hasWritingContent = Boolean(content || attachments.length);

    const updateTextBlock = useCallback((id, value) => {
        setBlocks((current) => current.map((block) => block.id === id ? { ...block, value } : block));
    }, []);

    const addAttachments = useCallback((newAttachments) => {
        if (!newAttachments?.length) return;
        setBlocks((current) => {
            const withoutTrailingEmpty = current.filter((block, index) => !(index === current.length - 1 && block.type === 'text' && !block.value));
            const identifiedAttachments = newAttachments.map((attachment) => ({
                ...attachment,
                id: attachment.id || `${attachment.type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            }));
            return [...withoutTrailingEmpty, ...identifiedAttachments, createTextBlock()];
        });
    }, []);

    const removeAttachment = useCallback((attachmentId) => {
        setBlocks((current) => current.filter((block) => block.type === 'text' || (
            block.id !== attachmentId && block.uri !== attachmentId && block.storageId !== attachmentId
        )));
    }, []);

    const markAttachmentReviewed = useCallback((attachmentId) => {
        setBlocks((current) => current.map((block) => block.type === 'audio' && (
            block.id === attachmentId || block.uri === attachmentId || block.storageId === attachmentId
        ) ? { ...block, reviewed: true } : block));
    }, []);

    const setAttachmentStorageId = useCallback((attachmentId, storageId) => {
        setBlocks((current) => current.map((block) => block.id === attachmentId
            ? { ...block, storageId }
            : block));
    }, []);

    return {
        blocks,
        content,
        contentBlocks,
        attachments,
        hasWritingContent,
        updateTextBlock,
        addAttachments,
        removeAttachment,
        markAttachmentReviewed,
        setAttachmentStorageId,
    };
};

export default useWritingContent;
