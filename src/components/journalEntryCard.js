import React from 'react';
import { StyleSheet, View, Pressable, Text, Image } from 'react-native';
import useTheme from '../store/useTheme';
import Icon from './icon';
import { router } from 'expo-router'
import HighlightedText from './highlightedText';
import useAttachmentUri from '../hook/useAttachmentUri';

const getSearchSnippet = (content, query) => {
    const term = query?.trim();
    if (!term) return content;

    const matchIndex = content.toLocaleLowerCase().indexOf(term.toLocaleLowerCase());
    if (matchIndex === -1) return content;

    const sentenceBoundary = /[.!?](?=\s|$)|\n/g;
    const findSentenceStart = (position) => {
        let start = 0;
        let boundary;
        sentenceBoundary.lastIndex = 0;
        while ((boundary = sentenceBoundary.exec(content)) && boundary.index < position) {
            start = boundary.index + boundary[0].length;
        }
        while (/\s/.test(content[start] || '') && start < content.length) start += 1;
        return start;
    };
    const findSentenceEnd = (position) => {
        sentenceBoundary.lastIndex = position;
        const boundary = sentenceBoundary.exec(content);
        return boundary ? boundary.index + boundary[0].length : content.length;
    };

    const matchingSentenceStart = findSentenceStart(matchIndex);
    const matchingSentenceEnd = findSentenceEnd(matchIndex + term.length);
    const start = matchingSentenceStart > 0
        ? findSentenceStart(matchingSentenceStart - 1)
        : matchingSentenceStart;
    const end = matchingSentenceEnd < content.length
        ? findSentenceEnd(matchingSentenceEnd)
        : matchingSentenceEnd;
    const hasLeadingOmission = content.slice(0, start).trim().length > 0;
    const hasTrailingOmission = content.slice(end).trim().length > 0;
    const excerpt = content.slice(start, end).trim();

    return `${hasLeadingOmission ? '… ' : ''}${excerpt}${hasTrailingOmission ? ' …' : ''}`;
};

const JournalEntryCard = ({ journal, grouped = false, searchQuery = '' }) => {
    const { colors, fSize, spacing } = useTheme();
    const styles = createStyles(colors, fSize, spacing);
    const hasBodyMatch = Boolean(searchQuery.trim())
        && (journal.content || '').toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase());
    const bodyPreview = getSearchSnippet(journal.content || '', searchQuery);
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
        })
    }
    const date = new Date(journal.date);
    const moodColor = colors[journal.moodColor] || colors.primary;
    const imageAttachment = journal.attachments?.find((attachment) => attachment.type === 'image')
        || journal.contentBlocks?.find((block) => block.type === 'image');
    const attachmentImage = useAttachmentUri(imageAttachment);
    const hasImage = Boolean(attachmentImage || journal.image);
    const hasVoiceNote = journal.attachments?.some((attachment) => attachment.type === 'audio')
        || journal.contentBlocks?.some((block) => block.type === 'audio');
    return (
        <View style={{paddingVertical: spacing.sm}}>
            <Pressable
            style={[styles.container, grouped && styles.groupedContainer]}
            onPress={() => router.push(`entry/${journal.id}`)}
        >
            {hasImage ? (
                <Image source={attachmentImage ? { uri: attachmentImage } : journal.image} style={styles.imageCard} />
            ) : (
                <View style={[styles.dateTile, { backgroundColor: `${moodColor}1f`, borderColor: `${moodColor}40` }]}>
                    <Text style={[styles.tileDay, { color: moodColor }]}>{date.getDate()}</Text>
                    <Text style={[styles.tileMonth, { color: moodColor }]}>
                        {date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </Text>
                </View>
            )}
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.date}>{formatDate(journal.date)}</Text>
                    {hasVoiceNote && (
                        <View style={styles.voiceBadge}>
                            <Icon name="mic" size={11} color={colors.primary} />
                            <Text style={[styles.voiceBadgeText, { color: colors.primary }]}>VOICE</Text>
                        </View>
                    )}
                    <Icon name={journal.mood} size={13} />
                </View>
                <HighlightedText style={styles.title} query={searchQuery}>{journal.title}</HighlightedText>
                <HighlightedText style={styles.entry} numberOfLines={hasBodyMatch ? undefined : 2} query={searchQuery}>
                    {bodyPreview}
                </HighlightedText>
            </View>
        </Pressable>
        </View>
        
    );
}

const createStyles = (colors, fSize, spacing) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        borderWidth: 0.8,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: spacing.md,
    },
    groupedContainer: {
        borderWidth: 0,
        borderRadius: 0,
    },
    imageCard: {
        width: 80,
        height: 80,
        borderRadius: spacing.md
    },
    dateTile: {
        width: 80,
        height: 80,
        borderWidth: 1,
        borderRadius: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    tileDay: {
        fontFamily: 'Fraunces_400Regular',
        fontSize: 22,
        lineHeight: 26,
    },
    tileMonth: {
        marginTop: 2,
        fontFamily: 'Inter_400Regular',
        fontSize: 9,
        letterSpacing: 1.2,
    },
    content: {
        alignItems: 'flex-start',
        marginLeft: spacing.md,
        flex: 1
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    voiceBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    voiceBadgeText: { fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 0.6 },
    date: {
        fontFamily: 'Inter_400Regular',
        fontSize: fSize.caption,
        color: colors.mutedForeground
    },
    title: {
        fontFamily: 'Fraunces_400Regular',
        fontSize: fSize.secondary,
        color: colors.foreground,
        paddingVertical: 2
    },
    entry: {
        fontSize: 13,
        color: colors.mutedForeground,
        lineHeight: 20,
    }
})

export default JournalEntryCard;
