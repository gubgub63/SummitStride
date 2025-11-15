import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native'
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Feather } from '@expo/vector-icons'
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import DashboardScreen from '../screens/DashboardScreen'
import NutritionScreen from '../screens/NutritionScreen'
import PlannerScreen from '../screens/PlannerScreen'
import ProfileScreen from '../screens/ProfileScreen'
import RaceManagerScreen from '../screens/RaceManagerScreen'
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'
import { useAuth } from '../context/AuthContext'
import type { AuthStackParamList } from '../types/navigation'
import { palette, radii, spacing } from '../theme'

export type RootTabParamList = {
  Dashboard: undefined
  Races: undefined
  Planner: undefined
  Nutrition: undefined
  Profile: undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()
const Stack = createNativeStackNavigator<AuthStackParamList>()

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: palette.primary,
    background: palette.background,
    card: palette.surface,
    text: palette.primary,
    border: palette.border,
    notification: palette.primary,
  },
}

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const leftRoutes = state.routes.slice(0, 2)
  const centerRoute = state.routes[2]
  const rightRoutes = state.routes.slice(3)

  const renderItem = (route: typeof state.routes[number], isCenter = false) => {
    const routeIndex = state.routes.findIndex((item) => item.key === route.key)
    const { options } = descriptors[route.key]
    const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title ?? route.name
    const isFocused = state.index === routeIndex

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      })

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name)
      }
    }

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      })
    }

    const color = isFocused ? (isCenter ? palette.background : palette.primary) : isCenter ? palette.background : palette.muted
    const icon =
      options.tabBarIcon?.({
        focused: isFocused,
        color,
        size: isCenter ? 26 : 20,
      }) ?? null

    if (isCenter) {
      return (
        <TouchableOpacity
          key={route.key}
          accessibilityRole="button"
          accessibilityState={isFocused ? { selected: true } : {}}
          accessibilityLabel={options.tabBarAccessibilityLabel}
          onPress={onPress}
          onLongPress={onLongPress}
          style={styles.centerButton}
          activeOpacity={0.92}
        >
          <View style={[styles.centerIcon, isFocused && styles.centerIconActive]}>{icon}</View>
          <Text style={[styles.centerLabel, isFocused && styles.centerLabelActive]}>{label}</Text>
        </TouchableOpacity>
      )
    }

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tabButton}
        activeOpacity={0.9}
      >
        <View style={styles.icon}>{icon}</View>
        <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.tabWrapper}>
      <View style={styles.tabContainer}>
        <View style={styles.sideGroup}>
          {leftRoutes.map((route) => renderItem(route))}
        </View>
        {renderItem(centerRoute, true)}
        <View style={styles.sideGroup}>
          {rightRoutes.map((route) => renderItem(route))}
        </View>
      </View>
    </View>
  )
}

const AppTabs = () => (
  <Tab.Navigator
    initialRouteName="Dashboard"
    screenOptions={{
      headerShown: false,
    }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        title: 'Accueil',
        tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Races"
      component={RaceManagerScreen}
      options={{
        title: 'Courses',
        tabBarIcon: ({ color, size }) => <Feather name="map" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Planner"
      component={PlannerScreen}
      options={{
        title: 'Planner',
        tabBarIcon: ({ color, size }) => <Feather name="plus" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Nutrition"
      component={NutritionScreen}
      options={{
        title: 'Nutrition',
        tabBarIcon: ({ color, size }) => <Feather name="droplet" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Profil',
        tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
)

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: palette.background },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
)

const RootNavigator = () => {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingText}>Chargement</Text>
      </View>
    )
  }

  return (
    <NavigationContainer theme={navTheme}>
      {token ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  tabWrapper: {
    backgroundColor: palette.background,
    paddingBottom: Platform.select({ ios: spacing(2), android: spacing(1.5) }),
    paddingTop: spacing(1),
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    marginHorizontal: spacing(2),
    paddingHorizontal: spacing(1.5),
    paddingVertical: spacing(1),
    borderWidth: 1,
    borderColor: palette.border,
  },
  sideGroup: {
    flexDirection: 'row',
    gap: spacing(2),
  },
  tabButton: {
    alignItems: 'center',
    gap: spacing(0.5),
    minWidth: spacing(6),
  },
  icon: {
    height: spacing(2.5),
    justifyContent: 'center',
  },
  label: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '500',
  },
  labelActive: {
    color: palette.primary,
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing(1.5),
    gap: spacing(0.5),
  },
  centerIcon: {
    width: spacing(6),
    height: spacing(6),
    borderRadius: spacing(6) / 2,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIconActive: {
    transform: [{ scale: 1.05 }],
  },
  centerLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  centerLabelActive: {
    color: palette.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
  },
  loadingText: {
    color: palette.muted,
    fontSize: 14,
    letterSpacing: 1,
  },
})

export default RootNavigator
