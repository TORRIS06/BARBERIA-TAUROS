import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image
} from 'react-native'

import {
  useEffect,
  useState,
  useContext
} from 'react'

import * as ImagePicker
from 'expo-image-picker'

import { supabase }
from '../../services/supabaseService'

import { ThemeContext }
from '../../context/ThemeContext'

export default function AdminBarbersScreen() {

  const [barberos,
    setBarberos] =
    useState([])

  const [modalVisible,
    setModalVisible] =
    useState(false)

  const [nombre,
    setNombre] =
    useState('')

  const [especialidad,
    setEspecialidad] =
    useState('')

  const [experiencia,
    setExperiencia] =
    useState('')

  const [imagen,
    setImagen] =
    useState('')

  const [activo,
    setActivo] =
    useState(true)

  const [editandoId,
    setEditandoId] =
    useState(null)

  const [nombreAnterior,
    setNombreAnterior] =
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

  const secondaryText =
    darkMode
      ? '#CCCCCC'
      : '#555555'

  const modalColor =
    darkMode
      ? '#1E1E1E'
      : '#FFFFFF'

  useEffect(() => {

    obtenerBarberos()

  }, [])

  const obtenerBarberos =
    async () => {

      const { data, error } =
        await supabase
          .from('barberos')
          .select('*')

      if (error) {

        console.log(error)

        return
      }

      setBarberos(data || [])
    }

  const limpiarFormulario =
    () => {

      setNombre('')
      setEspecialidad('')
      setExperiencia('')
      setImagen('')
      setActivo(true)
      setEditandoId(null)
      setNombreAnterior('')
    }

  const abrirAgregar =
    () => {

      limpiarFormulario()

      setModalVisible(true)
    }

  const abrirEditar =
    (barbero) => {

      setNombre(
        barbero.nombre
      )

      setNombreAnterior(
        barbero.nombre
      )

      setEspecialidad(
        barbero.especialidad
      )

      setExperiencia(
        barbero.experiencia
      )

      setImagen(
        barbero.imagen
      )

      setActivo(
        barbero.activo
      )

      setEditandoId(
        barbero.id
      )

      setModalVisible(true)
    }

  const seleccionarImagen =
    async () => {

      const permiso =
        await ImagePicker
          .requestMediaLibraryPermissionsAsync()

      if (!permiso.granted) {

        Alert.alert(
          'Debes permitir acceso a las fotos'
        )

        return
      }

      const resultado =
        await ImagePicker
          .launchImageLibraryAsync({

            mediaTypes:
              ImagePicker.MediaTypeOptions.Images,

            allowsEditing: true,

            aspect: [1, 1],

            quality: 1
          })

      if (!resultado.canceled) {

        setImagen(
          resultado.assets[0].uri
        )
      }
    }

  const guardarBarbero =
    async () => {

      if (
        !nombre ||
        !especialidad ||
        !experiencia ||
        !imagen
      ) {

        Alert.alert(
          'Completa todos los campos'
        )

        return
      }

      if (editandoId) {

        // ACTUALIZAR BARBERO

        const { error } =
          await supabase
            .from('barberos')
            .update({
              nombre,
              especialidad,
              experiencia,
              imagen,
              activo
            })
            .eq('id', editandoId)

        if (error) {

          console.log(error)

          Alert.alert(
            'Error al editar'
          )

          return
        }

        // ACTUALIZAR HORARIOS
        // CON EL NUEVO NOMBRE

        const {
          error: errorHorarios
        } =
          await supabase
            .from('horarios')
            .update({
              barbero: nombre
            })
            .eq(
              'barbero',
              nombreAnterior
            )

        if (errorHorarios) {

          console.log(errorHorarios)

          Alert.alert(
            'Error actualizando horarios'
          )

          return
        }

        // ACTUALIZAR SILLAS
        // CON EL NUEVO NOMBRE

        const {
          data: sillasData,
          error: errorBuscarSillas
        } =
          await supabase
            .from('sillas')
            .select(`
              id,
              barberos (
                id,
                nombre
              )
            `)

        if (!errorBuscarSillas) {

          for (const silla of sillasData) {

            if (
              silla.barberos?.nombre ===
              nombreAnterior
            ) {

              await supabase
                .from('sillas')
                .update({
                  estado: 'libre'
                })
                .eq('id', silla.id)
            }
          }
        }

        Alert.alert(
          'Barbero actualizado'
        )

      } else {

        const {
          error
        } =
          await supabase
            .from('barberos')
            .insert([
              {
                nombre,
                especialidad,
                experiencia,
                imagen,
                activo
              }
            ])

        if (error) {

          console.log(error)

          Alert.alert(
            'Error al guardar'
          )

          return
        }

        const horariosDefault = [
          '9:00 AM',
          '10:00 AM',
          '11:00 AM',
          '12:00 PM',
          '2:00 PM',
          '3:00 PM',
          '4:00 PM',
          '5:00 PM',
          '6:00 PM',
          '7:00 PM'
        ]

        const horariosInsertar =
          horariosDefault.map(
            (hora) => ({
              barbero: nombre,
              hora: hora
            })
          )

        const {
          error: errorHorarios
        } =
          await supabase
            .from('horarios')
            .insert(
              horariosInsertar
            )

        if (errorHorarios) {

          console.log(errorHorarios)

          Alert.alert(
            'Barbero creado pero hubo un error creando horarios'
          )

          return
        }

        Alert.alert(
          'Barbero agregado con horarios'
        )
      }

      setModalVisible(false)

      limpiarFormulario()

      obtenerBarberos()
    }

  const eliminarBarbero =
    async (id) => {

      Alert.alert(
        'Eliminar',
        '¿Deseas eliminar este barbero?',
        [
          {
            text: 'Cancelar'
          },

          {
            text: 'Eliminar',

            onPress:
              async () => {

                const barbero =
                  barberos.find(
                    (b) =>
                      b.id === id
                  )

                if (!barbero) {
                  return
                }

                const {
                  error: errorHorarios
                } =
                  await supabase
                    .from('horarios')
                    .delete()
                    .eq(
                      'barbero',
                      barbero.nombre
                    )

                if (errorHorarios) {

                  console.log(
                    errorHorarios
                  )

                  Alert.alert(
                    'Error eliminando horarios'
                  )

                  return
                }

                const { error } =
                  await supabase
                    .from('barberos')
                    .delete()
                    .eq('id', id)

                if (error) {

                  console.log(error)

                  Alert.alert(
                    'Error al eliminar'
                  )

                  return
                }

                Alert.alert(
                  'Barbero eliminado'
                )

                obtenerBarberos()
              }
          }
        ]
      )
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
          {
            backgroundColor
          }
        ]}
      >

        <Text style={styles.title}>
          Gestión de Barberos
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={abrirAgregar}
        >

          <Text style={styles.buttonText}>
            + Añadir Barbero
          </Text>

        </TouchableOpacity>

        {
          barberos.map((barbero) => (

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
                  uri: barbero.imagen
                }}
                style={styles.image}
              />

              <Text
                style={[
                  styles.name,
                  {
                    color: textColor
                  }
                ]}
              >
                {barbero.nombre}
              </Text>

              <Text
                style={[
                  styles.info,
                  {
                    color: secondaryText
                  }
                ]}
              >
                Especialidad:
                {' '}
                {barbero.especialidad}
              </Text>

              <Text
                style={[
                  styles.info,
                  {
                    color: secondaryText
                  }
                ]}
              >
                Experiencia:
                {' '}
                {barbero.experiencia}
              </Text>

              <Text
                style={[
                  styles.info,
                  {
                    color:
                      barbero.activo
                        ? '#00C853'
                        : '#FF5252'
                  }
                ]}
              >
                Estado:
                {
                  barbero.activo
                    ? ' Activo'
                    : ' Inactivo'
                }
              </Text>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  abrirEditar(
                    barbero
                  )
                }
              >

                <Text style={styles.buttonText}>
                  Editar
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() =>
                  eliminarBarbero(
                    barbero.id
                  )
                }
              >

                <Text style={styles.buttonText}>
                  Eliminar
                </Text>

              </TouchableOpacity>

            </View>

          ))
        }

        <Modal
          visible={modalVisible}
          transparent
          animationType='slide'
        >

          <View style={styles.modalOverlay}>

            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor:
                    modalColor
                }
              ]}
            >

              <ScrollView>

                <Text style={styles.modalTitle}>

                  {
                    editandoId
                      ? 'Editar Barbero'
                      : 'Nuevo Barbero'
                  }

                </Text>

                <Text
                  style={[
                    styles.label,
                    {
                      color: textColor
                    }
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
                  placeholder='Nombre'
                  placeholderTextColor='#999'
                  value={nombre}
                  onChangeText={setNombre}
                />

                <Text
                  style={[
                    styles.label,
                    {
                      color: textColor
                    }
                  ]}
                >
                  Especialidad
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
                  placeholder='Especialidad'
                  placeholderTextColor='#999'
                  value={especialidad}
                  onChangeText={
                    setEspecialidad
                  }
                />

                <Text
                  style={[
                    styles.label,
                    {
                      color: textColor
                    }
                  ]}
                >
                  Experiencia
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
                  placeholder='Experiencia'
                  placeholderTextColor='#999'
                  value={experiencia}
                  onChangeText={
                    setExperiencia
                  }
                />

                <Text
                  style={[
                    styles.label,
                    {
                      color: textColor
                    }
                  ]}
                >
                  Imagen del Barbero
                </Text>

                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={seleccionarImagen}
                >

                  <Text style={styles.buttonText}>
                    Seleccionar Imagen
                  </Text>

                </TouchableOpacity>

                {
                  imagen !== '' && (

                    <>
                      <Image
                        source={{
                          uri: imagen
                        }}
                        style={
                          styles.previewImage
                        }
                      />

                      <Text
                        style={
                          styles.imageSelected
                        }
                      >
                        Imagen seleccionada
                      </Text>
                    </>

                  )
                }

                <View style={styles.switchRow}>

                  <Text
                    style={[
                      styles.label,
                      {
                        color: textColor
                      }
                    ]}
                  >
                    Activo
                  </Text>

                  <Switch
                    value={activo}
                    onValueChange={setActivo}
                  />

                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={guardarBarbero}
                >

                  <Text style={styles.buttonText}>

                    {
                      editandoId
                        ? 'Actualizar'
                        : 'Guardar'
                    }

                  </Text>

                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {

                    setModalVisible(false)

                    limpiarFormulario()
                  }}
                >

                  <Text style={styles.buttonText}>
                    Cancelar
                  </Text>

                </TouchableOpacity>

              </ScrollView>

            </View>

          </View>

        </Modal>

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

  addButton: {
    backgroundColor: '#DE7123',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 25
  },

  card: {
    padding: 22,
    borderRadius: 20,
    marginBottom: 20
  },

  image: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    marginBottom: 18
  },

  name: {
    fontSize: 24,
    fontWeight: 'bold'
  },

  info: {
    fontSize: 16,
    marginTop: 10
  },

  editButton: {
    backgroundColor: '#1E88E5',
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    alignItems: 'center'
  },

  deleteButton: {
    backgroundColor: '#B3261E',
    padding: 16,
    borderRadius: 14,
    marginTop: 12,
    alignItems: 'center'
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20
  },

  modalContent: {
    borderRadius: 24,
    padding: 22,
    maxHeight: '90%'
  },

  modalTitle: {
    color: '#DE7123',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15
  },

  input: {
    borderRadius: 14,
    padding: 15,
    fontSize: 16
  },

  imageButton: {
    backgroundColor: '#444',
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
    alignItems: 'center'
  },

  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    marginTop: 18
  },

  imageSelected: {
    color: '#00C853',
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'center'
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15
  },

  saveButton: {
    backgroundColor: '#DE7123',
    padding: 18,
    borderRadius: 16,
    marginTop: 25,
    alignItems: 'center'
  },

  cancelButton: {
    backgroundColor: '#555555',
    padding: 18,
    borderRadius: 16,
    marginTop: 15,
    alignItems: 'center'
  }

})