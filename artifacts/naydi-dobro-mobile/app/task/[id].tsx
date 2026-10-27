import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  categoryIcon,
  EmptyState,
  PageShell,
  PrimaryButton,
  ScreenTitle,
} from '@/components/AppUI';
import { useColors } from '@/hooks/useColors';
import { useAppState } from '@/state/AppState';

export default function TaskDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, joinedTaskIds, toggleResponse } = useAppState();
  const task = tasks.find((item) => item.id === id);
  const joined = task ? joinedTaskIds.includes(task.id) : false;

  if (!task) {
    return (
      <PageShell>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Назад"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <EmptyState
          icon="search-outline"
          title="Задание не найдено"
          body="Возможно, его уже удалили или ссылка устарела."
        />
      </PageShell>
    );
  }

  const handleResponse = () => {
    toggleResponse(task.id);
    if (!joined) {
      Alert.alert('Вы откликнулись', 'Задание сохранено в разделе «Мои отклики».');
    }
  };

  return (
    <PageShell contentStyle={styles.content}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Назад"
        onPress={() => router.back()}
        style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Ionicons name="arrow-back" size={21} color={colors.foreground} />
        <Text style={[styles.backText, { color: colors.foreground }]}>Назад</Text>
      </Pressable>

      <View style={[styles.categoryHero, { backgroundColor: colors.accent }]}>
        <View style={[styles.categoryHeroIcon, { backgroundColor: colors.card }]}>
          <Ionicons name={categoryIcon[task.category]} size={26} color={colors.primary} />
        </View>
        <Text style={[styles.categoryName, { color: colors.primaryDeep }]}>{task.category}</Text>
        <View style={[styles.demoPill, { backgroundColor: colors.card }]}>
          <Text style={[styles.demoPillText, { color: colors.mutedForeground }]}>ДЕМО</Text>
        </View>
      </View>

      <ScreenTitle title={task.title} subtitle={task.description} />

      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <InfoRow icon="location-outline" label="Где" value={`${task.location}, ${task.district}`} />
        <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
        <InfoRow icon="time-outline" label="Сколько времени" value={task.duration} />
        <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
        <InfoRow icon="map-outline" label="Город" value="Ставрополь" />
      </View>

      <View style={[styles.kindNote, { backgroundColor: colors.mapPark }]}>
        <Ionicons name="heart-outline" size={19} color={colors.success} />
        <Text style={[styles.kindNoteText, { color: colors.success }]}>
          Любая помощь важна. Координатор уточнит детали после отклика.
        </Text>
      </View>

      <PrimaryButton
        title={joined ? 'Отменить отклик' : 'Откликнуться'}
        icon={joined ? 'checkmark-circle-outline' : 'heart-outline'}
        variant={joined ? 'secondary' : 'primary'}
        onPress={handleResponse}
        testID="respond-to-task-button"
      />
    </PageShell>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: colors.accent }]}>
        <Ionicons name={icon} size={19} color={colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18 },
  backButton: { alignSelf: 'flex-start', minHeight: 42, borderRadius: 15, borderWidth: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 7 },
  backText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  categoryHero: { minHeight: 112, borderRadius: 24, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12 },
  categoryHeroIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 19 },
  categoryName: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 17 },
  demoPill: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6 },
  demoPillText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.8 },
  infoCard: { borderWidth: 1, borderRadius: 23, paddingHorizontal: 16 },
  infoRow: { minHeight: 77, flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  infoText: { flex: 1, gap: 3 },
  infoLabel: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  infoValue: { fontFamily: 'Inter_600SemiBold', fontSize: 14, lineHeight: 19 },
  infoDivider: { height: 1, marginLeft: 52 },
  kindNote: { borderRadius: 17, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  kindNoteText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 18 },
});
