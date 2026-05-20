import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView
} from 'react-native'

import {
  useEffect,
  useState,
  useContext
} from 'react'

import { supabase }
from '../../services/supabaseService'

import { ThemeContext }
from '../../context/ThemeContext'

export default function AdminSillasScreen() {

  const [sillas,
    setSillas] = useState([])

  const [barberos,
    setBarberos] = useState([])

  const [nuevaSilla,
    setNuevaSilla] = useState('')

  const [modalVisible,
    setModalVisible] = useState(false)

  const [sillaEditando,
    setSillaEditando] = useState(null)

  const [nuevoNombre,
    setNuevoNombre] = useState('')

  const [barberoSeleccionado,
    setBarberoSeleccionado] = useState(null)

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

    obtenerSillas()
    obtenerBarberos()

    const channel =
      supabase
        .channel('realtime-sillas')

        .on(
          'postgres_changes',

          {
            event: '*',
            schema: 'public',
            table: 'sillas'
          },

          () => {
            obtenerSillas()
          }
        )

        .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }, [])

  const obtenerSillas =
    async () => {

      const { data, error } =
        await supabase
          .from('sillas')
          .select(`
            *,
            barberos (
              id,
              nombre
            )
          `)
          .order('nombre')

      if (error) {

        console.log(error)

        return
      }

      setSillas(data || [])
    }

  const obtenerBarberos =
    async () => {

      const { data, error } =
        await supabase
          .from('barberos')
          .select('*')
          .order('nombre')

      if (error) {

        console.log(error)

        return
      }

      setBarberos(data || [])
    }

  const agregarSilla =
    async () => {

      if (
        nuevaSilla.trim() === ''
      ) {

        Alert.alert(
          'Error',
          'Escribe un nombre para la silla'
        )

        return
      }

      const { error } =
        await supabase
          .from('sillas')
          .insert([
            {
              nombre: nuevaSilla,
              estado: 'libre',
              activa: true
            }
          ])

      if (error) {

        console.log(error)

        Alert.alert(
          'Error',
          'No se pudo crear la silla'
        )

        return
      }

      setNuevaSilla('')

      obtenerSillas()
    }

  const eliminarSilla =
    async (id) => {

      Alert.alert(
        'Eliminar silla',
        '¿Deseas eliminar esta silla?',
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
                  .from('sillas')
                  .delete()
                  .eq('id', id)

              if (error) {

                console.log(error)

                return
              }

              obtenerSillas()
            }
          }
        ]
      )
    }

  const cambiarEstado =
    async (silla) => {

      const nuevoEstado =
        silla.estado === 'libre'
          ? 'ocupada'
          : 'libre'

      const { error } =
        await supabase
          .from('sillas')
          .update({
            estado: nuevoEstado
          })
          .eq('id', silla.id)

      if (error) {

        console.log(error)

        return
      }

      obtenerSillas()
    }

  const abrirModalEditar =
    (silla) => {

      setSillaEditando(silla)

      setNuevoNombre(
        silla.nombre
      )

      setBarberoSeleccionado(
        silla.barbero_id
      )

      setModalVisible(true)
    }

  const guardarEdicion =
    async () => {

      const { error } =
        await supabase
          .from('sillas')
          .update({
            nombre: nuevoNombre,
            barbero_id:
              barberoSeleccionado
          })
          .eq(
            'id',
            sillaEditando.id
          )

      if (error) {

        console.log(error)

        Alert.alert(
          'Error',
          'No se pudo editar'
        )

        return
      }

      setModalVisible(false)

      obtenerSillas()
    }

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
        Gestión de Sillas
      </Text>

      <View
        style={[
          styles.addBox,
          {
            backgroundColor:
              cardColor
          }
        ]}
      >

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor:
                inputColor,
              color: textColor
            }
          ]}
          placeholder="Nombre de la silla"
          placeholderTextColor={
            darkMode
              ? '#888'
              : '#777'
          }
          value={nuevaSilla}
          onChangeText={setNuevaSilla}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={agregarSilla}
        >

          <Text style={styles.addButtonText}>
            Añadir Silla
          </Text>

        </TouchableOpacity>

      </View>

      <FlatList
        data={sillas}

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
              💺 {item.nombre}
            </Text>

            <Text
              style={[
                styles.info,
                {
                  color: secondaryText
                }
              ]}
            >
              Estado:
              {' '}
              {
                item.estado === 'ocupada'
                  ? '🔴 Ocupada'
                  : '🟢 Libre'
              }
            </Text>

            <Text
              style={[
                styles.info,
                {
                  color: secondaryText
                }
              ]}
            >
              Barbero:
              {' '}
              {
                item.barberos?.nombre ||
                'Sin asignar'
              }
            </Text>

            <View style={styles.buttonsRow}>

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      item.estado === 'ocupada'
                        ? '#00C853'
                        : '#B3261E'
                  }
                ]}

                onPress={() =>
                  cambiarEstado(item)
                }
              >

                <Text style={styles.buttonText}>

                  {
                    item.estado === 'ocupada'
                      ? 'Liberar'
                      : 'Ocupar'
                  }

                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editButton}

                onPress={() =>
                  abrirModalEditar(item)
                }
              >

                <Text style={styles.buttonText}>
                  Editar
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}

                onPress={() =>
                  eliminarSilla(item.id)
                }
              >

                <Text style={styles.buttonText}>
                  Eliminar
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        )}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
      >

        <View style={styles.modalContainer}>

          <View
            style={[
              styles.modalContent,
              {
                backgroundColor:
                  cardColor
              }
            ]}
          >

            <Text
              style={[
                styles.modalTitle,
                {
                  color: textColor
                }
              ]}
            >
              Editar Silla
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
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
              placeholder="Nombre"
              placeholderTextColor={
                darkMode
                  ? '#888'
                  : '#777'
              }
            />

            <Text
              style={[
                styles.selectTitle,
                {
                  color: textColor
                }
              ]}
            >
              Seleccionar Barbero
            </Text>

            <ScrollView
              style={{
                maxHeight: 200
              }}
            >

              {
                barberos.map((barbero) => (

                  <TouchableOpacity
                    key={barbero.id}

                    style={[
                      styles.barberoItem,
                      {
                        backgroundColor:
                          barberoSeleccionado ===
                          barbero.id
                            ? '#DE7123'
                            : inputColor
                      }
                    ]}

                    onPress={() =>
                      setBarberoSeleccionado(
                        barbero.id
                      )
                    }
                  >

                    <Text
                      style={{
                        color:
                          barberoSeleccionado ===
                          barbero.id
                            ? '#FFFFFF'
                            : textColor,
                        fontWeight: 'bold'
                      }}
                    >
                      {barbero.nombre}
                    </Text>

                  </TouchableOpacity>

                ))
              }

            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={guardarEdicion}
            >

              <Text style={styles.buttonText}>
                Guardar Cambios
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() =>
                setModalVisible(false)
              }
            >

              <Text style={styles.buttonText}>
                Cancelar
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

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

  addBox: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20
  },

  input: {
    borderRadius: 14,
    padding: 15,
    fontSize: 16,
    marginBottom: 15
  },

  addButton: {
    backgroundColor: '#DE7123',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center'
  },

  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },

  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 15
  },

  name: {
    fontSize: 22,
    fontWeight: 'bold'
  },

  info: {
    fontSize: 16,
    marginTop: 10
  },

  buttonsRow: {
    flexDirection: 'row',
    marginTop: 20
  },

  button: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8
  },

  editButton: {
    flex: 1,
    backgroundColor: '#1565C0',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#B3261E',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center'
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold'
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },

  modalContent: {
    borderRadius: 20,
    padding: 20
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },

  selectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },

  barberoItem: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10
  },

  saveButton: {
    backgroundColor: '#00C853',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20
  },

  cancelButton: {
    backgroundColor: '#B3261E',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10
  }

})