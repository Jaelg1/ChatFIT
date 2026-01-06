import 'client-only'

// NO importar firebase/app aquí - usar dynamic import
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
}

let _app: any = null

export async function getFirebaseApp() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be used on the client side')
  }
  
  if (!_app) {
    const { initializeApp, getApps } = await import('firebase/app')
    _app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  }
  
  return _app
}
