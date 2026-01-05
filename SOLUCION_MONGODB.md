# Solución al Error de MongoDB Atlas

## Problema
Error: `Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted.`

## Solución 1: Agregar tu IP a MongoDB Atlas (Recomendado)

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Inicia sesión en tu cuenta
3. Selecciona tu cluster
4. Ve a **"Network Access"** (Acceso de red) en el menú lateral
5. Haz clic en **"Add IP Address"** (Agregar dirección IP)
6. Tienes dos opciones:
   - **Opción A (Más fácil):** Haz clic en **"Allow Access from Anywhere"** y agrega `0.0.0.0/0`
     - ⚠️ Menos seguro, pero funciona para desarrollo
   - **Opción B (Más seguro):** Haz clic en **"Add Current IP Address"** para agregar solo tu IP actual
7. Haz clic en **"Confirm"**
8. Espera unos minutos para que los cambios se apliquen

## Solución 2: Usar MongoDB Local (Alternativa)

Si prefieres usar MongoDB local en lugar de Atlas:

1. **Instala MongoDB Community Server:**
   - Descarga desde: https://www.mongodb.com/try/download/community
   - Instala MongoDB en Windows
   - MongoDB se ejecutará como servicio automáticamente

2. **Actualiza el archivo `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/chatfit
   ```

3. **Reinicia el servidor de desarrollo:**
   ```powershell
   npm run dev
   ```

## Verificar la conexión

Después de aplicar cualquiera de las soluciones:
1. Reinicia el servidor de desarrollo (Ctrl + C, luego `npm run dev`)
2. Intenta iniciar sesión nuevamente
3. Si todo funciona, deberías poder iniciar sesión sin errores

