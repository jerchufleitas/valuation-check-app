import { db } from './config';
import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';

const COLLECTION_NAME = 'userSettings';

/**
 * Guarda o actualiza la configuración de un usuario.
 */
export const saveUserSettings = async (userId, settingsData) => {
  try {
    if (!userId) throw new Error("No hay un usuario autenticado");

    const docRef = doc(db, COLLECTION_NAME, userId);
    
    const dataToSave = {
      ...settingsData,
      userId,
      updatedAt: new Date().toISOString(),
      serverUpdatedAt: serverTimestamp()
    };

    await setDoc(docRef, dataToSave, { merge: true });
    return true;
  } catch (error) {
    console.error("Error al guardar configuración:", error);
    throw error;
  }
};

/**
 * Obtiene la configuración de un usuario.
 */
export const getUserSettings = async (userId) => {
  try {
    if (!userId) return null;
    
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    return null;
  }
};
