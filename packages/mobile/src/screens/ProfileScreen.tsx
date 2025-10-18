import { Feather } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'

import { Card } from '../components/Card'
import { Screen } from '../components/Screen'
import { SectionHeader } from '../components/SectionHeader'
import { profileHighlights, trainingProgress, userProfileSummary } from '../data/mockData'
import { palette, radii, spacing, typography } from '../theme'

const ProfileScreen = () => (
  <Screen>
    <Card style={styles.identityCard}>
      <View style={styles.identityHeader}>
        <View>
          <Text style={styles.identityName}>{userProfileSummary.name}</Text>
          <Text style={styles.identityLocation}>{userProfileSummary.location}</Text>
        </View>
        <View style={styles.identityBadge}>
          <Text style={styles.identityLevel}>{userProfileSummary.experience}</Text>
        </View>
      </View>
      <View style={styles.identityMeta}>
        <View>
          <Text style={styles.metaLabel}>VMA</Text>
          <Text style={styles.metaValue}>{userProfileSummary.vma} km/h</Text>
        </View>
        <View>
          <Text style={styles.metaLabel}>Disponibilité</Text>
          <Text style={styles.metaValue}>{userProfileSummary.maxTrainingHours} h / semaine</Text>
        </View>
        <View>
          <Text style={styles.metaLabel}>Streak</Text>
          <Text style={styles.metaValue}>{userProfileSummary.streakWeeks} semaines</Text>
        </View>
      </View>
    </Card>

    <SectionHeader title='Statistiques saison' />
    <Card style={styles.statsCard}>
      <View style={styles.statsRow}>
        <Feather name='trending-up' size={18} color={palette.primary} />
        <View style={styles.statsText}>
          <Text style={styles.statsValue}>{trainingProgress.totalDistanceKm} km</Text>
          <Text style={styles.statsLabel}>Distance 2025</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <Feather name='clock' size={18} color={palette.primary} />
        <View style={styles.statsText}>
          <Text style={styles.statsValue}>{trainingProgress.totalDurationHours} h</Text>
          <Text style={styles.statsLabel}>Volume cumulé</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <Feather name='shield' size={18} color={palette.primary} />
        <View style={styles.statsText}>
          <Text style={styles.statsValue}>{Math.round(userProfileSummary.readinessScore * 100)}%</Text>
          <Text style={styles.statsLabel}>Indice préparation</Text>
        </View>
      </View>
    </Card>

    <SectionHeader title='Forces' />
    <Card style={styles.pillCard}>
      <View style={styles.pillGroup}>
        {profileHighlights.strengths.map((item) => (
          <View key={item} style={styles.pill}>
            <Text style={styles.pillText}>{item}</Text>
          </View>
        ))}
      </View>
    </Card>

    <SectionHeader title='Axes prioritaires' />
    <Card style={styles.focusCard}>
      {profileHighlights.focusNext.map((item) => (
        <View key={item} style={styles.focusRow}>
          <Feather name='target' size={16} color={palette.primary} />
          <Text style={styles.focusText}>{item}</Text>
        </View>
      ))}
    </Card>

    <SectionHeader title='Badges' />
    <Card style={styles.badgesCard}>
      {profileHighlights.badges.map((badge) => (
        <View key={badge.id} style={styles.badge}>
          <Feather name='award' size={16} color={palette.background} />
          <Text style={styles.badgeText}>{badge.label}</Text>
        </View>
      ))}
    </Card>
  </Screen>
)

const styles = StyleSheet.create({
  identityCard: {
    gap: spacing(1.5),
  },
  identityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  identityName: {
    color: palette.primary,
    fontSize: typography.subtitle,
    fontWeight: '600',
  },
  identityLocation: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  identityBadge: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
    borderRadius: radii.sm,
  },
  identityLevel: {
    color: palette.background,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  identityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    color: palette.muted,
    fontSize: typography.micro,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: palette.secondary,
    fontSize: typography.caption,
    marginTop: spacing(0.5),
  },
  statsCard: {
    gap: spacing(1),
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing(1.5),
    alignItems: 'center',
  },
  statsText: {
    gap: spacing(0.25),
  },
  statsValue: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  statsLabel: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  pillCard: {
    paddingVertical: spacing(1.5),
  },
  pillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  pill: {
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
  },
  pillText: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  focusCard: {
    gap: spacing(1),
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  focusText: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  badgesCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.5),
    backgroundColor: palette.primary,
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.75),
    borderRadius: radii.sm,
  },
  badgeText: {
    color: palette.background,
    fontSize: typography.caption,
    fontWeight: '600',
  },
})

export default ProfileScreen
