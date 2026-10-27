import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import type { HelpTask, TaskCategory } from '@/state/AppState';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export const categoryIcon: Record<TaskCategory, IconName> = {
  Продукты: 'basket-outline',
  Уборка: 'leaf-outline',
  Животные: 'paw-outline',
  Сопровождение: 'walk-outline',
  Поддержка: 'heart-outline',
};

export function tapFeedback() {
  if (Platform.OS !== 'web') void Haptics.selectionAsync();
}

export function PageShell({
  children,
  contentStyle,
}: {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.pageContent,
          {
            paddingTop: Platform.OS === 'web' ? 67 : insets.top + 10,
            paddingBottom: Platform.OS === 'web' ? 100 : 42,
          },
          contentStyle,
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function ScreenTitle({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.titleRow}>
      <View style={styles.titleTextGroup}>
        {eyebrow ? (
          <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
        ) : null}
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.screenSubtitle, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function IconButton({
  name,
  onPress,
  label,
}: {
  name: IconName;
  onPress: () => void;
  label: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.78 },
      ]}
    >
      <Ionicons name={name} size={21} color={colors.foreground} />
    </Pressable>
  );
}

export function PrimaryButton({
  title,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  style,
  testID,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'light';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const colors = useColors();
  const backgroundColor =
    variant === 'light'
      ? colors.primaryForeground
      : variant === 'secondary'
        ? colors.secondary
        : colors.primary;
  const textColor =
    variant === 'light'
      ? colors.primaryDeep
      : variant === 'secondary'
        ? colors.secondaryForeground
        : colors.primaryForeground;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor, opacity: disabled ? 0.48 : pressed ? 0.82 : 1 },
        style,
      ]}
    >
      <Text style={[styles.primaryButtonText, { color: textColor }]}>{title}</Text>
      {icon ? <Ionicons name={icon} size={19} color={textColor} /> : null}
    </Pressable>
  );
}

export function CategoryChip({
  title,
  icon,
  selected = false,
  onPress,
}: {
  title: string;
  icon?: IconName;
  selected?: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={15}
          color={selected ? colors.primaryForeground : colors.mutedForeground}
        />
      ) : null}
      <Text
        style={[
          styles.chipText,
          { color: selected ? colors.primaryForeground : colors.mutedForeground },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function TaskCard({
  task,
  onPress,
}: {
  task: HelpTask;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${task.title}, ${task.category}, ${task.location}`}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [
        styles.taskCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.86 : 1,
        },
      ]}
    >
      <View style={[styles.categoryIcon, { backgroundColor: colors.accent }]}>
        <Ionicons name={categoryIcon[task.category]} size={20} color={colors.primary} />
      </View>
      <View style={styles.taskCardBody}>
        <View style={styles.taskTopline}>
          <Text style={[styles.taskCategory, { color: colors.primary }]}>
            {task.category}
          </Text>
          <Text style={[styles.taskDistrict, { color: colors.mutedForeground }]}>
            {task.district}
          </Text>
        </View>
        <Text style={[styles.taskTitle, { color: colors.foreground }]} numberOfLines={2}>
          {task.title}
        </Text>
        <Text
          style={[styles.taskDescription, { color: colors.mutedForeground }]}
          numberOfLines={2}
        >
          {task.description}
        </Text>
        <View style={styles.taskMetaRow}>
          <Ionicons name="location-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.taskMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
            {task.location}
          </Text>
          <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
          <Ionicons name="time-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.taskMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
            {task.duration}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

export function SectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: IconName;
  title: string;
  body: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.accent }]}>
        <Ionicons name={icon} size={23} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  pageContent: { paddingHorizontal: 20, gap: 22 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  titleTextGroup: { flex: 1, gap: 4 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.4 },
  screenTitle: { fontFamily: 'Inter_700Bold', fontSize: 27, letterSpacing: -0.6 },
  screenSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, marginTop: 2 },
  iconButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  taskCard: {
    minHeight: 116,
    borderRadius: 22,
    borderWidth: 1,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  taskCardBody: { flex: 1, gap: 6 },
  taskTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  taskCategory: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.25 },
  taskDistrict: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  taskTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, lineHeight: 20 },
  taskDescription: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 15 },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  taskMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, flexShrink: 1 },
  metaDot: { width: 3, height: 3, borderRadius: 2, marginHorizontal: 2 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: -0.25 },
  sectionAction: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  emptyState: {
    borderWidth: 1,
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 20,
    gap: 9,
  },
  emptyIcon: { width: 50, height: 50, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, textAlign: 'center' },
  emptyBody: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, textAlign: 'center' },
});
