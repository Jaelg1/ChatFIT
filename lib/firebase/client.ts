import 'client-only'

import { initializeApp, getApps } from 'firebase/app'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
}

// Inicializa una sola vez en el browser
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export default app

// Los componentes deben usar dynamic imports directamente:
// const { getAuth, GoogleAuthProvider } = await import('firebase/auth')
// const auth = getAuth(app)
// const googleProvider = new GoogleAuthProvider()
