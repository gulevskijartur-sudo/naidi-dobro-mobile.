import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  PageShell,
  PrimaryButton,
  ScreenTitle,
  SectionHeading,
  TaskCard,
} from '@/components/AppUI';
import { useColors } from '@/hooks/useColors';
import { useAppState } from '@/state/AppState';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { tasks, joinedTaskIds } = useAppState();
  const featured = tasks[0];

  return (
    <PageShell>
      <ScreenTitle
        eyebrow="СТАВРОПОЛЬСКИЙ КРАЙ"
        title="Добро начинается рядом"
        subtitle="Небольшая помощь меняет чей-то день."
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Открыть мой кабинет"
            onPress={() => router.push('/profile')}
            style={({ pressed }) => [
              styles.profileButton,
              { backgroundColor: colors.secondary, opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Ionicons name="person-outline" size={21} color={colors.primaryDeep} />
          </Pressable>
        }
      />

      <LinearGradient
        colors={[colors.primary, colors.primaryDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View
          pointerEvents="none"
          style={[
            styles.heroOrb,
            styles.heroOrbTop,
            { backgroundColor: colors.primaryForeground },
          ]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.heroOrb,
            styles.heroOrbBottom,
            { backgroundColor: colors.primaryForeground },
          ]}
        />
        <View style={styles.heroBadge}>
          <Ionicons name="heart" size={13} color={colors.primaryForeground} />
          <Text style={[styles.heroBadgeText, { color: colors.primaryForeground }]}>
            ДОБРО ПО СОСЕДСТВУ
          </Text>
        </View>
        <Text style={[styles.heroTitle, { color: colors.primaryForeground }]}>
          Найдите дело, которое вам по силам
        </Text>
        <Text style={[styles.heroBody, { color: colors.primaryForeground }]}>
          Рядом есть человек, которому важно ваше участие.
        </Text>
        <PrimaryButton
          title="Найти задание"
          icon="arrow-forward"
          variant="light"
          onPress={() => router.push('/tasks')}
          style={styles.heroButton}
          testID="find-task-button"
        />
      </LinearGradient>

      <View style={[styles.impactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.impactIcon, { backgroundColor: colors.accent }]}>
          <Ionicons name="sparkles-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.impactCopy}>
          <Text style={[styles.impactNumber, { color: colors.foreground }]}>128</Text>
          <Text style={[styles.impactLabel, { color: colors.mutedForeground }]}>
            добрых дел в нашем сообществе
          </Text>
        </View>
        <View style={[styles.impactDivider, { backgroundColor: colors.border }]} />
        <View style={styles.impactCopy}>
          <Text style={[styles.impactNumber, { color: colors.foreground }]}>
            {joinedTaskIds.length}
          </Text>
          <Text style={[styles.impactLabel, { color: colors.mutedForeground }]}>
            ваших откликов
          </Text>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeading
          title="Можно помочь сегодня"
          action="Все задания"
          onAction={() => router.push('/tasks')}
        />
        {featured ? (
          <TaskCard task={featured} onPress={() => router.push(`/task/${featured.id}`)} />
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/map')}
        style={({ pressed }) => [
          styles.mapTeaser,
          {
            backgroundColor: colors.mapPark,
            borderColor: colors.border,
            opacity: pressed ? 0.84 : 1,
          },
        ]}
      >
        <View style={styles.mapTeaserCopy}>
          <Text style={[styles.mapTeaserTitle, { color: colors.foreground }]}>
            Добрые дела рядом
          </Text>
          <Text style={[styles.mapTeaserSubtitle, { color: colors.mutedForeground }]}>
            Посмотрите задания на карте Ставрополя
          </Text>
        </View>
        <View style={[styles.mapTeaserIcon, { backgroundColor: colors.card }]}>
          <Ionicons name="map-outline" size={22} color={colors.primary} />
        </View>
      </Pressable>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  profileButton: { width: 46, height: 46, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  hero: { minHeight: 264, borderRadius: 28, padding: 22, justifyContent: 'center', overflow: 'hidden', gap: 12 },
  heroOrb: { position: 'absolute', borderRadius: 999, opacity: 0.1 },
  heroOrbTop: { width: 190, height: 190, top: -92, right: -55 },
  heroOrbBottom: { width: 135, height: 135, bottom: -88, right: 46 },
  heroBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7 },
  heroBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2 },
  heroTitle: { maxWidth: 290, fontFamily: 'Inter_700Bold', fontSize: 25, lineHeight: 31, letterSpacing: -0.5 },
  heroBody: { maxWidth: 275, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20 },
  heroButton: { alignSelf: 'flex-start', marginTop: 4, minWidth: 190 },
  impactCard: { minHeight: 98, borderRadius: 22, borderWidth: 1, flexDirection: 'row', alignItems: 'center', padding: 15, gap: 12 },
  impactIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  impactCopy: { flex: 1, gap: 2 },
  impactNumber: { fontFamily: 'Inter_700Bold', fontSize: 21, letterSpacing: -0.35 },
  impactLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 15 },
  impactDivider: { width: 1, height: 44 },
  sectionBlock: { gap: 13 },
  mapTeaser: { minHeight: 106, borderWidth: 1, borderRadius: 22, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12 },
  mapTeaserCopy: { flex: 1, gap: 5 },
  mapTeaserTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  mapTeaserSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
  mapTeaserIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
