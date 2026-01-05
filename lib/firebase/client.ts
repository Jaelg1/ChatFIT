import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

// Initialize Firebase (solo en el cliente)
// Durante el build, estos serán undefined, pero en el cliente estarán inicializados
let app: FirebaseApp
let auth: Auth
let googleProvider: GoogleAuthProvider

if (typeof window !== 'undefined') {
  // Solo inicializar en el cliente (navegador)
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
} else {
  // Para SSR/build time, crear objetos dummy que nunca se usarán
  // Estos solo existen para satisfacer TypeScript durante el build
  app = {} as FirebaseApp
  auth = {} as Auth
  googleProvider = {} as GoogleAuthProvider
}

export { auth, googleProvider }
export default app

