import { Stack } from 'expo-router'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { RootStore } from 'shared'
import { api } from '../src/api/client'
import { signIn, useSession } from '../src/lib/auth-client'
import { RootStoreProvider } from '../src/stores/RootStoreContext'

const AppContent = observer(({ store }: { store: RootStore }) => {
  const { data: session, isPending } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    if (session?.user) {
      store.loadData()
    }
  }, [session?.user, store])

  if (isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  if (!session?.user) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Sign In</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button
          title={isSigningIn ? 'Signing in...' : 'Sign In'}
          onPress={async () => {
            setIsSigningIn(true)
            try {
              await signIn.email({ email, password })
            } catch (error) {
              alert(`Sign in failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
            } finally {
              setIsSigningIn(false)
            }
          }}
          disabled={isSigningIn}
        />
      </View>
    )
  }

  if (store.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    )
  }

  return <Stack screenOptions={{ headerShown: false }} />
})

export default function RootLayout() {
  const rootStore = useMemo(() => new RootStore(api), [])

  return (
    <RootStoreProvider value={rootStore}>
      <AppContent store={rootStore} />
    </RootStoreProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 16,
  },
})
