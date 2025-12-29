import { db } from './config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

const COLLECTION_NAME = 'valuations';

/**
 * Guarda o actualiza una valoración en Firestore.
 * Utiliza el ID generado por la app para mantener consistencia.
 */
export const saveValuation = async (valuationData) => {
  try {
    const { session } = valuationData;
    const docId = session.id;
    
    if (!docId) throw new Error("La sesión no tiene un ID válido");

    const docRef = doc(db, COLLECTION_NAME, docId);
    
    // Agregamos timestamp de servidor para mayor precisión en la nube
    const dataToSave = {
      ...session,
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
export const getValuations = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
