import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native'

import { router }
from 'expo-router'

import {
  useEffect,
  useState,
  useContext,
  useRef
} from 'react'

import { supabase }
from '../../services/supabaseService'

import { ThemeContext }
from '../../context/ThemeContext'

export default function HomeScreen() {

  const scrollRef =
    useRef(null)

  const [barberos,
    setBarberos] =
    useState([])

  const [loading,
    setLoading] =
    useState(true)

  const [refreshing,
    setRefreshing] =
    useState(false)

  const {
    darkMode,
    toggleTheme
  } =
    useContext(ThemeContext)

  useEffect(() => {

    obtenerBarberos()

  }, [])

  useEffect(() => {

    global.scrollToTopHome =
      () => {

        scrollRef.current?.scrollTo({
          y: 0,
          animated: true
        })

      }

    return () => {

      global.scrollToTopHome =
        null

    }

  }, [])

  const obtenerBarberos =
    async () => {

      const {
        data,
        error
      } =
        await supabase
          .from('barberos')
          .select('*')
          .order('id', {
            ascending: true
          })

      if (error) {

        console.log(error)

        return
      }

      setBarberos(data || [])
    }

  const onRefresh =
    async () => {

      setRefreshing(true)

      await obtenerBarberos()

      setTimeout(() => {

        setRefreshing(false)

      }, 800)
    }

  const obtenerSaludo =
    () => {

      const hora =
        new Date().getHours()

      if (hora < 12) {
        return 'Buenos días'
      }

      if (hora < 18) {
        return 'Buenas tardes'
      }

      return 'Buenas noches'
    }

  const obtenerFecha =
    () => {

      return new Date()
        .toLocaleDateString(
          'es-CO',
          {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }
        )
    }

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

  useEffect(() => {

    const cargar =
      async () => {

        await obtenerBarberos()

        setLoading(false)
      }

    cargar()

  }, [])

  if (loading) {

    return (

      <View
        style={[
          styles.loadingContainer,
          { backgroundColor }
        ]}
      >

        <ActivityIndicator
          size='large'
          color='#DE7123'
        />

      </View>
    )
  }

  return (

    <View
      style={[
        styles.container,
        { backgroundColor }
      ]}
    >

      {
        refreshing && (

          <View
            style={styles.refreshFloating}
          >

            <ActivityIndicator
              size='small'
              color='#DE7123'
            />

          </View>

        )
      }

      <ScrollView

        ref={scrollRef}

        showsVerticalScrollIndicator={
          false
        }

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor='transparent'
            colors={['transparent']}
          />
        }
      >

        <View style={styles.header}>

          <View style={styles.topButtons}>

            <TouchableOpacity
              style={styles.adminButton}
              onPress={() =>
                router.push('/auth/login')
              }
            >

              <Text
                style={
                  styles.adminButtonText
                }
              >
                Panel Admin
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.themeButton}
              onPress={toggleTheme}
            >

              <Text style={styles.themeText}>

                {
                  darkMode
                    ? '☀️ Claro'
                    : '🌙 Oscuro'
                }

              </Text>

            </TouchableOpacity>

          </View>

          <Text style={styles.greeting}>
            {obtenerSaludo()} 👋
          </Text>

          <Text style={styles.date}>
            {obtenerFecha()}
          </Text>

          <Text style={styles.logo}>
            TAUROS
          </Text>

          <Text
            style={[
              styles.headerText,
              { color: textColor }
            ]}
          >
            Barbería Premium
          </Text>

        </View>

        <View style={styles.banner}>

          <Text
            style={[
              styles.title,
              { color: textColor }
            ]}
          >
            Reserva tu estilo
          </Text>

          <Text style={styles.subtitle}>
            Agenda con los mejores barberos
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push('/booking')
            }
          >

            <Text style={styles.buttonText}>
              Agendar Cita
            </Text>

          </TouchableOpacity>

        </View>

        <Text
          style={[
            styles.sectionTitle,
            { color: textColor }
          ]}
        >
          Nuestros Barberos
        </Text>

        {
          barberos.length === 0 && (

            <View
              style={styles.emptyBox}
            >

              <Text
                style={styles.emptyText}
              >
                No hay barberos registrados
              </Text>

            </View>

          )
        }

        {
          barberos.map(
            (barbero) => (

              <View
                key={barbero.id}

                style={[
                  styles.card,
                  {
                    backgroundColor:
                      cardColor
                  }
                ]}
              >

                <Image
                  source={{
                    uri:
                      barbero.imagen
                  }}

                  style={
                    styles.image
                  }
                />

                <View
                  style={
                    styles.cardContent
                  }
                >

                  <Text
                    style={[
                      styles.cardTitle,
                      {
                        color:
                          textColor
                      }
                    ]}
                  >
                    {
                      barbero.nombre
                    }
                  </Text>

                  <Text
                    style={
                      styles.description
                    }
                  >
                    {
                      barbero.especialidad
                    }
                  </Text>

                  <Text
                    style={
                      styles.price
                    }
                  >
                    {
                      barbero.experiencia
                    }
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,

                      {
                        backgroundColor:
                          barbero.activo
                            ? '#1E8E3E'
                            : '#B3261E'
                      }
                    ]}
                  >

                    <Text
                      style={
                        styles.statusText
                      }
                    >

                      {
                        barbero.activo
                          ? 'Disponible'
                          : 'No Disponible'
                      }

                    </Text>

                  </View>

                  {
                    barbero.activo ? (

                      <TouchableOpacity
                        style={
                          styles.reserveButton
                        }

                        onPress={() =>
                          router.push({
                            pathname:
                              '/barber',

                            params: {
                              barbero:
                                barbero.nombre,

                              nombre:
                                barbero.nombre,

                              especialidad:
                                barbero.especialidad,

                              experiencia:
                                barbero.experiencia,

                              imagen:
                                barbero.imagen
                            }
                          })
                        }
                      >

                        <Text
                          style={
                            styles.reserveText
                          }
                        >
                          Ver Perfil
                        </Text>

                      </TouchableOpacity>

                    ) : (

                      <View
                        style={
                          styles.inactiveBox
                        }
                      >

                        <Text
                          style={
                            styles.inactiveText
                          }
                        >
                          No disponible hoy
                        </Text>

                      </View>

                    )
                  }

                </View>

              </View>

            )
          )
        }

      </ScrollView>

    </View>
  )
}

const styles =
StyleSheet.create({

  container: {
    flex: 1
  },

  refreshFloating: {
    position: 'absolute',
    top: 55,
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor:
      'rgba(30,30,30,0.75)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },

  loadingContainer: {
    flex: 1,
    justifyContent:
      'center',
    alignItems:
      'center'
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center'
  },

  topButtons: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30
  },

  logo: {
    color: '#DE7123',
    fontSize: 56,
    fontWeight: 'bold',
    letterSpacing: 6,
    marginTop: 30
  },

  headerText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '600'
  },

  greeting: {
    color: '#DE7123',
    fontSize: 22,
    marginTop: 10,
    fontWeight: 'bold'
  },

  date: {
    color: '#AAAAAA',
    marginTop: 8,
    fontSize: 15,
    textTransform:
      'capitalize'
  },

  themeButton: {
    borderWidth: 1,
    borderColor:
      '#DE7123',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12
  },

  themeText: {
    color: '#DE7123',
    fontWeight: 'bold'
  },

  banner: {
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center'
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center'
  },

  subtitle: {
    color: '#AAAAAA',
    marginTop: 12,
    fontSize: 17,
    textAlign: 'center'
  },

  button: {
    backgroundColor:
      '#DE7123',
    marginTop: 28,
    paddingVertical: 16,
    paddingHorizontal: 45,
    borderRadius: 18
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },

  adminButton: {
    borderWidth: 1,
    borderColor:
      '#DE7123',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15
  },

  adminButtonText: {
    color: '#DE7123',
    fontWeight: 'bold',
    fontSize: 16
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 20
  },

  emptyBox: {
    backgroundColor:
      '#1E1E1E',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center'
  },

  emptyText: {
    color: '#AAAAAA',
    fontSize: 16
  },

  card: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 22,
    overflow: 'hidden'
  },

  image: {
    width: '100%',
    height: 220
  },

  cardContent: {
    padding: 18
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },

  description: {
    color: '#AAAAAA',
    marginTop: 8,
    fontSize: 15
  },

  price: {
    color: '#DE7123',
    fontSize: 20,
    marginTop: 12,
    fontWeight: 'bold'
  },

  statusBadge: {
    marginTop: 15,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12
  },

  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },

  reserveButton: {
    backgroundColor:
      '#DE7123',
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center'
  },

  reserveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },

  inactiveBox: {
    backgroundColor:
      '#2B2B2B',
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center'
  },

  inactiveText: {
    color: '#AAAAAA',
    fontWeight: 'bold',
    fontSize: 15
  }

})