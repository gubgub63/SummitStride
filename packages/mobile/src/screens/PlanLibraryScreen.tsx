import { Feather } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'

import { Card } from '../components/Card'
import { Screen } from '../components/Screen'
import { SectionHeader } from '../components/SectionHeader'
import { planLibrary, userProfileSummary } from '../data/mockData'
import { palette, radii, spacing, typography } from '../theme'

const PlanLibraryScreen = () => (
  <Screen>
    <View style={styles.header}>
      <Text style={styles.title}>Plans d’entraînement</Text>
      <Text style={styles.subtitle}>Alignés sur ton profil {userProfileSummary.experience.toLowerCase()}</Text>
    </View>

    <Card>
      <SectionHeader title="À propos" subtitle="Sélection personnalisée" />
      <View style={styles.aboutRow}>
        <Feather name='sliders' size={18} color={palette.primary} />
        <Text style={styles.aboutText}>
          Ajuste les blocs selon tes disponibilités (max {userProfileSummary.maxTrainingHours} h/sem.).
        </Text>
      </View>
      <View style={styles.pillRow}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>UTMB focus</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Charge maîtrisée</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Nutrition intégrée</Text>
        </View>
      </View>
    </Card>

    <SectionHeader title="Recommandés pour toi" />
    {planLibrary.map((plan) => (
      <Card key={plan.id} style={styles.planCard}>
        <View style={styles.planHead}>
          <View style={styles.planTitleBlock}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planDuration}>{plan.durationWeeks} semaines</Text>
          </View>
          <View style={styles.badge}>
            <Feather name='zap' size={14} color={palette.background} />
            <Text style={styles.badgeLabel}>
              {plan.suitableFor.includes(userProfileSummary.experience) ? 'Idéal' : 'Avancé'}
            </Text>
          </View>
        </View>
        <View style={styles.focusList}>
          {plan.focus.map((item) => (
            <View key={item} style={styles.focusChip}>
              <Text style={styles.focusText}>{item}</Text>
            </View>
          ))}
        </View>
        <View style={styles.planFooter}>
          <View style={styles.footerItem}>
            <Feather name='target' size={14} color={palette.secondary} />
            <Text style={styles.footerText}>Progression guidée</Text>
          </View>
          <View style={styles.footerItem}>
            <Feather name='bar-chart-2' size={14} color={palette.secondary} />
            <Text style={styles.footerText}>Suivi charge</Text>
          </View>
          <View style={styles.footerItem}>
            <Feather name='edit-3' size={14} color={palette.secondary} />
            <Text style={styles.footerText}>Personnalisable</Text>
          </View>
        </View>
      </Card>
    ))}
  </Screen>
)

const styles = StyleSheet.create({
  header: {
    gap: spacing(0.5),
  },
  title: {
    color: palette.primary,
    fontSize: typography.subtitle,
    fontWeight: '600',
  },
  subtitle: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  aboutRow: {
    flexDirection: 'row',
    gap: spacing(1.5),
    alignItems: 'flex-start',
  },
  aboutText: {
    flex: 1,
    color: palette.secondary,
    fontSize: typography.body,
    lineHeight: 20,
  },
  pillRow: {
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
  planCard: {
    gap: spacing(1.5),
  },
  planHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitleBlock: {
    flex: 1,
    gap: spacing(0.25),
  },
  planTitle: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  planDuration: {
    color: palette.muted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.5),
    backgroundColor: palette.primary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.5),
  },
  badgeLabel: {
    color: palette.background,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  focusList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1),
  },
  focusChip: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.sm,
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(0.75),
  },
  focusText: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.5),
  },
  footerText: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
})

export default PlanLibraryScreen
