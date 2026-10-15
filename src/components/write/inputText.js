import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import useTheme from '../../store/useTheme';
import EntryAttachments from '../entryAttachments';

const InputText = ({ placeholderText, fixedTitle, title, onChangeTitle, blocks = [], onTextBlockChange, onAttachmentReviewed, onRemoveAttachment }) => {
    const { colors, fSize, spacing } = useTheme();
    const [localTitle, setLocalTitle] = useState(fixedTitle ?? '');
    const [blockLineCounts, setBlockLineCounts] = useState({});
    const lineHeight = fSize.body * 1.5;
    return (
        <View style={{ paddingHorizontal: spacing.lg, flex: 1 }}>
            <TextInput
                placeholder="Title"
                placeholderTextColor={colors.mutedForeground}
                value={title ?? localTitle}
                onChangeText={onChangeTitle ?? setLocalTitle}
                style={{ fontFamily: 'Fraunces_400Regular', fontSize: fSize.cardTitle, color: colors.foreground }}
            />
            <View style={{ height: 1, width: '100%', backgroundColor: colors.divider }} />
            <View style={{ flexGrow: 1 }}>
                {blocks.map((block, index) => {
                    if (block.type !== 'text') {
                        return <EntryAttachments key={block.id || block.uri} attachments={[block]} onAttachmentReviewed={onAttachmentReviewed} onRemoveAttachment={onRemoveAttachment} />;
                    }

                    const isLastTextBlock = !blocks.slice(index + 1).some((nextBlock) => nextBlock.type === 'text');
                    return (
                        <TextInput
                            key={block.id}
                            placeholder={isLastTextBlock ? placeholderText : undefined}
                            placeholderTextColor={colors.mutedForeground}
                            value={block.value}
                            onChangeText={(value) => onTextBlockChange(block.id, value)}
                            onContentSizeChange={({ nativeEvent }) => {
                                const lineCount = Math.max(2, Math.ceil((nativeEvent.contentSize.height - spacing.xs) / lineHeight));
                                setBlockLineCounts((current) => current[block.id] === lineCount
                                    ? current
                                    : { ...current, [block.id]: lineCount });
                            }}
                            multiline
                            scrollEnabled={false}
                            textAlignVertical="top"
                            style={{
                                fontFamily: 'Fraunces_400Regular',
                                fontSize: fSize.body,
                                lineHeight,
                                color: colors.foreground,
                                minHeight: 56,
                                height: blockLineCounts[block.id]
                                    ? Math.max(56, blockLineCounts[block.id] * lineHeight + spacing.xs)
                                    : undefined,
                                flexGrow: isLastTextBlock ? 1 : 0,
                                paddingBottom: spacing.xs,
                                verticalAlign: 'top',
                            }}
                        />
                    );
                })}
            </View>
        </View>
    );
};

export default InputText;
