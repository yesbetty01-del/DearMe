import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import journalStore from '../../store/journalStore';
import useTheme from '../../store/useTheme';
import { router, useLocalSearchParams } from 'expo-router';
import Icon from '../../components/icon';

const Id = () => {
    const { colors, spacing, fSize } = useTheme();
    const styles = createStyles(colors, spacing, fSize);
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-us', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        })
    }
    const {id} = useLocalSearchParams();
    const journals = journalStore();
    const journal = journals.find(
        (item) => item.id === id
    );

    if(!journal){
        return(
            <View>
                <Text>no journal</Text>
            </View>
        )
    }
    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.pill}
                    onPress={() => router.back()}
                >
                    <Icon name={'chevron-left'} color={colors.foreground} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.pill}
                >
                    <Icon name={'more-horizontal'} color={colors.foreground} />
                </TouchableOpacity>
            </View>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: spacing.xxxl}}
            >
                <View style={[styles.moodContainer, {backgroundColor: colors[journal.moodColor]}]}>
                    <Icon name={journal.mood} color={colors.onPrimary}/>
                    <Text style={styles.moodText}>{journal.moodName}</Text>
                </View>
                <Text style={styles.title}>{journal.title}</Text>
                <Text style={styles.date}>{formatDate(journal.date)}</Text>
                <Image source={journal.image} style={styles.imageStyle} />
                <Text style={styles.content}>{journal.content}</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors, spacing, fSize) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.sm,
    },
    pill: {
        padding: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 9999,
        borderColor: colors.border,
        backgroundColor: colors.surface
    },
    scrollView: {
        flex: 1,
        paddingTop: spacing.md,
    },
    moodContainer: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: spacing.sm,
        gap: spacing.xs,
        alignSelf: 'flex-start',
        backgroundColor: colors.surface
    },
    moodText: {
        color: colors.onPrimary,
        fontSize: fSize.caption,
        fontFamily: 'Inter_400Regular'
    },
    title: {
        fontFamily: 'Fraunces_400Regular',
        fontSize: fSize.sectionTitle,
        color: colors.foreground,
        marginVertical: spacing.lg
    },
    date: {
        fontFamily: 'Inter_400Regular',
        fSize: fSize.caption,
        color: colors.mutedForeground
    },
    imageStyle: {
        height: 200,
        width: '100%',
        borderRadius: spacing.md,
        marginVertical: spacing.lg,
        flex: 1
    },
    content: {
        fontSize: fSize.body,
        lineHeight: fSize.body * 1.5,
        color: colors.foreground
    }
})

export default Id;
