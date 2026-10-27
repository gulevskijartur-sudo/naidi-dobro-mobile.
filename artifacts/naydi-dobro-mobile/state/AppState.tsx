import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export type UserRole = 'volunteer' | 'coordinator';

export const TASK_CATEGORIES = [
  'Продукты',
  'Уборка',
  'Животные',
  'Сопровождение',
  'Поддержка',
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export interface HelpTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  district: string;
  duration: string;
  mapX: number;
  mapY: number;
  isDemo: boolean;
}

export interface NewTaskInput {
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  district: string;
  duration: string;
}

interface PersistedState {
  tasks: HelpTask[];
  joinedTaskIds: string[];
  role: UserRole;
}

interface AppStateValue extends PersistedState {
  ready: boolean;
  loadError: string | null;
  storageError: string | null;
  retryLoad: () => void;
  changeRole: (role: UserRole) => void;
  addTask: (input: NewTaskInput) => HelpTask;
  toggleResponse: (taskId: string) => void;
}

const STORAGE_KEY = '@naydi-dobro/demo-v1';

const initialTasks: HelpTask[] = [
  {
    id: 'demo-1',
    title: 'Помочь донести продукты',
    description:
      'Нужно забрать небольшой заказ из магазина и помочь поднять сумки на третий этаж. Всё необходимое уже оплачено.',
    category: 'Продукты',
    location: 'ул. Ленина, 212',
    district: 'Центр',
    duration: 'около 40 минут',
    mapX: 27,
    mapY: 28,
    isDemo: true,
  },
  {
    id: 'demo-2',
    title: 'Прогулять доброго пса',
    description:
      'Хозяин восстанавливается после операции. Спокойный пёс Ричи привык к прогулкам рядом с домом.',
    category: 'Животные',
    location: 'ул. Дзержинского, 155',
    district: 'Юго-Запад',
    duration: 'около 30 минут',
    mapX: 70,
    mapY: 25,
    isDemo: true,
  },
  {
    id: 'demo-3',
    title: 'Сопроводить в поликлинику',
    description:
      'Понадобится пройти вместе до поликлиники и помочь сориентироваться внутри. Встреча у подъезда.',
    category: 'Сопровождение',
    location: 'ул. Мира, 284',
    district: 'Северо-Запад',
    duration: 'около 1 часа',
    mapX: 38,
    mapY: 66,
    isDemo: true,
  },
  {
    id: 'demo-4',
    title: 'Помочь привести в порядок двор',
    description:
      'Соседи собираются убрать листья и навести порядок возле детской площадки. Перчатки и мешки будут.',
    category: 'Уборка',
    location: 'пр-т Кулакова, 18',
    district: 'Северный',
    duration: 'около 1,5 часа',
    mapX: 76,
    mapY: 71,
    isDemo: true,
  },
  {
    id: 'demo-5',
    title: 'Разобрать книги для обмена',
    description:
      'Помочь рассортировать детские книги для дворового обмена и аккуратно сложить их в коробки.',
    category: 'Поддержка',
    location: 'ул. Пушкина, 34',
    district: 'Центр',
    duration: 'около 50 минут',
    mapX: 52,
    mapY: 44,
    isDemo: true,
  },
];

const AppStateContext = createContext<AppStateValue | null>(null);

function isTaskCategory(value: unknown): value is TaskCategory {
  return typeof value === 'string' && TASK_CATEGORIES.includes(value as TaskCategory);
}

function readPersistedState(raw: string): PersistedState {
  const value: unknown = JSON.parse(raw);
  if (
    !value ||
    typeof value !== 'object' ||
    !('tasks' in value) ||
    !Array.isArray(value.tasks) ||
    !('joinedTaskIds' in value) ||
    !Array.isArray(value.joinedTaskIds) ||
    !('role' in value) ||
    (value.role !== 'volunteer' && value.role !== 'coordinator')
  ) {
    throw new Error('Не удалось прочитать сохранённые данные.');
  }

  const tasks = value.tasks as unknown[];
  if (
    tasks.some(
      (task) =>
        !task ||
        typeof task !== 'object' ||
        !('id' in task) ||
        typeof task.id !== 'string' ||
        !('title' in task) ||
        typeof task.title !== 'string' ||
        !('description' in task) ||
        typeof task.description !== 'string' ||
        !('category' in task) ||
        !isTaskCategory(task.category) ||
        !('location' in task) ||
        typeof task.location !== 'string' ||
        !('district' in task) ||
        typeof task.district !== 'string' ||
        !('duration' in task) ||
        typeof task.duration !== 'string' ||
        !('mapX' in task) ||
        typeof task.mapX !== 'number' ||
        !('mapY' in task) ||
        typeof task.mapY !== 'number' ||
        !('isDemo' in task) ||
        typeof task.isDemo !== 'boolean',
    ) ||
    value.joinedTaskIds.some((id) => typeof id !== 'string')
  ) {
    throw new Error('Сохранённые задания имеют неверный формат.');
  }

  return {
    tasks: tasks as HelpTask[],
    joinedTaskIds: value.joinedTaskIds as string[],
    role: value.role,
  };
}

function StartupScreen({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  const colors = useColors();
  return (
    <View style={[styles.startup, { backgroundColor: colors.background }]}>
      {error ? (
        <>
          <Text style={[styles.startupTitle, { color: colors.foreground }]}>
            Не удалось открыть приложение
          </Text>
          <Text style={[styles.startupText, { color: colors.mutedForeground }]}>
            {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>
              Попробовать ещё раз
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.startupText, { color: colors.mutedForeground }]}>
            Загружаем добрые дела…
          </Text>
        </>
      )}
    </View>
  );
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<HelpTask[]>(initialTasks);
  const [joinedTaskIds, setJoinedTaskIds] = useState<string[]>([]);
  const [role, setRole] = useState<UserRole>('volunteer');
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setReady(false);
    setLoadError(null);

    void AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        if (raw) {
          const persisted = readPersistedState(raw);
          setTasks(persisted.tasks);
          setJoinedTaskIds(persisted.joinedTaskIds);
          setRole(persisted.role);
        }
        setReady(true);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : 'Проверьте доступность локального хранилища.',
        );
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  useEffect(() => {
    if (!ready) return;
    const persisted: PersistedState = { tasks, joinedTaskIds, role };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
      .then(() => setStorageError(null))
      .catch(() => setStorageError('Изменения не удалось сохранить на устройстве.'));
  }, [tasks, joinedTaskIds, role, ready]);

  const changeRole = useCallback((nextRole: UserRole) => {
    setRole(nextRole);
  }, []);

  const addTask = useCallback((input: NewTaskInput) => {
    const count = tasks.length;
    const task: HelpTask = {
      ...input,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      mapX: 18 + ((count * 19) % 65),
      mapY: 21 + ((count * 23) % 59),
      isDemo: true,
    };
    setTasks((current) => [task, ...current]);
    return task;
  }, [tasks.length]);

  const toggleResponse = useCallback((taskId: string) => {
    setJoinedTaskIds((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId],
    );
  }, []);

  const retryLoad = useCallback(() => {
    setRetryCount((current) => current + 1);
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      tasks,
      joinedTaskIds,
      role,
      ready,
      loadError,
      storageError,
      retryLoad,
      changeRole,
      addTask,
      toggleResponse,
    }),
    [
      tasks,
      joinedTaskIds,
      role,
      ready,
      loadError,
      storageError,
      retryLoad,
      changeRole,
      addTask,
      toggleResponse,
    ],
  );

  return (
    <AppStateContext.Provider value={value}>
      {ready ? children : <StartupScreen error={loadError} onRetry={retryLoad} />}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error('useAppState должен использоваться внутри AppStateProvider.');
  }
  return value;
}

const styles = StyleSheet.create({
  startup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 12,
  },
  startupTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    textAlign: 'center',
  },
  startupText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  retryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
});
