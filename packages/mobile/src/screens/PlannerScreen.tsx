import { Feather } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'

import { Card } from '../components/Card'
import { Screen } from '../components/Screen'
import { SectionHeader } from '../components/SectionHeader'
import { plannerSessions, userProfileSummary } from '../data/mockData'
import { palette, radii, spacing, typography } from '../theme'

const iconByType: Record<string, keyof typeof Feather.glyphMap> = {
  ENDURANCE: 'trending-up',
  THRESHOLD: 'zap',
  INTERVAL: 'activity',
  RECOVERY: 'sunrise',
  STRENGTH: 'anchor',
  CROSS_TRAINING: 'wind',
}

const PlannerScreen = () => {
  const prioritySessions = plannerSessions.filter((session) => session.highlight)
  const completedCount = plannerSessions.filter((session) => session.status === 'COMPLETED').length

  const statusStyleMap = {
    COMPLETED: styles.statusCompleted,
    PLANNED: styles.statusPlanned,
    UPCOMING: styles.statusUpcoming,
  } as const

  return (
    <Screen>
      <Card style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>Semaine spécifique</Text>
          <Text style={styles.heroMeta}>
            {completedCount}/{plannerSessions.length} séances validées
          </Text>
        </View>
        <Text style={styles.heroSubtitle}>
          Optimise ta fenêtre de progression avant {userProfileSummary.targetRace}. Les alertes adaptatives prennent en compte ton niveau de fatigue.
        </Text>
        <View style={styles.heroActions}>
          <View style={styles.heroBadge}>
            <Feather name='clock' size={14} color={palette.background} />
            <Text style={styles.heroBadgeText}>Prévu: 9h45</Text>
          </View>
          <View style={[styles.heroBadge, styles.heroBadgeLight]}>
            <Feather name='heart' size={14} color={palette.primary} />
            <Text style={styles.heroBadgeLightText}>Récup: 18h</Text>
          </View>
        </View>
      </Card>

      <SectionHeader title='Semaine en un coup d’œil' />
      <Card style={styles.sessionCard}>
        {plannerSessions.map((session) => {
          const iconName = iconByType[session.type] ?? 'activity'
          return (
            <View key={session.id} style={[styles.sessionRow, session.highlight && styles.highlightRow]}>
              <View style={styles.sessionIcon}>
                <Feather name={iconName} size={18} color={palette.primary} />
              </View>
              <View style={styles.sessionContent}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionDay}>{session.day}</Text>
                  <Text style={[styles.sessionStatus, statusStyleMap[session.status]]}>{session.status.toLowerCase()}</Text>
                </View>
                <Text style={styles.sessionFocus}>{session.focus}</Text>
                <View style={styles.sessionMeta}>
                  {session.durationMin ? <Text style={styles.metaItem}>{session.durationMin} min</Text> : null}
                  {session.distanceKm ? <Text style={styles.metaItem}>{session.distanceKm} km</Text> : null}
                  {session.elevationGain ? <Text style={styles.metaItem}>{session.elevationGain} m D+</Text> : null}
                </View>
              </View>
            </View>
          )
        })}
      </Card>

      {prioritySessions.length ? (
        <>
          <SectionHeader title='Priorités de la semaine' />
          <Card>
            {prioritySessions.map((session) => (
              <View key={session.id} style={styles.priorityBlock}>
                <View style={styles.priorityHead}>
                  <Text style={styles.priorityLabel}>{session.highlight}</Text>
                  <Text style={styles.priorityDay}>{session.day}</Text>
                </View>
                <Text style={styles.priorityFocus}>{session.focus}</Text>
                <Text style={styles.priorityMeta}>
                  Vise une RPE contrôlée, hydratation + apport glucidique dès {Math.round((session.durationMin ?? 60) / 45) * 45} min.
                </Text>
              </View>
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  heroCard: {
    gap: spacing(1.5),
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  heroMeta: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  heroSubtitle: {
    color: palette.secondary,
    fontSize: typography.body,
    lineHeight: 20,
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing(1),
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.75),
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
    backgroundColor: palette.primary,
    borderRadius: radii.sm,
  },
  heroBadgeText: {
    color: palette.background,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  heroBadgeLight: {
    backgroundColor: palette.surfaceMuted,
  },
  heroBadgeLightText: {
    color: palette.primary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  sessionCard: {
    gap: spacing(1.5),
  },
  sessionRow: {
    flexDirection: 'row',
    gap: spacing(1.5),
    paddingVertical: spacing(0.5),
    borderBottomColor: palette.border,
    borderBottomWidth: 1,
  },
  highlightRow: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.sm,
    padding: spacing(1.5),
    marginHorizontal: spacing(-1.5),
    borderBottomWidth: 0,
  },
  sessionIcon: {
    width: spacing(4),
    height: spacing(4),
    borderRadius: radii.sm,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionContent: {
    flex: 1,
    gap: spacing(0.75),
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDay: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  sessionStatus: {
    fontSize: typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusCompleted: {
    color: '#7AD66C',
  },
  statusPlanned: {
    color: palette.secondary,
  },
  statusUpcoming: {
    color: palette.muted,
  },
  sessionFocus: {
    color: palette.secondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: spacing(1),
  },
  metaItem: {
    color: palette.muted,
    fontSize: typography.micro,
    textTransform: 'uppercase',
  },
  priorityBlock: {
    gap: spacing(0.75),
    borderBottomColor: palette.border,
    borderBottomWidth: 1,
    paddingVertical: spacing(1.5),
  },
  priorityHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityLabel: {
    color: palette.primary,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priorityDay: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  priorityFocus: {
    color: palette.secondary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  priorityMeta: {
    color: palette.muted,
    fontSize: typography.caption,
    lineHeight: 18,
  },
})

export default PlannerScreen
