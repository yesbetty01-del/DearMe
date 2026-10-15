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

    const removeAttachment = useCallback((uri) => {
        setBlocks((current) => current.filter((block) => block.type === 'text' || block.uri !== uri));
    }, []);

    const markAttachmentReviewed = useCallback((uri) => {
        setBlocks((current) => current.map((block) => block.type === 'audio' && block.uri === uri ? { ...block, reviewed: true } : block));
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
    };
};

export default useWritingContent;
