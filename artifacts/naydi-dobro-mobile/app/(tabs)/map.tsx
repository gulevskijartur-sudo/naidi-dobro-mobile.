import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  PageShell,
  ScreenTitle,
  SectionHeading,
  TaskCard,
} from '@/components/AppUI';
import { useColors } from '@/hooks/useColors';
import { useAppState } from '@/state/AppState';

export default function MapScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasks } = useAppState();
  return (
    <PageShell>
      <ScreenTitle
        eyebrow="СТАВРОПОЛЬ"
        title="Карта помощи"
        subtitle="Выберите метку, чтобы узнать подробности."
      />

      <View style={[styles.map, { backgroundColor: colors.mapLand, borderColor: colors.border }]}>
        <View style={[styles.park, styles.parkOne, { backgroundColor: colors.mapPark }]} />
        <View style={[styles.park, styles.parkTwo, { backgroundColor: colors.mapPark }]} />
        <View style={[styles.park, styles.parkThree, { backgroundColor: colors.mapPark }]} />
        <View style={[styles.waterway, { backgroundColor: colors.mapWater }]} />
        <View style={[styles.road, styles.roadA, { backgroundColor: colors.mapRoad }]} />
        <View style={[styles.road, styles.roadB, { backgroundColor: colors.mapRoad }]} />
        <View style={[styles.road, styles.roadC, { backgroundColor: colors.mapRoad }]} />
        <View style={[styles.road, styles.roadD, { backgroundColor: colors.mapRoad }]} />
        <View style={[styles.road, styles.roadE, { backgroundColor: colors.mapRoad }]} />
        <View style={[styles.road, styles.roadF, { backgroundColor: colors.mapRoad }]} />

        <Text style={[styles.mapPlace, styles.placeCenter, { color: colors.mutedForeground }]}>
          ЦЕНТР
        </Text>
        <Text style={[styles.mapPlace, styles.placeWest, { color: colors.mutedForeground }]}>
          ЮГО-ЗАПАД
        </Text>
        <Text style={[styles.mapPlace, styles.placeNorth, { color: colors.mutedForeground }]}>
          СЕВЕРНЫЙ
        </Text>
        <View style={[styles.mapLabel, { backgroundColor: colors.card }]}>
          <Ionicons name="navigate-outline" size={14} color={colors.primary} />
          <Text style={[styles.mapLabelText, { color: colors.foreground }]}>Ставрополь</Text>
        </View>

        {tasks.map((task) => (
          <Pressable
            key={task.id}
            accessibilityRole="button"
            accessibilityLabel={`Задание на карте: ${task.title}`}
            onPress={() => router.push(`/task/${task.id}`)}
            style={({ pressed }) => [
              styles.pin,
              {
                left: `${task.mapX}%`,
                top: `${task.mapY}%`,
                backgroundColor: colors.primary,
                borderColor: colors.card,
                transform: [{ translateX: -16 }, { translateY: -30 }, { scale: pressed ? 0.9 : 1 }],
              },
            ]}
          >
            <Ionicons name="heart" size={16} color={colors.primaryForeground} />
          </Pressable>
        ))}

        <View style={[styles.mapNote, { backgroundColor: colors.card }]}>
          <View style={[styles.noteDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.mapNoteText, { color: colors.foreground }]}>
            {tasks.length} заданий рядом
          </Text>
        </View>
      </View>

      <View style={styles.nearbySection}>
        <SectionHeading title="Помощь рядом" />
        {tasks.slice(0, 3).map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onPress={() => router.push(`/task/${task.id}`)}
          />
        ))}
      </View>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  map: { height: 355, borderRadius: 25, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  park: { position: 'absolute', borderRadius: 22 },
  parkOne: { width: '27%', height: '23%', top: '11%', left: '6%' },
  parkTwo: { width: '28%', height: '20%', bottom: '14%', right: '7%' },
  parkThree: { width: '18%', height: '16%', top: '51%', left: '22%' },
  waterway: { position: 'absolute', width: '9%', height: '140%', left: '82%', top: '-20%', borderRadius: 40, transform: [{ rotate: '22deg' }] },
  road: { position: 'absolute', borderRadius: 8 },
  roadA: { height: 10, width: '115%', left: '-5%', top: '39%', transform: [{ rotate: '-13deg' }] },
  roadB: { height: 8, width: '116%', left: '-8%', top: '72%', transform: [{ rotate: '9deg' }] },
  roadC: { width: 9, height: '115%', left: '37%', top: '-7%', transform: [{ rotate: '12deg' }] },
  roadD: { width: 7, height: '120%', left: '63%', top: '-7%', transform: [{ rotate: '-17deg' }] },
  roadE: { height: 7, width: '90%', left: '13%', top: '21%', transform: [{ rotate: '7deg' }] },
  roadF: { width: 6, height: '78%', left: '18%', top: '20%', transform: [{ rotate: '29deg' }] },
  mapPlace: { position: 'absolute', fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1 },
  placeCenter: { left: '45%', top: '47%' },
  placeWest: { left: '7%', top: '58%' },
  placeNorth: { right: '8%', top: '13%' },
  mapLabel: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 14, paddingHorizontal: 11, paddingVertical: 8 },
  mapLabelText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  pin: { position: 'absolute', width: 33, height: 33, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 3, elevation: 3 },
  mapNote: { position: 'absolute', left: 14, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 14, paddingHorizontal: 11, paddingVertical: 9 },
  noteDot: { width: 7, height: 7, borderRadius: 4 },
  mapNoteText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  nearbySection: { gap: 13 },
});
