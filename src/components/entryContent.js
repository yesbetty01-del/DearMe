import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import useTheme from '../store/useTheme';
import EntryAttachments from './entryAttachments';

const EntryContent = ({ content, contentBlocks, attachments = [], textStyle }) => {
    const { colors, fSize, spacing } = useTheme();
    const textStyles = {
        fontFamily: 'Fraunces_400Regular',
        fontSize: fSize.body,
        lineHeight: fSize.body * 1.5,
        color: colors.foreground,
        marginVertical: spacing.sm,
        ...StyleSheet.flatten(textStyle),
    };

    if (contentBlocks?.length) {
        return (
            <View>
                {contentBlocks.map((block) => block.type === 'text' ? (
                    block.value ? <Text key={block.id} style={textStyles}>{block.value}</Text> : null
                ) : (
                    <EntryAttachments key={block.id || block.storageId || block.uri} attachments={[block]} />
                ))}
            </View>
        );
    }

    return (
        <View>
            {!!content && <Text style={textStyles}>{content}</Text>}
            <EntryAttachments attachments={attachments} />
        </View>
    );
};

export default EntryContent;
