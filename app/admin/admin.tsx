import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native'

import { router } from 'expo-router'

import {
  useEffect,
  useState,
  useContext
} from 'react'

import { supabase } from '../../services/supabaseService'

import { ThemeContext }
from '../../context/ThemeContext'

export default function AdminScreen() {

  const [totalCitas,
    setTotalCitas] = useState(0)

  const [totalBarberos,
    setTotalBarberos] = useState(0)

  const [totalSillas,
    setTotalSillas] = useState(0)

  const [sillasOcupadas,
    setSillasOcupadas] = useState(0)

  const [estadisticas,
    setEstadisticas] = useState([])

  const [proximaCita,
    setProximaCita] = useState(null)

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
      ? '#CCCCCC'
      : '#555555'

  useEffect(() => {
    obtenerDatos()
  }, [])

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

  const obtenerDatos = async () => {

    const hoy =
      new Date().toLocaleDateString()

    const { data: citas } =
      await supabase
        .from('citas')
        .select('*')
        .eq('fecha', hoy)

    const { data: barberos } =
      await supabase
        .from('barberos')
        .select('*')

    const { data: sillas } =
      await supabase
        .from('sillas')
        .select('*')

    setTotalCitas(citas.length)

    setTotalBarberos(
      barberos.length
    )

    setTotalSillas(
      sillas.length
    )

    const ocupadas =
      sillas.filter(
        (silla) =>
          silla.estado === 'ocupada'
      )

    setSillasOcupadas(
      ocupadas.length
    )

    const conteo = {}

    citas.forEach((cita) => {

      if (!conteo[cita.barbero]) {
        conteo[cita.barbero] = 0
      }

      conteo[cita.barbero] += 1
    })

    const resultado =
      Object.keys(conteo).map((nombre) => ({
        nombre,
        cantidad: conteo[nombre]
      }))

    setEstadisticas(resultado)

    const ahora =
      new Date()

    const minutosActuales =
      ahora.getHours() * 60 +
      ahora.getMinutes()

    const futuras =
      citas.filter((cita) =>

        convertirHora(cita.hora) >
        minutosActuales
      )

    futuras.sort((a, b) =>

      convertirHora(a.hora) -
      convertirHora(b.hora)
    )

    if (futuras.length > 0) {
      setProximaCita(futuras[0])
    }
  }

  const cerrarSesion = () => {

    Alert.alert(
      'Cerrar sesión',
      '¿Deseas salir del panel administrador?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },

        {
          text: 'Salir',

          onPress: () => {
            router.replace('/auth/login')
          }
        }
      ]
    )
  }

  return (
    <ScrollView
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

      <View style={styles.statsContainer}>

        <View
          style={[
            styles.statsCard,
            {
              backgroundColor:
                cardColor
            }
          ]}
        >

          <Text style={styles.statsNumber}>
            {totalCitas}
          </Text>

          <Text
            style={[
              styles.statsText,
              {
                color: textColor
              }
            ]}
          >
            Citas
          </Text>

        </View>

        <View
          style={[
            styles.statsCard,
            {
              backgroundColor:
                cardColor
            }
          ]}
        >

          <Text style={styles.statsNumber}>
            {totalBarberos}
          </Text>

          <Text
            style={[
              styles.statsText,
              {
                color: textColor
              }
            ]}
          >
            Barberos
          </Text>

        </View>

      </View>

      <View style={styles.statsContainer}>

        <View
          style={[
            styles.statsCard,
            {
              backgroundColor:
                cardColor
            }
          ]}
        >

          <Text style={styles.statsNumber}>
            {totalSillas}
          </Text>

          <Text
            style={[
              styles.statsText,
              {
                color: textColor
              }
            ]}
          >
            Sillas
          </Text>

        </View>

        <View
          style={[
            styles.statsCard,
            {
              backgroundColor:
                cardColor
            }
          ]}
        >

          <Text style={styles.statsNumber}>
            {sillasOcupadas}
          </Text>

          <Text
            style={[
              styles.statsText,
              {
                color: textColor
              }
            ]}
          >
            Ocupadas
          </Text>

        </View>

      </View>

      {
        proximaCita && (

          <View
            style={[
              styles.nextCard,
              {
                backgroundColor:
                  cardColor
              }
            ]}
          >

            <Text style={styles.nextTitle}>
              Próxima Cita
            </Text>

            <Text
              style={[
                styles.nextClient,
                {
                  color: textColor
                }
              ]}
            >
              {proximaCita.cliente}
            </Text>

            <Text
              style={[
                styles.nextInfo,
                {
                  color: secondaryText
                }
              ]}
            >
              💈 {proximaCita.barbero}
            </Text>

            <Text
              style={[
                styles.nextInfo,
                {
                  color: secondaryText
                }
              ]}
            >
              🕒 {proximaCita.hora}
            </Text>

          </View>

        )
      }

      <Text
        style={[
          styles.sectionTitle,
          {
            color: textColor
          }
        ]}
      >
        Reservas por Barbero
      </Text>

      {
        estadisticas.map((item) => (

          <View
            key={item.nombre}

            style={[
              styles.barberCard,
              {
                backgroundColor:
                  cardColor
              }
            ]}
          >

            <Text
              style={[
                styles.barberName,
                {
                  color: textColor
                }
              ]}
            >
              💈 {item.nombre}
            </Text>

            <Text style={styles.barberCount}>
              {item.cantidad} citas
            </Text>

          </View>

        ))
      }

      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor:
              cardColor
          }
        ]}
        onPress={() =>
          router.push('/admin/admin-barbers')
        }
      >

        <Text
          style={[
            styles.cardTitle,
            {
              color: textColor
            }
          ]}
        >
          Gestión de Barberos
        </Text>

        <Text
          style={[
            styles.cardText,
            {
              color: secondaryText
            }
          ]}
        >
          Activar o desactivar barberos
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor:
              cardColor
          }
        ]}
        onPress={() =>
          router.push('/admin/admin-citas')
        }
      >

        <Text
          style={[
            styles.cardTitle,
            {
              color: textColor
            }
          ]}
        >
          Citas Agendadas
        </Text>

        <Text
          style={[
            styles.cardText,
            {
              color: secondaryText
            }
          ]}
        >
          Ver y eliminar reservas
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor:
              cardColor
          }
        ]}
        onPress={() =>
          router.push('/admin/admin-sillas')
        }
      >

        <Text
          style={[
            styles.cardTitle,
            {
              color: textColor
            }
          ]}
        >
          Gestión de Sillas
        </Text>

        <Text
          style={[
            styles.cardText,
            {
              color: secondaryText
            }
          ]}
        >
          Administrar estado de las sillas
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={cerrarSesion}
      >

        <Text style={styles.logoutText}>
          Cerrar Sesión
        </Text>

      </TouchableOpacity>

    </ScrollView>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20
  },

  title: {
    color: '#DE7123',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 30
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },

  statsCard: {
    width: '48%',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center'
  },

  statsNumber: {
    color: '#DE7123',
    fontSize: 36,
    fontWeight: 'bold'
  },

  statsText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold'
  },

  nextCard: {
    padding: 22,
    borderRadius: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#DE7123'
  },

  nextTitle: {
    color: '#DE7123',
    fontSize: 22,
    fontWeight: 'bold'
  },

  nextClient: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12
  },

  nextInfo: {
    fontSize: 16,
    marginTop: 8
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },

  barberCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 15
  },

  barberName: {
    fontSize: 20,
    fontWeight: 'bold'
  },

  barberCount: {
    color: '#DE7123',
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold'
  },

  card: {
    padding: 25,
    borderRadius: 20,
    marginTop: 15
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },

  cardText: {
    marginTop: 10,
    fontSize: 16
  },

  logoutButton: {
    backgroundColor: '#B3261E',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 40
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  }

})