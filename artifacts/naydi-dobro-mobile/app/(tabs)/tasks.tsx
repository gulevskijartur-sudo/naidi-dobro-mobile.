import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  CategoryChip,
  EmptyState,
  PageShell,
  ScreenTitle,
  TaskCard,
} from '@/components/AppUI';
import { useColors } from '@/hooks/useColors';
import { useAppState } from '@/state/AppState';

const filters = ['Все', 'Продукты', 'Уборка', 'Животные', 'Сопровождение', 'Поддержка'];

export default function TasksScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasks } = useAppState();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Все');
  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ru');
    return tasks.filter((task) => {
      const matchesFilter = activeFilter === 'Все' || task.category === activeFilter;
      const searchable = `${task.title} ${task.description} ${task.location} ${task.district} ${task.category}`.toLocaleLowerCase('ru');
      return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [tasks, query, activeFilter]);

  return (
    <PageShell>
      <ScreenTitle
        eyebrow="ПОМОЩЬ РЯДОМ"
        title="Задания"
        subtitle={`${tasks.length} просьб о помощи в Ставрополе`}
      />

      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.mutedForeground} />
        <TextInput
          accessibilityLabel="Поиск заданий"
          placeholder="Что хотите найти?"
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: colors.foreground }]}
          returnKeyType="search"
          testID="task-search"
        />
        {query ? (
          <Ionicons
            accessibilityLabel="Очистить поиск"
            onPress={() => setQuery('')}
            name="close-circle"
            size={19}
            color={colors.mutedForeground}
          />
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        keyboardShouldPersistTaps="handled"
      >
        {filters.map((filter) => (
          <CategoryChip
            key={filter}
            title={filter}
            selected={activeFilter === filter}
            onPress={() => setActiveFilter(filter)}
          />
        ))}
      </ScrollView>

      <View style={styles.resultsHeading}>
        <Text style={[styles.resultsTitle, { color: colors.foreground }]}>Подходящие задания</Text>
        <Text style={[styles.resultsCount, { color: colors.mutedForeground }]}>
          {visibleTasks.length}
        </Text>
      </View>

      {visibleTasks.length > 0 ? (
        <View style={styles.taskList}>
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => router.push(`/task/${task.id}`)}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="search-outline"
          title="Ничего не нашлось"
          body="Попробуйте изменить запрос или выбрать другую категорию."
        />
      )}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  searchBox: { minHeight: 54, borderRadius: 18, borderWidth: 1, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, minHeight: 52, fontFamily: 'Inter_400Regular', fontSize: 14 },
  filterRow: { gap: 8, paddingRight: 20 },
  resultsHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 1 },
  resultsTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  resultsCount: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  taskList: { gap: 11 },
});
