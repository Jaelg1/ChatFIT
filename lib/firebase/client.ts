import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
}

// Lazy initialization - solo se inicializa cuando se accede
let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let googleProviderInstance: GoogleAuthProvider | null = null

function initFirebase() {
  if (typeof window === 'undefined') {
    return
  }

  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }
    authInstance = getAuth(app)
    googleProviderInstance = new GoogleAuthProvider()
  }
}

// Crear objetos con getters que inicializan solo cuando se acceden
const authProxy = {
  get currentUser() {
    initFirebase()
    return authInstance?.currentUser || null
  },
  onAuthStateChanged: (callback: any) => {
    initFirebase()
    if (!authInstance) throw new Error('Auth not initialized')
    return authInstance.onAuthStateChanged(callback)
  },
} as any

const googleProviderProxy = {} as any

// Usar Proxy para interceptar todas las propiedades
export const auth = new Proxy(authProxy, {
  get(target, prop) {
    initFirebase()
    if (!authInstance) {
      throw new Error('Firebase Auth not initialized. Make sure you are using this in a client component.')
    }
    const value = (authInstance as any)[prop]
    if (typeof value === 'function') {
      return value.bind(authInstance)
    }
    return value
  },
}) as Auth

export const googleProvider = new Proxy(googleProviderProxy, {
  get(_target, prop) {
    initFirebase()
    if (!googleProviderInstance) {
      throw new Error('Google Provider not initialized. Make sure you are using this in a client component.')
    }
    const value = (googleProviderInstance as any)[prop]
    if (typeof value === 'function') {
      return value.bind(googleProviderInstance)
    }
    return value
  },
}) as GoogleAuthProvider

export default new Proxy({} as FirebaseApp, {
  get(_target, prop) {
    initFirebase()
    if (!app) {
      throw new Error('Firebase App not initialized. Make sure you are using this in a client component.')
    }
    const value = (app as any)[prop]
    if (typeof value === 'function') {
      return value.bind(app)
    }
    return value
  },
}) as FirebaseApp

