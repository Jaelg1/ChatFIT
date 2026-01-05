# Solución al Error: CONFIGURATION_NOT_FOUND

## Problema
El error `Firebase: Error (auth/configuration-not-found)` significa que Google Authentication no está habilitado en Firebase Console.

## Solución

### Paso 1: Habilitar Google Authentication en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **ChatFIT** (ID: chatfit-7ce29)
3. En el menú lateral, haz clic en **"Authentication"**
4. Si es la primera vez, haz clic en **"Comenzar"** o **"Get Started"**
5. Ve a la pestaña **"Sign-in method"** (Métodos de inicio de sesión)
6. En la lista de proveedores, busca **"Google"** y haz clic en él
7. Activa el toggle **"Habilitar"** (Enable)
8. Selecciona un **correo de soporte del proyecto** (puede ser tu correo)
9. Haz clic en **"Guardar"** (Save)

### Paso 2: Verificar variables de entorno

Asegúrate de que tu archivo `.env` tenga estos valores correctos:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD-WMUK3z5o0ZUXA0zxRGzqtjGbmqkydu4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chatfit-7ce29.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chatfit-7ce29
```

### Paso 3: Reiniciar el servidor de desarrollo

Después de habilitar Google Authentication:

1. Detén el servidor (Ctrl + C)
2. Reinicia con: `npm run dev`
3. Recarga la página en el navegador (F5 o Ctrl + R)

### Paso 4: Verificar que funciona

1. Abre `http://localhost:3000`
2. Haz clic en "Continuar con Google"
3. Deberías ver el popup de Google para iniciar sesión

## Si aún no funciona

- Verifica que las variables de entorno estén correctamente escritas en `.env`
- Asegúrate de que no haya espacios antes o después de los `=`
- Verifica que el `authDomain` sea exactamente `chatfit-7ce29.firebaseapp.com`
- Reinicia el servidor de desarrollo completamente

