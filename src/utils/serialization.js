/**
 * Convierte cualquier dato en un Objeto Plano (POJO) eliminando funciones y prototipos.
 * Vital para la compatibilidad con Firebase Firestore.
 */
export const toPlainObject = (data) => {
  return JSON.parse(JSON.stringify(data));
};
