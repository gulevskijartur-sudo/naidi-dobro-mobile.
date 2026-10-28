import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import OpenMapView from '@/components/OpenMapView';
import {
  PageShell,
  ScreenTitle,
  SectionHeading,
  TaskCard,
} from '@/components/AppUI';
import type { MapMarker } from '@/components/mapHtml';
import { useColors } from '@/hooks/useColors';
import { useAppState } from '@/state/AppState';

export default function MapScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasks } = useAppState();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const markers = useMemo<MapMarker[]>(
    () =>
      tasks.flatMap((task) =>
        task.latitude !== null && task.longitude !== null
          ? [{ id: task.id, latitude: task.latitude, longitude: task.longitude }]
          : [],
      ),
    [tasks],
  );
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const tasksWithoutCoordinates = tasks.length - markers.length;

  return (
    <PageShell>
      <ScreenTitle
        eyebrow="СТАВРОПОЛЬ"
        title="Карта помощи"
        subtitle="Нажмите на метку, чтобы открыть задание."
      />

      <OpenMapView
        markers={markers}
        mode="browse"
        onTaskPress={setSelectedTaskId}
        style={[styles.map, { backgroundColor: colors.card, borderColor: colors.border }]}
      />

      <View style={styles.mapInfo}>
        <View style={styles.mapCount}>
          <View style={[styles.countDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.mapInfoText, { color: colors.foreground }]}>
            {markers.length} {markers.length === 1 ? 'задание' : 'заданий'} на карте
          </Text>
        </View>
        <View style={styles.attribution}>
          <Ionicons name="map-outline" size={15} color={colors.mutedForeground} />
          <Text style={[styles.attributionText, { color: colors.mutedForeground }]}>
            OpenFreeMap · данные © OpenStreetMap
          </Text>
        </View>
      </View>

      {tasksWithoutCoordinates > 0 ? (
        <Text style={[styles.missingCoordinates, { color: colors.mutedForeground }]}>
          У {tasksWithoutCoordinates} сохранённых{' '}
          {tasksWithoutCoordinates === 1 ? 'задания пока нет точки' : 'заданий пока нет точек'} на карте.
        </Text>
      ) : null}

      {selectedTask ? (
        <View style={styles.selectedTask}>
          <SectionHeading title="Задание на карте" />
          <TaskCard
            task={selectedTask}
            onPress={() => router.push(`/task/${selectedTask.id}`)}
          />
        </View>
      ) : null}

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
  map: {
    height: 355,
    borderRadius: 25,
    borderWidth: 1,
  },
  mapInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: -10,
  },
  mapCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  countDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mapInfoText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  attribution: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  attributionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
  },
  missingCoordinates: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
    marginTop: -12,
  },
  selectedTask: {
    gap: 13,
  },
  nearbySection: {
    gap: 13,
  },
});
