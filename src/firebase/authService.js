import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification
} from "firebase/auth";
import { app } from "./config";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error detallado de Firebase Auth:", error.code, error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const sendVerificationEmail = async (user) => {
  if (!user) throw new Error("No hay usuario activo");
  
  // URL flexible para volver a la app tras verificar (opcional, Firebase usa default si es null)
  const actionCodeSettings = {
    url: window.location.origin, 
    handleCodeInApp: true,
  };

  await sendEmailVerification(user, actionCodeSettings);
};

export const refreshUserStatus = async (user) => {
  if (user) {
    await user.reload();
    return user.emailVerified;
  }
  return false;
};
