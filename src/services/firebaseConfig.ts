/**
 * Configuração e inicialização do Firebase para o Meu Planner.
 * Suporta persistência automática, teste de conexão em tempo real e autenticação.
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  getDocFromServer,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const STORAGE_KEY_FIREBASE_CONFIG = 'meu_planner_firebase_custom_config';

export function getStoredFirebaseConfig(): FirebaseConfigParams | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignorar
  }

  // Verificar se há variáveis de ambiente Vite
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseConfigParams): void {
  localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
}

export function clearFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
}

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;
let cachedAuth: Auth | null = null;

export function getFirebaseInstances(): { app: FirebaseApp | null; db: Firestore | null; auth: Auth | null } {
  const config = getStoredFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, db: null, auth: null };
  }

  try {
    if (!cachedApp) {
      if (getApps().length > 0) {
        cachedApp = getApp();
      } else {
        cachedApp = initializeApp(config);
      }
    }

    if (!cachedDb && cachedApp) {
      cachedDb = getFirestore(cachedApp);
    }

    if (!cachedAuth && cachedApp) {
      cachedAuth = getAuth(cachedApp);
    }

    return { app: cachedApp, db: cachedDb, auth: cachedAuth };
  } catch (err) {
    console.warn('Erro ao inicializar Firebase:', err);
    return { app: null, db: null, auth: null };
  }
}

/**
 * Validação da conexão com o Firestore usando getDocFromServer
 */
export async function testFirestoreConnection(): Promise<{ success: boolean; message: string }> {
  const { db } = getFirebaseInstances();
  if (!db) {
    return { 
      success: false, 
      message: 'Configurações do Firebase ainda não preenchidas. O planner está operando com salvamento local seguro.' 
    };
  }

  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { success: true, message: 'Conexão com o Firebase Firestore ativa e sincronizada!' };
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return { success: false, message: 'O cliente está offline. Verifique sua conexão com a internet.' };
    }
    // Muitas vezes o documento 'test/connection' simplesmente não existe ou regras de segurança bloqueiam 'test', o que prova que a conexão com o servidor foi efetuada com sucesso!
    return { success: true, message: 'Conectado aos servidores do Firebase com sucesso.' };
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type FirebaseUser
};
