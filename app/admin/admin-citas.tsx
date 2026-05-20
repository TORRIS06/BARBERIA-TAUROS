import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Platform
} from 'react-native'

import {
  useEffect,
  useState,
  useContext
} from 'react'

import DateTimePicker
from '@react-native-community/datetimepicker'

import { supabase } from '../../services/supabaseService'

import { ThemeContext }
from '../../context/ThemeContext'

export default function AdminCitasScreen() {

  const [citas,
    setCitas] = useState([])

  const [busqueda,
    setBusqueda] = useState('')

  const [filtroFecha,
    setFiltroFecha] = useState(
      new Date()
    )

  const [mostrarFecha,
    setMostrarFecha] = useState(false)

  const [filtroBarbero,
    setFiltroBarbero] = useState('')

  const [barberos,
    setBarberos] = useState([])

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

  const secondaryText =
    darkMode
      ? '#CCCCCC'
      : '#555555'

  useEffect(() => {

    obtenerCitas()

    obtenerBarberos()

    const channel =
      supabase
        .channel('realtime-citas')

        .on(
          'postgres_changes',

          {
            event: '*',
            schema: 'public',
            table: 'citas'
          },

          () => {
            obtenerCitas()
          }
        )

        .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }, [])

  const obtenerBarberos =
    async () => {

      const { data, error } =
        await supabase
          .from('barberos')
          .select('*')
          .eq('activo', true)

      if (error) {
        console.log(error)
        return
      }

      setBarberos(data || [])
    }

  const obtenerCitas =
    async () => {

      const { data, error } =
        await supabase
          .from('citas')
          .select('*')

      if (error) {
        console.log(error)
        return
      }

      setCitas(data)
    }

  const eliminarCita =
    async (id) => {

      Alert.alert(
        'Eliminar cita',
        '¿Deseas eliminar esta reserva?',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },

          {
            text: 'Eliminar',

            onPress: async () => {

              const { error } =
                await supabase
                  .from('citas')
                  .delete()
                  .eq('id', id)

              if (error) {
                console.log(error)
                return
              }

              obtenerCitas()
            }
          }
        ]
      )
    }

  const formatearFecha =
    (fecha) => {

      return fecha
        .toLocaleDateString()
    }

  const citasFiltradas =
    citas.filter((cita) => {

      const coincideCliente =
        cita.cliente
          .toLowerCase()
          .includes(
            busqueda.toLowerCase()
          )

      const coincideFecha =
        cita.fecha ===
        formatearFecha(
          filtroFecha
        )

      const coincideBarbero =
        filtroBarbero === ''
          ? true
          : cita.barbero ===
            filtroBarbero

      return (
        coincideCliente &&
        coincideFecha &&
        coincideBarbero
      )
    })

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor
        }
      ]}
    >

      <Text style={styles.title}>
        Citas Agendadas
      </Text>

      <View
        style={[
          styles.totalBox,
          {
            backgroundColor:
              cardColor
          }
        ]}
      >

        <Text style={styles.totalNumber}>
          {citasFiltradas.length}
        </Text>

        <Text
          style={[
            styles.totalText,
            {
              color: textColor
            }
          ]}
        >
          Citas encontradas
        </Text>

      </View>

      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor:
              inputColor,
            color: textColor
          }
        ]}
        placeholder="Buscar cliente..."
        placeholderTextColor={
          darkMode
            ? '#888'
            : '#777'
        }
        value={busqueda}
        onChangeText={setBusqueda}
      />

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
            {
              color: textColor
            }
          ]}
        >
          📅 {
            formatearFecha(
              filtroFecha
            )
          }
        </Text>

      </TouchableOpacity>

      {
        mostrarFecha && (

          <DateTimePicker
            value={filtroFecha}

            mode='date'

            display={
              Platform.OS ===
              'ios'
                ? 'spinner'
                : 'default'
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

            onChange={(
              event,
              selectedDate
            ) => {

              setMostrarFecha(false)

              if (
                selectedDate
              ) {

                setFiltroFecha(
                  selectedDate
                )
              }
            }}
          />

        )
      }

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.barbersContainer}
      >

        <TouchableOpacity
          style={[
            styles.barberButton,
            {
              backgroundColor:
                filtroBarbero === ''
                  ? '#DE7123'
                  : inputColor
            }
          ]}
          onPress={() =>
            setFiltroBarbero('')
          }
        >

          <Text
            style={[
              styles.barberText,
              {
                color:
                  filtroBarbero === ''
                    ? '#FFFFFF'
                    : textColor
              }
            ]}
          >
            Todos
          </Text>

        </TouchableOpacity>

        {
          barberos.map(
            (barbero) => (

              <TouchableOpacity
                key={barbero.id}

                style={[
                  styles.barberButton,
                  {
                    backgroundColor:
                      filtroBarbero ===
                      barbero.nombre
                        ? '#DE7123'
                        : inputColor
                  }
                ]}

                onPress={() =>
                  setFiltroBarbero(
                    barbero.nombre
                  )
                }
              >

                <Text
                  style={[
                    styles.barberText,
                    {
                      color:
                        filtroBarbero ===
                        barbero.nombre
                          ? '#FFFFFF'
                          : textColor
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

      </ScrollView>

      {
        citasFiltradas.length === 0 ? (

          <View
            style={[
              styles.emptyBox,
              {
                backgroundColor:
                  cardColor
              }
            ]}
          >

            <Text style={styles.emptyTitle}>
              No se encontraron citas
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color: secondaryText
                }
              ]}
            >
              Intenta cambiar los filtros
              o revisar las reservas
            </Text>

          </View>

        ) : (

          <FlatList
            data={citasFiltradas}

            keyExtractor={(item) =>
              item.id.toString()
            }

            showsVerticalScrollIndicator={false}

            renderItem={({ item }) => (

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
                    styles.name,
                    {
                      color: textColor
                    }
                  ]}
                >
                  {item.cliente}
                </Text>

                <Text
                  style={[
                    styles.info,
                    {
                      color: secondaryText
                    }
                  ]}
                >
                  📞 {item.telefono}
                </Text>

                <Text
                  style={[
                    styles.info,
                    {
                      color: secondaryText
                    }
                  ]}
                >
                  💈 {item.barbero}
                </Text>

                <Text
                  style={[
                    styles.info,
                    {
                      color: secondaryText
                    }
                  ]}
                >
                  🕒 {item.hora}
                </Text>

                <Text
                  style={[
                    styles.info,
                    {
                      color: '#DE7123',
                      fontWeight: 'bold'
                    }
                  ]}
                >
                  📅 {item.fecha}
                </Text>

                <TouchableOpacity
                  style={styles.deleteButton}

                  onPress={() =>
                    eliminarCita(item.id)
                  }
                >

                  <Text style={styles.deleteText}>
                    Eliminar
                  </Text>

                </TouchableOpacity>

              </View>

            )}
          />

        )
      }

    </View>
  )
}

const styles = StyleSheet.create({

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
    marginBottom: 25
  },

  totalBox: {
    padding: 22,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 25
  },

  totalNumber: {
    color: '#DE7123',
    fontSize: 40,
    fontWeight: 'bold'
  },

  totalText: {
    marginTop: 10,
    fontSize: 16
  },

  searchInput: {
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
    fontSize: 16
  },

  dateButton: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 15
  },

  dateText: {
    fontSize: 16,
    fontWeight: 'bold'
  },

  barbersContainer: {
    marginBottom: 20
  },

  barberButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginRight: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center'
  },

  barberText: {
    fontWeight: 'bold',
    fontSize: 15
  },

  emptyBox: {
    padding: 35,
    borderRadius: 22,
    marginTop: 40,
    alignItems: 'center'
  },

  emptyTitle: {
    color: '#DE7123',
    fontSize: 24,
    fontWeight: 'bold'
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
    fontSize: 16
  },

  card: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 15
  },

  name: {
    fontSize: 22,
    fontWeight: 'bold'
  },

  info: {
    marginTop: 10,
    fontSize: 16
  },

  deleteButton: {
    backgroundColor: '#B3261E',
    marginTop: 18,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },

  deleteText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  }

})