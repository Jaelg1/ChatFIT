# ChatFIT - Asistente Nutricional con IA

Aplicación web full-stack para gestión nutricional y fitness con chat IA contextual. Desarrollada con Next.js, Firebase Authentication, MongoDB y OpenAI.

## Características

- 🔐 **Autenticación con Google** - Login único con Firebase Auth
- 📊 **Gestión de Perfil** - Registro de peso, altura, edad, objetivos
- 📈 **Calculadora de IMC** - Cálculo y historial de Índice de Masa Corporal
- 🍽️ **Registro de Comidas** - Tracking diario de comidas y calorías
- 🥫 **Gestión de Despensa** - Inventario de alimentos disponibles
- 📅 **Menú Semanal** - Generación automática de menús usando la despensa
- 💬 **Chat IA Contextual** - Asistente nutricional que conoce tu perfil, menú y despensa

## Stack Tecnológico

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Autenticación:** Firebase Authentication (Google Provider)
- **Backend:** Next.js API Routes
- **Base de Datos:** MongoDB + Mongoose
- **IA:** OpenAI API (GPT-4o-mini)

## Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Firebase con proyecto configurado
- Base de datos MongoDB (local o Atlas)
- API Key de OpenAI

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd ChatFIT
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crear archivo `.env` en la raíz del proyecto con las siguientes variables:

   ```env
   # Firebase Client
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id

   # Firebase Admin
   FIREBASE_ADMIN_PROJECT_ID=tu_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=tu_client_email
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/chatfit
   # O para MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/chatfit

   # OpenAI
   OPENAI_API_KEY=sk-...
   ```

4. **Configurar Firebase**

   - Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilitar Authentication con Google Provider
   - Obtener credenciales del proyecto (API Key, Auth Domain, Project ID)
   - Generar clave privada para Firebase Admin:
     - Ir a Project Settings > Service Accounts
     - Generar nueva clave privada
     - Copiar el contenido al `.env` (mantener formato con `\n`)

5. **Configurar MongoDB**

   - Instalar MongoDB localmente o usar MongoDB Atlas
   - Obtener URI de conexión
   - La base de datos se creará automáticamente al primer uso

6. **Ejecutar la aplicación**

   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
ChatFIT/
├── app/
│   ├── (auth)/              # Rutas de autenticación
│   │   └── login/
│   ├── (dashboard)/         # Rutas protegidas del dashboard
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── bmi/
│   │   ├── meals/
│   │   ├── pantry/
│   │   ├── menu/
│   │   └── chat/
│   ├── api/                # API Routes
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── bmi/
│   │   ├── foods/
│   │   ├── pantry/
│   │   ├── meals/
│   │   ├── menu/
│   │   └── chat/
│   ├── layout.tsx
│   └── page.tsx
├── components/             # Componentes React reutilizables
│   ├── ProfileForm.tsx
│   ├── BMICalculator.tsx
│   ├── PantryList.tsx
│   ├── WeeklyMenuView.tsx
│   └── ChatInterface.tsx
├── lib/
│   ├── firebase/           # Firebase client config
│   ├── firebase-admin/     # Firebase Admin config
│   ├── mongodb/            # MongoDB connection
│   ├── openai/             # OpenAI client
│   └── utils/              # Utilidades (BMI, calorías)
├── models/                 # Modelos Mongoose
│   ├── User.ts
│   ├── Profile.ts
│   ├── BMIHistory.ts
│   ├── Food.ts
│   ├── PantryItem.ts
│   ├── MealLog.ts
│   ├── MealItem.ts
│   ├── WeeklyMenu.ts
│   ├── MenuDay.ts
│   ├── MenuMeal.ts
│   ├── ChatSession.ts
│   └── ChatMessage.ts
├── middleware/             # Middleware de autenticación
│   └── auth.ts
└── types/                  # TypeScript types
```

## Uso

### Primer Uso

1. Acceder a `http://localhost:3000`
2. Hacer clic en "Continuar con Google"
3. Completar el perfil en la sección "Perfil"
4. Agregar alimentos a la despensa
5. Generar menú semanal
6. Comenzar a usar el chat IA

### Funcionalidades

- **Perfil:** Configura peso, altura, edad, nivel de actividad y objetivo
- **IMC:** Calcula tu IMC y visualiza el historial
- **Comidas:** Registra las comidas del día
- **Despensa:** Gestiona los alimentos disponibles en tu hogar
- **Menú:** Genera menús semanales automáticamente usando la despensa
- **Chat IA:** Haz preguntas sobre nutrición, tu menú, o solicita alternativas

## API Endpoints

### Autenticación
- `POST /api/auth/verify` - Verificar token y crear/obtener usuario

### Perfil
- `GET /api/profile` - Obtener perfil del usuario
- `POST /api/profile` - Crear/actualizar perfil
- `GET /api/bmi/history` - Historial de IMC
- `POST /api/bmi/calculate` - Calcular IMC

### Alimentos
- `GET /api/foods` - Listar alimentos
- `POST /api/foods` - Crear alimento
- `GET /api/foods/:id` - Obtener alimento

### Despensa
- `GET /api/pantry` - Obtener items de despensa
- `POST /api/pantry` - Agregar item
- `PUT /api/pantry/:id` - Actualizar item
- `DELETE /api/pantry/:id` - Eliminar item

### Comidas
- `GET /api/meals?date=YYYY-MM-DD` - Obtener comidas del día
- `POST /api/meals` - Registrar comida
- `PUT /api/meals/:id` - Actualizar comida
- `DELETE /api/meals/:id` - Eliminar comida

### Menú Semanal
- `GET /api/menu/weekly` - Obtener menú semanal actual
- `POST /api/menu/weekly/generate` - Generar menú semanal
- `PUT /api/menu/day/:id` - Actualizar día del menú
- `POST /api/menu/meal/:id/replace` - Reemplazar ingrediente

### Chat
- `POST /api/chat` - Enviar mensaje al chat IA

## Seguridad

- Todas las rutas API están protegidas con autenticación Firebase
- Los tokens se verifican en cada request
- No se almacenan tokens en localStorage (se usa sessionStorage temporalmente)
- Los usuarios solo pueden acceder a sus propios datos

## Notas Importantes

⚠️ **No se proporcionan consejos médicos:** El chat IA está diseñado para información nutricional general. Siempre consulta con un profesional de la salud para asesoramiento médico.

## Desarrollo

```bash
# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start

# Linter
npm run lint
```

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## Soporte

Para problemas o preguntas, abre un issue en el repositorio.

