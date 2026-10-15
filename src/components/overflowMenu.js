import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import useTheme from '../store/useTheme';
import Icon from './icon';

const OverflowMenu = ({ actions = [], accessibilityLabel = 'More options' }) => {
    const { colors, spacing, fSize } = useTheme();
    const [visible, setVisible] = useState(false);

    return (
        <View style={{ position: 'relative', zIndex: 10 }}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                accessibilityState={{ expanded: visible }}
                onPress={() => setVisible((current) => !current)}
                style={{ padding: spacing.xs, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 9999, borderColor: colors.border, backgroundColor: colors.surface }}
            >
                <Icon name="more-horizontal" color={colors.foreground} />
            </Pressable>
            {visible && (
                <View style={{ position: 'absolute', top: 42, right: 0, minWidth: 168, paddingVertical: spacing.xs, borderWidth: 1, borderRadius: spacing.md, borderColor: colors.border, backgroundColor: colors.surface, zIndex: 20, elevation: 8, shadowColor: colors.shadow, shadowOpacity: 1, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }}>
                    {actions.map((action) => (
                        <Pressable
                            key={action.label}
                            accessibilityRole="button"
                            onPress={() => {
                                setVisible(false);
                                action.onPress();
                            }}
                            style={({ pressed }) => ({ paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: pressed ? colors.surfaceAlt : 'transparent' })}
                        >
                            <Text style={{ color: action.destructive ? colors.destructive : colors.foreground, fontSize: fSize.secondary, fontFamily: 'Inter_400Regular' }}>{action.label}</Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
};

export default OverflowMenu;
