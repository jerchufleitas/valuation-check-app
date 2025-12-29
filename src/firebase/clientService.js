import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

const COLLECTION_NAME = 'clients';

/**
 * Guarda o actualiza un perfil de cliente en Firestore.
 */
export const saveClient = async (clientData, userId) => {
  try {
    if (!userId) throw new Error("No hay un usuario autenticado para guardar datos");
    
    const clientId = clientData.id || crypto.randomUUID();
    const docRef = doc(db, COLLECTION_NAME, clientId);
    
    const dataToSave = {
      ...clientData,
      id: clientId,
      userId,
      updatedAt: new Date().toISOString(),
      serverUpdatedAt: serverTimestamp()
    };

    if (!clientData.createdAt) {
      dataToSave.createdAt = new Date().toISOString();
    }

    await setDoc(docRef, dataToSave, { merge: true });
    return clientId;
  } catch (error) {
    console.error("Error al guardar cliente en Firebase:", error);
    throw error;
  }
};

/**
 * Obtiene todos los clientes cargados por el usuario.
 */
export const getClients = async (userId) => {
  try {
    if (!userId) return [];
    
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return results.sort((a, b) => a.razonSocial.localeCompare(b.razonSocial));
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
};

/**
 * Elimina un cliente.
 */
export const deleteClient = async (clientId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, clientId));
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    throw error;
  }
};
