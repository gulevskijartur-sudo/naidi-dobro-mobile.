import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  EmptyState,
  PageShell,
  PrimaryButton,
  ScreenTitle,
  SectionHeading,
  TaskCard,
  tapFeedback,
} from '@/components/AppUI';
import { useColors } from '@/hooks/useColors';
import { useAppState, type UserRole } from '@/state/AppState';

const roles: { value: UserRole; label: string }[] = [
  { value: 'volunteer', label: 'Исполнитель' },
  { value: 'coordinator', label: 'Координатор' },
];

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { role, changeRole, tasks, joinedTaskIds, storageError } = useAppState();
  const joinedTasks = tasks.filter((task) => joinedTaskIds.includes(task.id));

  return (
    <PageShell>
      <ScreenTitle
        eyebrow="ВАШЕ ДОБРО"
        title="Мой кабинет"
        subtitle="Управляйте ролью и смотрите свои отклики."
      />

      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Ionicons name="heart" size={25} color={colors.primary} />
        </View>
        <View style={styles.profileCopy}>
          <Text style={[styles.profileName, { color: colors.foreground }]}>Участник сообщества</Text>
          <View style={styles.profileLocation}>
            <Ionicons name="location-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.profileLocationText, { color: colors.mutedForeground }]}>
              Ставрополь · демо-профиль
            </Text>
          </View>
        </View>
        <View style={[styles.demoBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.demoBadgeText, { color: colors.secondaryForeground }]}>ДЕМО</Text>
        </View>
      </View>

      <View style={styles.roleSection}>
        <Text style={[styles.roleTitle, { color: colors.foreground }]}>Моя роль</Text>
        <View style={[styles.rolePicker, { backgroundColor: colors.muted }]}>
          {roles.map((item) => {
            const selected = item.value === role;
            return (
              <Pressable
                key={item.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                testID={`role-${item.value}`}
                onPress={() => {
                  tapFeedback();
                  changeRole(item.value);
                }}
                style={({ pressed }) => [
                  styles.roleOption,
                  selected && { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                  { opacity: pressed ? 0.75 : 1 },
                ]}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    { color: selected ? colors.primaryDeep : colors.mutedForeground },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {storageError ? (
        <View style={[styles.storageWarning, { backgroundColor: colors.accent }]}>
          <Ionicons name="warning-outline" size={17} color={colors.primaryDeep} />
          <Text style={[styles.storageWarningText, { color: colors.primaryDeep }]}>{storageError}</Text>
        </View>
      ) : null}

      {role === 'coordinator' ? (
        <View style={[styles.coordinatorCard, { backgroundColor: colors.secondary }]}>
          <View style={styles.coordinatorCopy}>
            <Text style={[styles.coordinatorTitle, { color: colors.foreground }]}>
              Есть кому помочь?
            </Text>
            <Text style={[styles.coordinatorText, { color: colors.mutedForeground }]}>
              Добавьте просьбу — она появится в заданиях и на карте.
            </Text>
          </View>
          <PrimaryButton
            title="Добавить задание"
            icon="add"
            onPress={() => router.push('/add-task')}
            testID="add-task-button"
          />
        </View>
      ) : (
        <View style={[styles.noteCard, { backgroundColor: colors.secondary }]}>
          <Ionicons name="people-outline" size={20} color={colors.primaryDeep} />
          <Text style={[styles.noteText, { color: colors.secondaryForeground }]}>
            Координатор может добавить новое задание для сообщества. Роль можно сменить в любой момент.
          </Text>
        </View>
      )}

      <View style={styles.responsesSection}>
        <SectionHeading
          title="Мои отклики"
          action={joinedTasks.length ? `${joinedTasks.length}` : undefined}
        />
        {joinedTasks.length ? (
          <View style={styles.responsesList}>
            {joinedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => router.push(`/task/${task.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="hand-left-outline"
            title="Пока без откликов"
            body="Выберите задание, которое вам по силам, и откликнитесь."
          />
        )}
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  profileCard: { minHeight: 94, borderWidth: 1, borderRadius: 23, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  profileCopy: { flex: 1, gap: 5 },
  profileName: { fontFamily: 'Inter_700Bold', fontSize: 15 },
  profileLocation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  profileLocationText: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  demoBadge: { borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5 },
  demoBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.8 },
  roleSection: { gap: 10 },
  roleTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  rolePicker: { borderRadius: 18, padding: 4, flexDirection: 'row' },
  roleOption: { flex: 1, minHeight: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  roleOptionText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  storageWarning: { flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 16, padding: 13 },
  storageWarningText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 17 },
  coordinatorCard: { borderRadius: 23, padding: 17, gap: 14 },
  coordinatorCopy: { gap: 5 },
  coordinatorTitle: { fontFamily: 'Inter_700Bold', fontSize: 17 },
  coordinatorText: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  noteCard: { borderRadius: 18, padding: 15, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  noteText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 18 },
  responsesSection: { gap: 13 },
  responsesList: { gap: 11 },
});
