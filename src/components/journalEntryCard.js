import React from 'react';
import { StyleSheet, View, Pressable, Text, Image } from 'react-native';
import useTheme from '../store/useTheme';
import Icon from './icon';

const JournalEntryCard = ({ journal }) => {
    const { colors, fSize, spacing } = useTheme();
    const styles = createStyles(colors, fSize, spacing);
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
        })
    }
    return (
        <View style={{paddingVertical: spacing.sm}}>
            <Pressable
            style={styles.container}
        >
            <Image source={require('../../image/image.png')} style={styles.imageCard} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.date}>{formatDate(journal.date)}</Text>
                    <Icon name={journal.mood} size={13} />
                </View>
                <Text style={styles.title}>{journal.title}</Text>
                <Text style={styles.entry} numberOfLines={2}>{journal.content}</Text>
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
    imageCard: {
        width: 80,
        height: 80,
        borderRadius: spacing.md
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
