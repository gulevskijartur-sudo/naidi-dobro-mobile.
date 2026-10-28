import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import OpenMapView from '@/components/OpenMapView';
import {
  CategoryChip,
  PrimaryButton,
  tapFeedback,
} from '@/components/AppUI';
import { useColors } from '@/hooks/useColors';
import {
  TASK_CATEGORIES,
  useAppState,
  type TaskCategory,
  type TaskCoordinates,
} from '@/state/AppState';

export default function AddTaskScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { role, addTask } = useAppState();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Продукты');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('');
  const [duration, setDuration] = useState('');
  const [coordinates, setCoordinates] = useState<TaskCoordinates | null>(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (role !== 'coordinator') router.replace('/profile');
  }, [role, router]);

  if (role !== 'coordinator') {
    return null;
  }

  const submit = () => {
    Keyboard.dismiss();
    const values = [title, description, location, district, duration];
    if (values.some((value) => !value.trim())) {
      setValidationError('Заполните все поля, чтобы опубликовать задание.');
      return;
    }
    if (!coordinates) {
      setValidationError('Отметьте место встречи на карте.');
      return;
    }

    const task = addTask({
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      district: district.trim(),
      duration: duration.trim(),
      ...coordinates,
    });
    tapFeedback();
    router.replace(`/task/${task.id}`);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Platform.OS === 'web' ? 67 : insets.top + 10,
            paddingBottom: Platform.OS === 'web' ? 100 : insets.bottom + 28,
          },
        ]}
        bottomOffset={70}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Назад в кабинет"
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="arrow-back" size={21} color={colors.foreground} />
        </Pressable>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>ДЛЯ КООРДИНАТОРА</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Новое задание</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Опишите, какая помощь нужна. Это демонстрационная публикация.
          </Text>
        </View>

        <View style={styles.form}>
          <FieldLabel title="Что нужно сделать" colors={colors} />
          <TextInput
            accessibilityLabel="Что нужно сделать"
            testID="task-title-input"
            placeholder="Например, донести продукты"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]}
            maxLength={80}
            returnKeyType="next"
          />

          <FieldLabel title="Категория" colors={colors} />
          <View style={styles.categories}>
            {TASK_CATEGORIES.map((item) => (
              <CategoryChip
                key={item}
                title={item}
                selected={category === item}
                onPress={() => setCategory(item)}
              />
            ))}
          </View>

          <FieldLabel title="Описание" colors={colors} />
          <TextInput
            accessibilityLabel="Описание задания"
            testID="task-description-input"
            placeholder="Расскажите, какая помощь пригодится"
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.multilineInput, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />

          <FieldLabel title="Адрес" colors={colors} />
          <TextInput
            accessibilityLabel="Адрес задания"
            testID="task-address-input"
            placeholder="Например, ул. Ленина, 10"
            placeholderTextColor={colors.mutedForeground}
            value={location}
            onChangeText={setLocation}
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]}
            maxLength={100}
          />

          <FieldLabel title="Район Ставрополя" colors={colors} />
          <TextInput
            accessibilityLabel="Район Ставрополя"
            placeholder="Например, Центр"
            placeholderTextColor={colors.mutedForeground}
            value={district}
            onChangeText={setDistrict}
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]}
            maxLength={60}
          />

          <View style={styles.mapSection}>
            <FieldLabel title="Место встречи на карте" colors={colors} />
            <Text style={[styles.mapHint, { color: colors.mutedForeground }]}>
              Коснитесь карты, чтобы поставить точку. Её можно переместить повторным нажатием.
            </Text>
            <OpenMapView
              mode="pick"
              onCoordinatePick={(point) => {
                setCoordinates(point);
                setValidationError('');
              }}
              style={[styles.mapPicker, { backgroundColor: colors.card, borderColor: colors.border }]}
            />
            <View style={[styles.coordinateRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons
                name={coordinates ? 'location' : 'location-outline'}
                size={16}
                color={coordinates ? colors.primary : colors.mutedForeground}
              />
              <Text style={[styles.coordinateText, { color: coordinates ? colors.foreground : colors.mutedForeground }]}>
                {coordinates
                  ? `${coordinates.latitude.toFixed(5)}°, ${coordinates.longitude.toFixed(5)}°`
                  : 'Точка пока не выбрана'}
              </Text>
            </View>
            <Text style={[styles.mapAttribution, { color: colors.mutedForeground }]}>
              OpenFreeMap · данные © OpenStreetMap
            </Text>
          </View>

          <FieldLabel title="Примерное время" colors={colors} />
          <TextInput
            accessibilityLabel="Примерное время"
            placeholder="Например, около 1 часа"
            placeholderTextColor={colors.mutedForeground}
            value={duration}
            onChangeText={setDuration}
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.input, color: colors.foreground }]}
            maxLength={50}
          />

          {validationError ? (
            <Text accessibilityRole="alert" style={[styles.errorText, { color: colors.destructive }]}>
              {validationError}
            </Text>
          ) : null}
          <PrimaryButton
            title="Опубликовать задание"
            icon="arrow-forward"
            onPress={submit}
            testID="publish-task-button"
          />
          <Text style={[styles.privacyNote, { color: colors.mutedForeground }]}>
            Только демонстрационные данные. Контактная информация не запрашивается.
          </Text>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function FieldLabel({
  title,
  colors,
}: {
  title: string;
  colors: ReturnType<typeof useColors>;
}) {
  return <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 19 },
  backButton: { width: 43, height: 43, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  header: { gap: 5 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 27, letterSpacing: -0.6 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 3 },
  form: { gap: 9 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, marginTop: 8 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 13, fontFamily: 'Inter_400Regular', fontSize: 14 },
  multilineInput: { minHeight: 112, paddingTop: 14 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  mapSection: { gap: 7, marginTop: 4 },
  mapHint: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
  mapPicker: { height: 250, borderRadius: 20, borderWidth: 1, marginTop: 3 },
  coordinateRow: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  coordinateText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  mapAttribution: { fontFamily: 'Inter_400Regular', fontSize: 10, textAlign: 'right' },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 18, marginTop: 3 },
  privacyNote: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, textAlign: 'center' },
});
