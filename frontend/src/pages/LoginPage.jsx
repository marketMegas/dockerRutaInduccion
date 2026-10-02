import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoMegas from '../../../nuevoLOGOMegas.png';
import { Eye, EyeOff, LogIn, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

// `sendPasswordResetEmail` no tiene timeout propio: si la red se cuelga (una
// extension, un antivirus, el wifi a medias) la promesa no se resuelve y el
// boton se quedaba en "Enviando..." para siempre. Con esto, a los 15s se corta
// solo y se le puede decir algo al usuario.
const TIEMPO_LIMITE_MS = 15000;

const conTiempoLimite = (promesa, ms = TIEMPO_LIMITE_MS) => {
  let id;
  const limite = new Promise((_, rechazar) => {
    id = setTimeout(() => {
      const error = new Error('La solicitud tardó demasiado.');
      error.code = 'app/timeout';
      rechazar(error);
    }, ms);
  });
  return Promise.race([promesa, limite]).finally(() => clearTimeout(id));
};

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/cursos', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Correo o contraseña incorrectos. Por favor, verifica tus datos.');
          break;
        case 'auth/invalid-email':
          setError('El formato del correo electrónico no es válido.');
          break;
        case 'auth/too-many-requests':
          setError('Demasiados intentos fallidos. Por favor, intenta más tarde.');
          break;
        case 'auth/operation-not-allowed':
          setError('El proveedor de inicio de sesión con Correo y Contraseña está deshabilitado. Por favor, actívalo en la consola de Firebase (Authentication -> Sign-in method).');
          break;
        case 'auth/invalid-api-key':
          setError('La API Key de Firebase no es válida. Por favor, verifica la configuración de tus credenciales en el archivo src/config/firebase.js.');
          break;
        default:
          setError(`Error al iniciar sesión: ${err.message || err.code || 'Ocurrió un error inesperado.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Por favor, ingresa tu correo electrónico para restablecer tu contraseña.');
      return;
    }

    setLoading(true);
    try {
      await conTiempoLimite(resetPassword(email));
      // Firebase tiene activada la proteccion anti-enumeracion: responde OK
      // aunque la cuenta no exista y, en ese caso, no manda nada. Prometer
      // "se envio" seria mentir. Y como el remitente por defecto de Firebase
      // suele caer en spam, conviene avisarlo.
      setMessage('Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña. Revisa también la carpeta de spam.');
    } catch (err) {
      console.error('Reset password error:', err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No existe una cuenta con este correo.');
          break;
        case 'auth/invalid-email':
          setError('El formato del correo electrónico no es válido.');
          break;
        case 'auth/too-many-requests':
          setError('Demasiados intentos. Espera unos minutos e intenta de nuevo.');
          break;
        case 'auth/network-request-failed':
        case 'app/timeout':
          setError('No pudimos contactar el servicio de correo. Revisa tu conexión e intenta de nuevo.');
          break;
        case 'auth/operation-not-allowed':
          setError('La recuperación con Correo y Contraseña está deshabilitada. Contacta al administrador.');
          break;
        case 'auth/unauthorized-continue-uri':
        case 'auth/missing-continue-uri':
          setError('La dirección de recuperación no está autorizada. Contacta al administrador.');
          break;
        default:
          setError(`Error al enviar el correo: ${err.message || err.code || 'Ocurrió un error inesperado.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12 bg-white lg:border-r lg:border-gray-100">
        {/* Adorno: degradado diagonal naranja sobre el blanco */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(255,157,0,0.22) 0%, rgba(246,129,30,0.09) 45%, rgba(255,255,255,0) 100%)' }}
        />
        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <img
            src={logoMegas}
            alt="G-MAX Logo"
            className="mb-8 h-80 max-w-full w-auto object-contain"
          />

          <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight text-gray-900">
            Ruta de Inducción
          </h1>
          <p className="text-gray-500 text-lg max-w-sm leading-relaxed">
            Tu plataforma de aprendizaje profesional en tecnología autoglp y comercialización.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-xs">
            {[
              { value: '100%', label: 'Online' },
              { value: '24/7', label: 'Acceso' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-2xl font-black text-gray-900">{stat.value}</span>
                <span className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white relative overflow-y-auto">
        {/* Adorno: degradado diagonal naranja sobre el blanco */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(225deg, rgba(255,157,0,0.18) 0%, rgba(246,129,30,0.07) 45%, rgba(255,255,255,0) 100%)' }}
        />
        <div className="relative z-10 w-full max-w-md my-auto">

          {/* Logo móvil */}
          <div className="flex lg:hidden justify-center mb-8">
            <img
              src={logoMegas}
              alt="G-MAX Logo"
              className="h-48 max-w-full w-auto object-contain"
            />
          </div>

          {/* Encabezado del formulario */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {isRecovering ? 'Recuperar contraseña' : 'Bienvenido de vuelta'}
            </h2>
            <p className="mt-2 text-gray-500 text-sm">
              {isRecovering
                ? 'Ingresa tu correo electrónico registrado y te enviaremos un enlace para recuperar tu acceso.'
                : 'Ingresa tus credenciales para acceder a la plataforma.'}
            </p>
          </div>

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          {message && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm animate-fade-in">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{message}</p>
            </div>
          )}

          {/* Formulario */}
          {isRecovering ? (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="recovery-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#f6811e] focus:ring-2 focus:ring-[#f6811e]/20 transition-all"
                />
              </div>

              {/* Botón de recuperación */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? '#d98032'
                    : 'linear-gradient(135deg, #b45309 0%, #f6811e 100%)',
                  boxShadow: loading ? 'none' : '0 4px 15px rgba(246, 129, 30, 0.4)',
                }}
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => { setIsRecovering(false); setError(''); setMessage(''); }}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#f6811e] focus:ring-2 focus:ring-[#f6811e]/20 transition-all"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#f6811e] focus:ring-2 focus:ring-[#f6811e]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#f6811e] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Recordar / Olvidé contraseña */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#f6811e] focus:ring-[#f6811e] cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">Recordarme</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setIsRecovering(true); setError(''); setMessage(''); }}
                  className="text-sm font-semibold text-[#f6811e] hover:text-[#b45309] transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón de ingreso */}
              <button
                id="login-btn"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? '#d98032'
                    : 'linear-gradient(135deg, #b45309 0%, #f6811e 100%)',
                  boxShadow: loading ? 'none' : '0 4px 15px rgba(246, 129, 30, 0.4)',
                }}
                onMouseEnter={e => {
                  if (!loading) e.currentTarget.style.boxShadow = '0 6px 20px rgba(246, 129, 30, 0.6)';
                }}
                onMouseLeave={e => {
                  if (!loading) e.currentTarget.style.boxShadow = '0 4px 15px rgba(246, 129, 30, 0.4)';
                }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5" />
                )}
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>
          )}

          {/* Link a registro (Oculto en modo recuperación) */}
          {!isRecovering && (
            <p className="mt-6 text-center text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="font-bold text-[#f6811e] hover:text-[#b45309] transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          )}

          {/* Footer */}
          <p className="mt-4 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Megas. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
