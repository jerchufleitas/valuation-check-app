import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

const COLLECTION_NAME = 'valuations';

/**
 * Guarda o actualiza una valoración en Firestore.
 * Utiliza el ID generado por la app para mantener consistencia.
 */
export const saveValuation = async (valuationData, userId) => {
  try {
    const { session } = valuationData;
    const docId = session.id;
    
    if (!docId) throw new Error("La sesión no tiene un ID válido");
    if (!userId) throw new Error("No hay un usuario autenticado para guardar datos");

    const docRef = doc(db, COLLECTION_NAME, docId);
    
    const dataToSave = {
      ...session,
      userId, // Vinculamos el registro al usuario de Google
      serverUpdatedAt: serverTimestamp()
    };

    await setDoc(docRef, dataToSave, { merge: true });
    return docId;
  } catch (error) {
    console.error("Error al guardar en Firebase:", error);
    throw error;
  }
};

/**
 * Obtiene todas las valoraciones ordenadas por fecha de actualización.
 */
export const getValuations = async (userId) => {
  try {
    if (!userId) return [];
    
    // Filtramos para que el usuario A solo vea lo del usuario A
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Ordenar localmente por fecha (descendente)
    return results.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  } catch (error) {
    console.error("Error al obtener valoraciones:", error);
    return [];
  }
};

/**
 * Obtiene una valoración específica por su ID.
 */
export const getValuationById = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error al obtener valoración por ID:", error);
    throw error;
  }
};
