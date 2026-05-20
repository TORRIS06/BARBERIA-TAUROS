import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {

  return (

    <Tabs

      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#1E1E1E'
        },

        tabBarActiveTintColor:
          '#DE7123',

        tabBarInactiveTintColor:
          '#888'
      }}
    >

      <Tabs.Screen
        name="index"

        options={{
          title: 'Inicio',

          tabBarIcon:
            ({ color, size }) => (

              <Ionicons
                name="home"
                color={color}
                size={size}
              />

            )
        }}

        listeners={{

          tabPress: () => {

            global.scrollToTopHome?.()

          }

        }}
      />

    </Tabs>
  )
}