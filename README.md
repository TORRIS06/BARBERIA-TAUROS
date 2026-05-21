# 💈 Tauros Barbería App

Aplicación móvil desarrollada con React Native + Expo Router para la administración completa de una barbería.

---

# 🚀 Funcionalidades

## 👤 Gestión de Barberos

- Crear barberos
- Editar información
- Eliminar barberos
- Activar/Inactivar barberos
- Subir imágenes
- Liberación automática de silla

---

## 📅 Gestión de Citas

- Crear citas
- Eliminar citas
- Filtrar por:
  - Cliente
  - Fecha
  - Barbero
- Actualización en tiempo real

---

## 💺 Gestión de Sillas

- Asignación de sillas
- Liberación automática al eliminar barbero

---

## 🕒 Gestión de Horarios

- Creación automática de horarios base
- Compatibilidad con citas futuras
- Organización automática de horarios

---

## 🌙 Interfaz

- Dark Mode
- Diseño responsive
- Navegación moderna
- Interfaz intuitiva

---

# 🛠️ Tecnologías Utilizadas

- React Native
- Expo
- Expo Router
- Supabase
- TypeScript
- Context API
- Expo Image Picker
- React Native DateTimePicker

---

# 🗄️ Base de Datos

## Tabla: barberos

- id
- nombre
- especialidad
- experiencia
- imagen
- activo

---

## Tabla: citas

- id
- cliente
- telefono
- barbero
- fecha
- hora

---

## Tabla: horarios

- id
- barbero
- hora

---

## Tabla: sillas

- id
- nombre
- barbero_id
- activa
- estado

---

## Tabla: servicios

- id
- nombre
- descripcion
- duracion

---

# 📁 Estructura del Proyecto

```bash
barberia-app/
│
├── .expo
├── .vscode
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   │
│   │── admin/
│   │   ├── admin-barbers.tsx
│   │   ├── admin-citas.tsx
│   │   ├── admin-sillas.jsx
│   │   └── admin.tsx
│   │
│   │── auth/
│   │   └── login.tsx
│   │── barber.tsx
│   │── booking.tsx
│   │── index.tsx
│   │──_layout.tsx
│
├── assets/
├── components/
├── constants/
├── context/
├── hooks/
├── services/
│   └── supabaseService.js
│
├── app.json
├── package.json
└── README.md
```

---

# ▶️ Instalación

```bash
npm install
```

---

# ▶️ Ejecutar Proyecto

```bash
npx expo start
```

---

# 👨‍💻 Desarrollado por

Santiago Avendaño Torrado
Lina Patricia Perez Rueda
Ingeniería de Sistemas - UNICIENCIA