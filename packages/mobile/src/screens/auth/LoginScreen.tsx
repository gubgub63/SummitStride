import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Screen } from '../../components/Screen'
import { useAuth } from '../../context/AuthContext'
import { palette, spacing, typography } from '../../theme'
import type { AuthStackParamList } from '../../types/navigation'

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>

const LoginScreen = ({ navigation }: Props) => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Connexion impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <Screen scrollable={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Prépare ta prochaine course</Text>
          <Text style={styles.subtitle}>Connecte-toi pour synchroniser ton entraînement SummitStride.</Text>
        </View>
        <View style={styles.form}>
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
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button onPress={handleSubmit} loading={loading} style={styles.submit}>
            Se connecter
          </Button>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ?</Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Créer un compte</Text>
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

export default LoginScreen
