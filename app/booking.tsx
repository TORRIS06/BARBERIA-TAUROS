import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native'

import {
  useEffect,
  useState,
  useContext
} from 'react'

import {
  router,
  useLocalSearchParams
} from 'expo-router'

import DateTimePicker
from '@react-native-community/datetimepicker'

import { supabase }
from '../services/supabaseService'

import { ThemeContext }
from '../context/ThemeContext'

export default function BookingScreen() {

  const params =
    useLocalSearchParams()

  const [cliente,
    setCliente] =
    useState('')

  const [telefono,
    setTelefono] =
    useState('')

  const [loading,
    setLoading] =
    useState(false)

  const [barberos,
    setBarberos] =
    useState([])

  const [servicios,
    setServicios] =
    useState([])

  const [horarios,
    setHorarios] =
    useState([])

  const [horariosOcupados,
    setHorariosOcupados] =
    useState([])

  const [mostrarFecha,
    setMostrarFecha] =
    useState(false)

  const [fechaSeleccionada,
    setFechaSeleccionada] =
    useState(new Date())

  const [barberoSeleccionado,
    setBarberoSeleccionado] =
    useState(
      params.barbero || null
    )

  const [horaSeleccionada,
    setHoraSeleccionada] =
    useState(
      params.hora || ''
    )

  const [servicioSeleccionado,
    setServicioSeleccionado] =
    useState(null)

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

  useEffect(() => {

    obtenerBarberos()

    obtenerServicios()

    if (params.barbero) {

      seleccionarBarbero(
        params.barbero
      )

    }

  }, [])

  useEffect(() => {

    if (barberoSeleccionado) {

      seleccionarBarbero(
        barberoSeleccionado
      )

    }

  }, [fechaSeleccionada])

  const formatearFecha =
    (fecha) => {

      return fecha
        .toLocaleDateString()

    }

  const obtenerBarberos =
    async () => {

      const { data } =
        await supabase
          .from('barberos')
          .select('*')
          .eq('activo', true)

      setBarberos(data || [])
    }

  const obtenerServicios =
    async () => {

      const { data } =
        await supabase
          .from('servicios')
          .select('*')

      setServicios(data || [])
    }

  const seleccionarBarbero =
    async (nombre) => {

      setBarberoSeleccionado(
        nombre
      )

      const fecha =
        formatearFecha(
          fechaSeleccionada
        )

      const {
        data: horariosData
      } =
        await supabase
          .from('horarios')
          .select('*')
          .eq('barbero', nombre)

      setHorarios(
        horariosData || []
      )

      const {
        data: citasData
      } =
        await supabase
          .from('citas')
          .select('*')
          .eq('barbero', nombre)
          .eq('fecha', fecha)

      const ocupados =
        (citasData || []).map(
          (item) => item.hora
        )

      setHorariosOcupados(
        ocupados
      )
    }

  const convertirHora =
    (hora) => {

      const [time, period] =
        hora.split(' ')

      let [hours, minutes] =
        time.split(':')

      hours = parseInt(hours)

      if (
        period === 'PM' &&
        hours !== 12
      ) {
        hours += 12
      }

      if (
        period === 'AM' &&
        hours === 12
      ) {
        hours = 0
      }

      return (
        hours * 60 +
        parseInt(minutes)
      )
    }

  const horaActual = () => {

    const ahora = new Date()

    return (
      ahora.getHours() * 60 +
      ahora.getMinutes()
    )
  }

  const esHoy =
    formatearFecha(
      fechaSeleccionada
    ) ===
    formatearFecha(
      new Date()
    )

  const guardarCita =
    async () => {

      if (
        !cliente ||
        !telefono ||
        !servicioSeleccionado ||
        !barberoSeleccionado ||
        !horaSeleccionada
      ) {

        Alert.alert(
          'Completa todos los campos'
        )

        return
      }

      setLoading(true)

      const fecha =
        formatearFecha(
          fechaSeleccionada
        )

      const { error } =
        await supabase
          .from('citas')
          .insert([
            {
              cliente,
              telefono,

              servicio:
                servicioSeleccionado.nombre,

              barbero:
                barberoSeleccionado,

              fecha,

              hora:
                horaSeleccionada
            }
          ])

      setLoading(false)

      if (error) {

        console.log(error)

        Alert.alert(
          'Error al guardar'
        )

        return
      }

      Alert.alert(
        'Cita agendada correctamente'
      )

      router.replace('/')
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
        style={[
          styles.container,
          { backgroundColor }
        ]}
        keyboardShouldPersistTaps='handled'
      >

        <Text style={styles.title}>
          Agendar Cita
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
              { color: textColor }
            ]}
          >
            Fecha
          </Text>

          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor:
                  inputColor
              }
            ]}
            onPress={() =>
              setMostrarFecha(true)
            }
          >

            <Text
              style={[
                styles.dateText,
                { color: textColor }
              ]}
            >
              📅 {
                fechaSeleccionada
                .toLocaleDateString()
              }
            </Text>

          </TouchableOpacity>

          {
            mostrarFecha && (

              <DateTimePicker
                value={
                  fechaSeleccionada
                }

                mode='date'

                minimumDate={
                  new Date()
                }

                themeVariant={
                  darkMode
                    ? 'dark'
                    : 'light'
                }

                textColor={
                  darkMode
                    ? '#FFFFFF'
                    : '#000000'
                }

                accentColor='#DE7123'

                display={
                  Platform.OS ===
                  'ios'
                    ? 'spinner'
                    : 'default'
                }

                onChange={(
                  event,
                  selectedDate
                ) => {

                  setMostrarFecha(
                    false
                  )

                  if (
                    selectedDate
                  ) {

                    setFechaSeleccionada(
                      selectedDate
                    )

                  }
                }}
              />

            )
          }

          <Text
            style={[
              styles.label,
              { color: textColor }
            ]}
          >
            Servicios
          </Text>

          {
            servicios.map(
              (servicio) => (

                <TouchableOpacity
                  key={servicio.id}

                  style={[
                    styles.optionButton,

                    {
                      backgroundColor:
                        servicioSeleccionado?.id ===
                        servicio.id
                          ? '#DE7123'
                          : inputColor
                    }
                  ]}

                  onPress={() =>
                    setServicioSeleccionado(
                      servicio
                    )
                  }
                >

                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          darkMode
                            ? '#FFFFFF'
                            : '#000000'
                      }
                    ]}
                  >
                    ✂️ {
                      servicio.nombre
                    }
                  </Text>

                </TouchableOpacity>

              )
            )
          }

          <Text
            style={[
              styles.label,
              { color: textColor }
            ]}
          >
            Barberos
          </Text>

          {
            barberos.map(
              (barbero) => (

                <TouchableOpacity
                  key={barbero.id}

                  style={[
                    styles.optionButton,

                    {
                      backgroundColor:
                        barberoSeleccionado ===
                        barbero.nombre
                          ? '#DE7123'
                          : inputColor
                    }
                  ]}

                  onPress={() =>
                    seleccionarBarbero(
                      barbero.nombre
                    )
                  }
                >

                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          darkMode
                            ? '#FFFFFF'
                            : '#000000'
                      }
                    ]}
                  >
                    💈 {
                      barbero.nombre
                    }
                  </Text>

                </TouchableOpacity>

              )
            )
          }

          {
            barberoSeleccionado && (

              <>
                <Text
                  style={[
                    styles.label,
                    { color: textColor }
                  ]}
                >
                  Horarios Disponibles
                </Text>

                <View
                  style={
                    styles.hoursContainer
                  }
                >

                  {
                    horarios.map(
                      (item) => {

                        const ocupado =
                          horariosOcupados
                            .includes(
                              item.hora
                            )

                        const pasada =
                          esHoy &&
                          convertirHora(
                            item.hora
                          ) <=
                          horaActual()

                        if (
                          ocupado ||
                          pasada
                        ) {
                          return null
                        }

                        return (

                          <TouchableOpacity
                            key={item.id}

                            style={[
                              styles.hourButton,

                              {
                                backgroundColor:
                                  horaSeleccionada ===
                                  item.hora
                                    ? '#DE7123'
                                    : inputColor
                              }
                            ]}

                            onPress={() =>
                              setHoraSeleccionada(
                                item.hora
                              )
                            }
                          >

                            <Text
                              style={[
                                styles.hourText,
                                {
                                  color:
                                    darkMode
                                      ? '#FFFFFF'
                                      : '#000000'
                                }
                              ]}
                            >
                              {
                                item.hora
                              }
                            </Text>

                          </TouchableOpacity>

                        )
                      }
                    )
                  }

                </View>
              </>
            )
          }

          <Text
            style={[
              styles.label,
              { color: textColor }
            ]}
          >
            Nombre
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
            placeholder='Tu nombre'
            placeholderTextColor='#999'
            value={cliente}
            onChangeText={setCliente}
          />

          <Text
            style={[
              styles.label,
              { color: textColor }
            ]}
          >
            Teléfono
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
            placeholder='Tu teléfono'
            placeholderTextColor='#999'
            keyboardType='phone-pad'
            value={telefono}
            onChangeText={setTelefono}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={guardarCita}
          >

            {
              loading
                ? (
                  <ActivityIndicator
                    color='#FFFFFF'
                  />
                )
                : (
                  <Text
                    style={
                      styles.buttonText
                    }
                  >
                    Reservar Ahora
                  </Text>
                )
            }

          </TouchableOpacity>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  )
}

const styles =
StyleSheet.create({

  container: {
    flex: 1,
    padding: 20
  },

  title: {
    color: '#DE7123',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 30
  },

  card: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 40
  },

  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10
  },

  dateButton: {
    padding: 16,
    borderRadius: 14
  },

  dateText: {
    fontSize: 16
  },

  optionButton: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 10
  },

  optionText: {
    fontWeight: 'bold'
  },

  hoursContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent:
      'space-between'
  },

  hourButton: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: 'center'
  },

  hourText: {
    fontWeight: 'bold'
  },

  input: {
    borderRadius: 14,
    padding: 15,
    fontSize: 16
  },

  button: {
    backgroundColor:
      '#DE7123',
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