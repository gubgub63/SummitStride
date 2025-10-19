import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Screen } from '../../components/Screen'
import { useAuth } from '../../context/AuthContext'
import { palette, spacing, typography } from '../../theme'
import type { AuthStackParamList } from '../../types/navigation'

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>

const RegisterScreen = ({ navigation }: Props) => {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = name.trim() && email.trim() && password.length >= 6 && password === confirmPassword

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError('Vérifie les informations saisies.')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await register({ name: name.trim(), email: email.trim(), password })
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Inscription impossible.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <Screen scrollable={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenue sur SummitStride</Text>
          <Text style={styles.subtitle}>
            Crée ton compte pour générer des plans personnalisés et synchroniser Strava.
          </Text>
        </View>
        <View style={styles.form}>
          <Input label="Nom" value={name} onChangeText={setName} placeholder="Ton prénom" />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="ton.email@mail.com"
          />
          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholder="••••••••"
          />
          <Input
            label="Confirmer"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholder="••••••••"
            error={confirmPassword && confirmPassword !== password ? 'Les mots de passe ne concordent pas.' : undefined}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button onPress={handleSubmit} loading={loading} style={styles.submit}>
            Créer mon compte
          </Button>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà inscrit ?</Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Se connecter</Text>
          </Pressable>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing(4),
  },
  header: {
    gap: spacing(1),
  },
  title: {
    color: palette.primary,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 36,
  },
  subtitle: {
    color: palette.secondary,
    fontSize: typography.body,
    lineHeight: 20,
  },
  form: {
    gap: spacing(1.5),
  },
  submit: {
    marginTop: spacing(1),
  },
  error: {
    color: '#D96C6C',
    fontSize: typography.caption,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing(1),
    justifyContent: 'center',
  },
  footerText: {
    color: palette.muted,
    fontSize: typography.caption,
  },
  footerLink: {
    color: palette.primary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
})

export default RegisterScreen
