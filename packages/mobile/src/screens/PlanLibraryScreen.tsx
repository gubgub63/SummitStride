import { useMemo } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useQuery } from '@tanstack/react-query'

import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Screen } from '../components/Screen'
import { SectionHeader } from '../components/SectionHeader'
import { useAuth } from '../context/AuthContext'
import { getTrainingPlanTemplates } from '../services/training'
import type { RootTabParamList } from '../navigation/RootNavigator'
import { palette, radii, spacing, typography } from '../theme'

const PlanLibraryScreen = () => {
  const { token, profile } = useAuth()
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>()

  const templatesQuery = useQuery({
    queryKey: ['training-plan-templates'],
    queryFn: () => getTrainingPlanTemplates(token!),
    enabled: Boolean(token),
  })

  const experienceLevel = profile?.profile?.experienceLevel ?? 'INTERMEDIATE'

  const recommendedTemplates = useMemo(() => {
    const templates = templatesQuery.data?.data ?? []
    return templates.filter(template => {
      if (!template.targetExperience) return true
      return template.targetExperience === experienceLevel
    })
  }, [experienceLevel, templatesQuery.data])

  const alternativeTemplates = useMemo(() => {
    const templates = templatesQuery.data?.data ?? []
    return templates.filter(template => !recommendedTemplates.some(rec => rec.id === template.id))
  }, [recommendedTemplates, templatesQuery.data])

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Plans SummitStride</Text>
        <Text style={styles.subtitle}>
          Refinés pour le niveau {experienceLevel.toLowerCase()} · adaptables à tes disponibilités.
        </Text>
      </View>

      <Card>
        <SectionHeader title="Comment ça marche" subtitle="Sélectionne, personnalise, génère" />
        <View style={styles.aboutRow}>
          <Feather name="sliders" size={18} color={palette.primary} />
          <Text style={styles.aboutText}>
            Choisis un template, ajuste la durée et laisse SummitStride générer les séances avec charge contrôlée et
            jalons nutritionnels. Tu peux le modifier ensuite dans le planner.
          </Text>
        </View>
        <Button onPress={() => navigation.navigate('Planner')} style={styles.button}>
          Créer un plan depuis un template
        </Button>
      </Card>

      {templatesQuery.isLoading ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={palette.primary} />
          <Text style={styles.loadingText}>Chargement de la bibliothèque</Text>
        </Card>
      ) : null}

      {recommendedTemplates.length ? (
        <>
          <SectionHeader title="Recommandés" subtitle="Basés sur ton profil" />
          {recommendedTemplates.map(template => (
            <TemplateCard key={template.id} template={template} highlight />
          ))}
        </>
      ) : null}

      {alternativeTemplates.length ? (
        <>
          <SectionHeader title="Explorer plus" />
          {alternativeTemplates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </>
      ) : null}

      {!templatesQuery.isLoading && !templatesQuery.data?.data?.length ? (
        <Card style={styles.emptyCard}>
          <Feather name="inbox" size={22} color={palette.primary} />
          <Text style={styles.emptyTitle}>Aucun template disponible</Text>
          <Text style={styles.emptySubtitle}>
            Les templates seront ajoutés prochainement. Tu peux créer un plan vide depuis le planner.
          </Text>
        </Card>
      ) : null}
    </Screen>
  )
}

const TemplateCard = ({
  template,
  highlight = false,
}: {
  template: { id: string; name: string; description: string | null; durationWeeks: number; targetCategory: string; targetExperience: string | null }
  highlight?: boolean
}) => (
  <Card style={[styles.templateCard, highlight && styles.templateHighlight]}>
    <View style={styles.templateHead}>
      <View style={styles.templateTitleBlock}>
        <Text style={styles.templateTitle}>{template.name}</Text>
        <Text style={styles.templateCategory}>{template.targetCategory}</Text>
      </View>
      <View style={[styles.badge, highlight && styles.badgeHighlight]}>
        <Feather name="zap" size={14} color={highlight ? palette.background : palette.primary} />
        <Text style={[styles.badgeLabel, highlight && styles.badgeLabelHighlight]}>
          {highlight ? 'Idéal' : template.targetExperience ?? 'Tous niveaux'}
        </Text>
      </View>
    </View>
    <View style={styles.templateMeta}>
      <View>
        <Text style={styles.metaValue}>{template.durationWeeks} sem.</Text>
        <Text style={styles.metaLabel}>Durée</Text>
      </View>
      <View>
        <Text style={styles.metaValueSmall}>{template.targetExperience ?? '—'}</Text>
        <Text style={styles.metaLabel}>Expérience cible</Text>
      </View>
    </View>
    {template.description ? <Text style={styles.templateDescription}>{template.description}</Text> : null}
    <View style={styles.templateFooter}>
      <View style={styles.footerItem}>
        <Feather name="target" size={14} color={palette.secondary} />
        <Text style={styles.footerText}>Objectifs précis</Text>
      </View>
      <View style={styles.footerItem}>
        <Feather name="edit-3" size={14} color={palette.secondary} />
        <Text style={styles.footerText}>Personnalisable</Text>
      </View>
      <View style={styles.footerItem}>
        <Feather name="clock" size={14} color={palette.secondary} />
        <Text style={styles.footerText}>Charge progressive</Text>
      </View>
    </View>
  </Card>
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
  },
  aboutText: {
    flex: 1,
    color: palette.secondary,
    fontSize: typography.body,
    lineHeight: 20,
  },
  button: {
    marginTop: spacing(2),
  },
  loadingCard: {
    marginTop: spacing(2),
    alignItems: 'center',
    gap: spacing(1),
  },
  loadingText: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  templateCard: {
    gap: spacing(1.5),
  },
  templateHighlight: {
    borderColor: palette.primary,
    borderWidth: 1,
  },
  templateHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateTitleBlock: {
    flex: 1,
    gap: spacing(0.25),
  },
  templateTitle: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  templateCategory: {
    color: palette.muted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
  },
  templateMeta: {
    flexDirection: 'row',
    gap: spacing(2),
  },
  metaValue: {
    color: palette.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  metaValueSmall: {
    color: palette.secondary,
    fontSize: typography.caption,
  },
  metaLabel: {
    color: palette.muted,
    fontSize: typography.micro,
    textTransform: 'uppercase',
  },
  templateDescription: {
    color: palette.secondary,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing(1),
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.5),
    paddingHorizontal: spacing(1),
    paddingVertical: spacing(0.5),
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.primary,
  },
  badgeHighlight: {
    backgroundColor: palette.primary,
  },
  badgeLabel: {
    color: palette.primary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  badgeLabelHighlight: {
    color: palette.background,
  },
  emptyCard: {
    marginTop: spacing(2),
    alignItems: 'center',
    gap: spacing(1),
    textAlign: 'center',
  },
  emptyTitle: {
    color: palette.primary,
    fontSize: typography.section,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: palette.secondary,
    fontSize: typography.caption,
    lineHeight: 18,
    textAlign: 'center',
  },
})

export default PlanLibraryScreen
