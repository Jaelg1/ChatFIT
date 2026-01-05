# Guía de Configuración de Firebase para ChatFIT

## Paso 1: Obtener Credenciales de Firebase Client

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **ChatFIT** (ID: chatfit-7ce29)
3. Haz clic en el ícono de ⚙️ (Configuración) > **Configuración del proyecto**
4. Baja hasta la sección **"Tus aplicaciones"**
5. Si no tienes una app web, haz clic en **"Agregar app"** > **Web** (ícono `</>`)
6. Registra la app con un nombre (ej: "ChatFIT Web")
7. Copia los valores del objeto `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "chatfit-7ce29.firebaseapp.com",
  projectId: "chatfit-7ce29",
  // ... otros valores
};
```

**Valores que necesitas:**
- `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
- `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (ya lo tienes: `chatfit-7ce29`)

## Paso 2: Habilitar Google Authentication

1. En Firebase Console, ve a **Authentication** (menú lateral)
2. Haz clic en **"Comenzar"** si es la primera vez
3. Ve a la pestaña **"Sign-in method"** (Métodos de inicio de sesión)
4. Haz clic en **"Google"**
5. Activa el toggle para **"Habilitar"**
6. Selecciona un **correo de soporte del proyecto** (puede ser el tuyo)
7. Haz clic en **"Guardar"**

## Paso 3: Obtener Credenciales de Firebase Admin

1. En Firebase Console, ve a **Configuración del proyecto** (⚙️)
2. Ve a la pestaña **"Service accounts"** (Cuentas de servicio)
3. Haz clic en **"Generar nueva clave privada"**
4. Se descargará un archivo JSON (ej: `chatfit-7ce29-firebase-adminsdk-xxxxx.json`)

**Abre ese archivo JSON y extrae:**
- `project_id` → `FIREBASE_ADMIN_PROJECT_ID` (será `chatfit-7ce29`)
- `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
- `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

⚠️ **IMPORTANTE:** El `private_key` viene con saltos de línea `\n`. Debes mantenerlos en el `.env`.

## Paso 4: Crear el archivo .env

Crea un archivo `.env` en la raíz del proyecto con este formato:

```env
# Firebase Client (valores públicos - se usan en el navegador)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chatfit-7ce29.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chatfit-7ce29

# Firebase Admin (valores privados - solo en el servidor)
FIREBASE_ADMIN_PROJECT_ID=chatfit-7ce29
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@chatfit-7ce29.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# MongoDB
MONGODB_URI=mongodb://localhost:27017/chatfit
# O si usas MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/chatfit

# OpenAI
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Ejemplo Real (con valores de ejemplo)

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chatfit-7ce29.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chatfit-7ce29

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=chatfit-7ce29
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-abc12@chatfit-7ce29.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2b50Z8L0FhPq9J5Q8X8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6\nA7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8\n... (más líneas) ...\n-----END PRIVATE KEY-----\n"

# MongoDB (local)
MONGODB_URI=mongodb://localhost:27017/chatfit

# OpenAI
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

## Notas Importantes

1. **El private_key debe estar entre comillas dobles** y mantener los `\n` (saltos de línea)
2. **Nunca subas el archivo `.env` a Git** (ya está en `.gitignore`)
3. **El archivo JSON de Firebase Admin es sensible** - guárdalo de forma segura
4. Si copias el `private_key` del JSON, asegúrate de mantener el formato exacto con `\n`

## Verificar que funciona

Después de crear el `.env`, ejecuta:

```bash
npm run dev
```

Si hay errores relacionados con Firebase, verifica:
- Que todas las variables estén correctamente escritas
- Que el `private_key` tenga las comillas dobles y los `\n`
- Que no haya espacios extra antes o después de los `=`

