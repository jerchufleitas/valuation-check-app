# Plan de Implementación: Verificación de Cuenta Firebase

Este documento detalla los pasos para integrar la verificación de correo electrónico nativa de Firebase en la aplicación _Valuation Check_.

## 1. Lógica de Autenticación (`authService.js`)

Debemos añadir dos funciones clave al servicio de autenticación: una para enviar el correo y otra para recargar el estado del usuario (necesario para detectar cuando el usuario ya verificó).

```javascript
// src/firebase/authService.js

import { sendEmailVerification } from "firebase/auth";

// enviar correo de verificación
export const sendVerification = async (user) => {
  if (!user) throw new Error("No hay usuario activo");

  // Configuración opcional de la URL de redirección
  const actionCodeSettings = {
    url: window.location.origin + "/settings", // Redirige al usuario a Settings tras verificar
    handleCodeInApp: true,
  };

  await sendEmailVerification(user, actionCodeSettings);
};

// Forzar la actualización del usuario para chequear el nuevo estado
export const refreshUserStatus = async (user) => {
  await user.reload(); // Pide a Firebase los datos frescos
  return user.emailVerified;
};
```

## 2. Integración en UI (`SettingsPage.jsx`)

Modificar la tarjeta "Cuenta y Apariencia" para mostrar el estado real y el botón de acción.

### Estado Actual:

Actualmente muestra un badge estático hardcodeado:
`<div className="... text-green-600 ...">Cuenta Verificada</div>`

### Nuevo Comportamiento:

Implementaremos lógica condicional basada en `user.emailVerified`.

```jsx
// Pseudocódigo para SettingsPage.jsx

import {
  sendVerification,
  refreshUserStatus,
} from "../../firebase/authService";

// ... dentro del componente ...
const [verificationSent, setVerificationSent] = useState(false);
const [isVerified, setIsVerified] = useState(user.emailVerified);

const handleVerify = async () => {
  try {
    await sendVerification(user);
    setVerificationSent(true);
    alert("Correo enviado. Revisa tu bandeja de entrada (y spam).");
  } catch (error) {
    console.error(error);
    alert("Error al enviar correo. Intenta nuevamente en unos minutos.");
  }
};

const checkStatus = async () => {
  const verified = await refreshUserStatus(user);
  setIsVerified(verified);
  if (verified) alert("¡Cuenta verificada exitosamente!");
};

// ... Renderizado en la sección de Cuenta ...

{
  isVerified ? (
    <div className="flex items-center gap-1 text-green-600 font-bold">
      <ShieldCheck size={12} /> Cuenta Verificada Oficialmente
    </div>
  ) : (
    <div className="space-y-2">
      <div className="flex items-center gap-1 text-amber-500 font-bold">
        <AlertTriangle size={12} /> Cuenta No Verificada
      </div>
      {!verificationSent ? (
        <button onClick={handleVerify} className="btn-verify">
          Enviar E-mail de Verificación
        </button>
      ) : (
        <div className="flex gap-2">
          <p className="text-xs text-slate-500">Correo enviado...</p>
          <button onClick={checkStatus} className="btn-check">
            Ya hice clic en el enlace
          </button>
        </div>
      )}
    </div>
  );
}
```

## 3. Configuración de la Plantilla (Consola Firebase)

Para que el correo se vea profesional, debes editarlo en la consola de Firebase.

1.  Ve a **Firebase Console** -> **Authentication** -> **Templates**.
2.  Selecciona **"Email address verification"**.
3.  Edita:
    - **Sender Name:** Cambiar a `Ochoa SRL` o `Valuation Check App`.
    - **Reply-To:** Tu correo de soporte.
    - **Subject:** "Verifica tu cuenta para acceder a Valuation Check".
    - **Message:** Puedes personalizar el mensaje, pero mantén la variable `XXX_URL_XXX` que es el enlace mágico.

## 4. Seguridad (Opcional pero Recomendado)

Si quieres que solo los usuarios verificados puedan guardar valoraciones, puedes añadir una regla en **Firestore Rules**:

```javascript
match /valuations/{docId} {
  allow create, update: if request.auth != null && request.auth.token.email_verified == true;
  allow read: if request.auth != null;
}
```

Esto bloquearía la escritura a usuarios no verificados, forzándolos a verificar su cuenta.
