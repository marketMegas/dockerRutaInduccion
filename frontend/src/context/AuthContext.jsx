import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { api } from '../services/api';

// Dos sesiones distintas, y no es lo mismo:
//
// - La sesion de FIREBASE prueba quien es. La abre el login con correo y
//   contrasena y vive en el navegador.
// - El ALTA en Django decide quien puede hacer el curso. Son los User que da
//   de alta RH en /admin > Authentication and Authorization > Users.
//
// Haber iniciado sesion no alcanza para entrar: hay que estar en las dos. Por
// eso `currentUser` no se usa solo para decidir si se muestra el panel, sino
// que va acompanado de `autorizado`, y ProtectedRoute mira las dos cosas.
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // `autorizado` es `true`/`false` segun lo que dijo el backend. Todavia no se
  // consulto se reconoce por `verificando` (abajo), no por un `null` inicial:
  // ese `null` obligaba a que cada consumidor se acordara de distinguir tres
  // estados, y el que se olvidaba fstaba del todo en vez de mostrar el spinner.
  const [autorizado, setAutorizado] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState('');

  // De QUE usuario es la respuesta de `verificar` que hay en `autorizado`.
  // Guarda el uid y no un booleano de "ya consulte", porque la pregunta que
  // tiene que responder ProtectedRoute es "esa autorizacion es de ESTE usuario":
  // al cerrar sesion y abrirla con otra cuenta, `autorizado` sigue siendo el
  // del anterior y sin esto el alumno nuevo entraria sin que nadie lo haya
  // mirado.
  //
  // Se deriva, no se mantiene con un useState propio: `verificando` no puede
  // quedar desfasado respecto de `currentUser` porque se calcula en cada render.
  const [uidVerificado, setUidVerificado] = useState(null);
  const verificando = !!currentUser && uidVerificado !== currentUser.uid;

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    }, (error) => {
      console.error("Error in onAuthStateChanged:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Cada vez que hay usuario (o se cierra la sesion) se consulta si esta dado
  // de alta. Va aparte del onAuthStateChanged y no adentro a proposito: el
  // callback de Firebase es sincrono y no debe esperar una red, y ademas esta
  // consulta se puede repetir sin tocar la sesion de Firebase.
  useEffect(() => {
    if (loading) return undefined;

    if (!currentUser) {
      setAutorizado(false);
      setMotivoBloqueo('');
      // Tambien se olvida el uid verificado: si el mismo alumno vuelve a
      // entrar, `autorizado` arranca en false y sin esto se leeria como
      // "ya se sabe que no esta dado de alta".
      setUidVerificado(null);
      return undefined;
    }

    let vigente = true;

    (async () => {
      try {
        const r = await api.verificarAcceso();
        if (!vigente) return;
        setAutorizado(r.autorizado === true);
        setMotivoBloqueo(r.autorizado ? '' : (r.error || 'Tu cuenta no esta habilitada.'));
      } catch (error) {
        if (!vigente) return;
        // Un 503 (Google caido, o el backend sin FIREBASE_PROJECT_ID) NO es
        // "no estas autorizado": es un fallo del servidor. Decirle al alumno
        // que contacte a RRHH cuando el problema es nuestro lo manda a dar
        // vueltas a un lado que no lo arregla, asi que se distingue el 401
        // (sesion que no se pudo probar) del resto.
        //
        // El `codigo` y el `detalle` que manda el backend van a la consola y no
        // a pantalla a proposito: la pantalla es para el alumno y esto es para
        // quien esta arreglando. Sin esto, "no se pudo verificar la sesion" era
        // un mensaje unico para dos fallos que no se arreglan igual.
        console.error(
          `[AuthContext] fallo al verificar el acceso: status=${error.status} `
          + `codigo=${error.codigo || 'sin_codigo'} `
          + `detalle=${error.detalle || 'sin_detalle'}`
        );
        setAutorizado(false);
        setMotivoBloqueo(
          error.status === 401
            ? 'Tu sesion no se pudo verificar. Vuelve a iniciar sesion.'
            : 'No pudimos verificar tu acceso en este momento. Intenta de nuevo en unos minutos.'
        );
      } finally {
        // Se marca el uid tanto si salio bien como si fallo: `verificando`
        // describe "todavia no se sabe", y despues de un 503 el alumno SIEMPRE
        // esta sabendo que no se pudo comprobar. Dejarlo en true lo dejaria
        // mirando un spinner eterno.
        if (vigente) setUidVerificado(currentUser.uid);
      }
    })();

    return () => { vigente = false; };
  }, [currentUser, loading]);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Antes de crear la cuenta se consulta a Django si ese correo esta dado de
  // alta. Sin esta comprobacion, el alta en Firebase seria libre y cualquiera
  // podria abrirse una cuenta con el correo de un alumno ya registrado; como
  // el criterio de la lista blanca es el correo, eso era entrar como el.
  const registrarSiEstaAutorizado = async (email, password, displayName) => {
    const autorizado = await api.correoAutorizado(email);
    if (!autorizado) {
      const error = new Error(
        'Ese correo no esta habilitado para la Ruta de Induccion. Pide a Recursos Humanos que te de de alta e intentalo de nuevo.'
      );
      error.codigo = 'sin_alta';
      throw error;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Save display name in Firebase profile
    await updateProfile(userCredential.user, { displayName });
    // Refresh currentUser so displayName is available immediately
    setCurrentUser({ ...userCredential.user, displayName });
    return userCredential;
  };

  const logout = () => {
    setAutorizado(false);
    setMotivoBloqueo('');
    // Sin esto, si el mismo correo vuelve a entrar un rato despues veria directo
    // la pantalla de acceso restringido sin volver a preguntar a Django:
    // `autorizado` arrancaria en false con el uid ya marcado como verificado y
    // `verificando` en false tambien.
    setUidVerificado(null);
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    currentUser,
    login,
    register: registrarSiEstaAutorizado,
    logout,
    resetPassword,
    loading,
    autorizado,
    verificando,
    motivoBloqueo,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
