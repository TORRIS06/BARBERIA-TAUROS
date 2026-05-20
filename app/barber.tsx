import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native'

import {
  useLocalSearchParams,
  router,
  useFocusEffect
} from 'expo-router'

import {
  useCallback,
  useState,
  useEffect,
  useContext
} from 'react'

import { supabase } from '../services/supabaseService'

import { ThemeContext }
from '../context/ThemeContext'

export default function BarberScreen() {

  const params = useLocalSearchParams()

  const [horariosOcupados,
    setHorariosOcupados] = useState([])

  const [horarios,
    setHorarios] = useState([])

  const [loading,
    setLoading] = useState(true)

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

  const textColor =
    darkMode
      ? '#FFFFFF'
      : '#000000'

  const secondaryText =
    darkMode
      ? '#AAAAAA'
      : '#555555'

  const buttonColor =
    darkMode
      ? '#2A2A2A'
      : '#EAEAEA'

  const formatearFecha =
    (fecha) => {

      const year =
        fecha.getFullYear()

      const month =
        String(
          fecha.getMonth() + 1
        ).padStart(2, '0')

      const day =
        String(
          fecha.getDate()
        ).padStart(2, '0')

      return `${year}-${month}-${day}`
    }

  const convertirHora = (hora) => {

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

    return hours * 60 +
      parseInt(minutes)
  }

  const obtenerHorarios =
    async () => {

      const { data, error } =
        await supabase
          .from('horarios')
          .select('*')
          .eq(
            'barbero',
            params.nombre
          )

      if (error) {

        console.log(error)

        setLoading(false)

        return
      }

      setHorarios(data || [])

      setLoading(false)
    }

  const obtenerHorariosOcupados =
    async () => {

      const hoy =
        formatearFecha(
          new Date()
        )

      const { data, error } =
        await supabase
          .from('citas')
          .select('*')
          .eq(
            'barbero',
            params.nombre
          )
          .eq('fecha', hoy)

      if (error) {

        console.log(error)

        return
      }

      const horas =
        (data || []).map(
          (item) => item.hora
        )

      setHorariosOcupados(horas)
    }

  useEffect(() => {

    obtenerHorarios()

  }, [])

  useFocusEffect(
    useCallback(() => {

      obtenerHorariosOcupados()

    }, [])
  )

  const horaActual = () => {

    const ahora = new Date()

    return (
      ahora.getHours() * 60 +
      ahora.getMinutes()
    )
  }

  const horariosDisponibles =
    horarios.filter((item) => {

      const ocupado =
        horariosOcupados
          .includes(item.hora)

      const pasada =
        convertirHora(item.hora)
        <= horaActual()

      return !ocupado && !pasada
    })

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor }
      ]}
    >

      <Image
        source={{ uri: params.imagen }}
        style={styles.image}
      />

      <View style={styles.content}>

        <Text
          style={[
            styles.name,
            { color: textColor }
          ]}
        >
          {params.nombre}
        </Text>

        <Text style={styles.speciality}>
          {params.especialidad}
        </Text>

        <Text
          style={[
            styles.experience,
            { color: secondaryText }
          ]}
        >
          {params.experiencia}
        </Text>

        {
          loading ? (

            <ActivityIndicator
              size="large"
              color="#DE7123"
              style={{
                marginTop: 40
              }}
            />

          ) : (

            <>
              <View
                style={[
                  styles.availableBox,
                  {
                    backgroundColor:
                      cardColor
                  }
                ]}
              >

                <Text style={styles.availableNumber}>
                  {horariosDisponibles.length}
                </Text>

                <Text
                  style={[
                    styles.availableText,
                    { color: textColor }
                  ]}
                >
                  Horarios disponibles hoy
                </Text>

              </View>

              {
                horariosDisponibles.length === 0 && (

                  <View style={styles.fullBox}>

                    <Text style={styles.fullTitle}>
                      Sin cupos disponibles
                    </Text>

                    <Text style={styles.fullSubtitle}>
                      Este barbero ya completó
                      todas las reservas del día
                    </Text>

                  </View>

                )
              }

              <Text
                style={[
                  styles.sectionTitle,
                  { color: textColor }
                ]}
              >
                Horarios Disponibles
              </Text>

              <View style={styles.hoursContainer}>

                {
                  horarios.map((item) => {

                    const ocupado =
                      horariosOcupados
                        .includes(item.hora)

                    const pasada =
                      convertirHora(item.hora)
                      <= horaActual()

                    return (

                      <TouchableOpacity
                        key={item.id}

                        disabled={
                          ocupado || pasada
                        }

                        style={[
                          styles.hourButton,

                          {
                            backgroundColor:
                              ocupado || pasada
                                ? '#555555'
                                : horaActual
                                ? '#DE7123'
                                : buttonColor
                          }
                        ]}

                        onPress={() =>
                          router.push({
                            pathname: '/booking',

                            params: {
                              barbero:
                                params.nombre,

                              hora:
                                item.hora
                            }
                          })
                        }
                      >

                        <Text
                          style={[
                            styles.hourText,
                            {
                              color:
                                ocupado || pasada
                                  ? '#FFFFFF'
                                  : darkMode
                                  ? '#FFFFFF'
                                  : '#000000'
                            }
                          ]}
                        >

                          {
                            ocupado
                              ? `${item.hora} OCUPADO`
                              : pasada
                              ? `${item.hora} FINALIZÓ`
                              : item.hora
                          }

                        </Text>

                      </TouchableOpacity>

                    )
                  })
                }

              </View>
            </>
          )
        }

      </View>

    </ScrollView>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1
  },

  image: {
    width: '100%',
    height: 320
  },

  content: {
    padding: 22
  },

  name: {
    fontSize: 34,
    fontWeight: 'bold'
  },

  speciality: {
    color: '#DE7123',
    fontSize: 20,
    marginTop: 10
  },

  experience: {
    fontSize: 16,
    marginTop: 10
  },

  availableBox: {
    marginTop: 25,
    padding: 22,
    borderRadius: 18,
    alignItems: 'center'
  },

  availableNumber: {
    color: '#DE7123',
    fontSize: 40,
    fontWeight: 'bold'
  },

  availableText: {
    marginTop: 10,
    fontSize: 16
  },

  fullBox: {
    backgroundColor: '#2B1B1B',
    marginTop: 25,
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B3261E'
  },

  fullTitle: {
    color: '#FF6B6B',
    fontSize: 22,
    fontWeight: 'bold'
  },

  fullSubtitle: {
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 20
  },

  hoursContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },

  hourButton: {
    width: '48%',
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
    alignItems: 'center'
  },

  hourText: {
    fontWeight: 'bold'
  }

})