import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native'

import {
  useState,
  useContext
} from 'react'

import {
  router
} from 'expo-router'

import { ThemeContext }
from '../../context/ThemeContext'

export default function LoginScreen() {

  const [usuario,
    setUsuario] =
    useState('')

  const [password,
    setPassword] =
    useState('')

  const {
    darkMode
  } =
    useContext(ThemeContext)

  const backgroundColor =
    darkMode
      ? '#121212'
      : '#FFFFFF'

  const cardColor =
    darkMode
      ? '#1E1E1E'
      : '#F2F2F2'

  const inputColor =
    darkMode
      ? '#2A2A2A'
      : '#EAEAEA'

  const textColor =
    darkMode
      ? '#FFFFFF'
      : '#000000'

  const iniciarSesion =
    () => {

      if (
        usuario === 'Admin' &&
        password === '1234'
      ) {

        router.push('/admin/admin')

      } else {

        Alert.alert(
          'Datos incorrectos'
        )

      }
    }

  return (

    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor
      }}

      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
    >

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1
        }}

        keyboardShouldPersistTaps='handled'
      >

        <View
          style={[
            styles.container,
            {
              backgroundColor
            }
          ]}
        >

          <Text style={styles.title}>
            Panel Administrador
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  cardColor
              }
            ]}
          >

            <Text
              style={[
                styles.label,
                {
                  color: textColor
                }
              ]}
            >
              Usuario
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    inputColor,
                  color: textColor
                }
              ]}
              placeholder='Ingrese usuario'
              placeholderTextColor='#999'
              value={usuario}
              onChangeText={setUsuario}
            />

            <Text
              style={[
                styles.label,
                {
                  color: textColor
                }
              ]}
            >
              Contraseña
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    inputColor,
                  color: textColor
                }
              ]}
              placeholder='Ingrese contraseña'
              placeholderTextColor='#999'
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={iniciarSesion}
            >

              <Text style={styles.buttonText}>
                Ingresar
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25
  },

  title: {
    color: '#DE7123',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40
  },

  card: {
    borderRadius: 24,
    padding: 24
  },

  label: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15
  },

  input: {
    borderRadius: 14,
    padding: 16,
    fontSize: 16
  },

  button: {
    backgroundColor: '#DE7123',
    marginTop: 35,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center'
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  }

})