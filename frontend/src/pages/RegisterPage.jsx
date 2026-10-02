import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoMegas from '../../../nuevoLOGOMegas.png';
import { Eye, EyeOff, UserPlus, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Validaciones de contraseña en tiempo real
  const passwordChecks = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };
  const passwordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Por favor, ingresa tu nombre completo.');
      return;
    }
    if (!passwordValid) {
      setError('La contraseña no cumple los requisitos mínimos de seguridad.');
      return;
    }
    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      // `register` (registrarSiEstaAutorizado, en AuthContext) consulta a Django
      // si el correo esta dado de alta ANTES de crear la cuenta en Firebase.
      await register(formData.email, formData.password, formData.name.trim());
      navigate('/cursos', { replace: true });
    } catch (err) {
      console.error('Register error:', err);
      switch (err.code) {
        // El caso nuevo y el que mas se va a ver: hay que estar dado de alta en
        // /admin > Authentication and Authorization > Users para poder
        // registrarse. El mensaje lo arma el backend y no se reescribe aca.
        case 'sin_alta':
          setError(err.message);
          break;
        case 'auth/email-already-in-use':
          // Este caso casi siempre es de verdad "ya te registraste en un
          // intento anterior y no llegaste a entrar", no "otro usuario tiene tu
          // correo". Por eso el mensaje ofrece las dos salidas y no solo
          // "inicia sesión": quien no recuerda la clave queda sin salida visible
          // si no se la nominamos.
          setError('Ya tenés una cuenta con este correo en Firebase. Iniciá sesión con tu contraseña, o usá "¿Olvidaste tu contraseña?" para crear una nueva. Ojo: la contraseña de esta plataforma es la de Firebase, no la que figura en el backend.');
          break;
        case 'auth/invalid-email':
          setError('El formato del correo electrónico no es válido.');
          break;
        case 'auth/weak-password':
          setError('La contraseña es demasiado débil. Usa al menos 8 caracteres.');
          break;
        case 'auth/operation-not-allowed':
          setError('El proveedor de inicio de sesión con Correo y Contraseña está deshabilitado. Por favor, actívalo en la consola de Firebase (Authentication -> Sign-in method).');
          break;
        case 'auth/invalid-api-key':
          setError('La API Key de Firebase no es válida. Por favor, verifica la configuración de tus credenciales en el archivo src/config/firebase.js.');
          break;
        default:
          setError(`Error al registrarse: ${err.message || err.code || 'Ocurrió un error inesperado.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Panel izquierdo - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12 text-white"
        style={{
          background: 'linear-gradient(135deg, #b45309 0%, #f6811e 50%, #ff9d00 100%)',
        }}
      >
        {/* Círculos decorativos */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #f6811e 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-8 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
            <img
              src={logoMegas}
              alt="Logo de Megas"
              className="h-16 w-auto object-contain filter brightness-0 invert"
            />
          </div>

          <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight">
            Únete a la <span className="text-white">Ruta de Inducción</span>
          </h1>
          <p className="text-white/75 text-lg max-w-sm leading-relaxed">
            Crea tu cuenta y accede a todos los cursos de formación profesional.
          </p>

          {/* Beneficios */}
          <div className="mt-10 space-y-3 w-full max-w-xs text-left">
            {[
              'Seguimiento de tu progreso en tiempo real',
              'Certificados de completion',
              'Soporte del equipo',
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                <CheckCircle2 className="w-5 h-5 text-[#f6811e] flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#f8fafc] overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Logo móvil */}
          <div className="flex lg:hidden justify-center mb-8">
            <img
              src={logoMegas}
              alt="Logo de Megas"
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Encabezado */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Crear cuenta
            </h2>
            <p className="mt-2 text-gray-500 text-sm">
              Completa el formulario para comenzar tu formación.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre completo */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nombre completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Juan García"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#f6811e] focus:ring-2 focus:ring-[#f6811e]/20 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@correo.com"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#f6811e] focus:ring-2 focus:ring-[#f6811e]/20 transition-all"
              />
              {/* Aviso antes de que el alumno escriba la contraseña: el alta se
                  valida al final, y descubrirlo después de inventar una
                  contraseña es la forma más enojosa de enterarse. */}
              <p className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#f6811e]" aria-hidden="true" />
                <span>
                  Solo funciona con el correo con el que Recursos Humanos te dio de
                  alta en la plataforma. Usá ese mismo.
                </span>
              </p>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mín. 8 caracteres"
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

              {/* Indicadores de seguridad */}
              {formData.password.length > 0 && (
                <div className="mt-2.5 space-y-1.5 animate-fade-in">
                  {[
                    { check: passwordChecks.length, label: 'Mínimo 8 caracteres' },
                    { check: passwordChecks.upper, label: 'Al menos una mayúscula' },
                    { check: passwordChecks.number, label: 'Al menos un número' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors ${item.check ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={`text-xs font-medium transition-colors ${item.check ? 'text-green-600' : 'text-gray-400'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  className={`w-full px-4 py-3 pr-12 bg-white border rounded-xl text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    formData.confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-green-400 focus:border-green-400 focus:ring-green-400/20'
                        : 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
                      : 'border-gray-200 focus:border-[#f6811e] focus:ring-[#f6811e]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#f6811e] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword.length > 0 && (
                <p className={`mt-1.5 text-xs font-medium ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordsMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                </p>
              )}
            </div>

            {/* Términos */}
            <div className="flex items-start gap-2.5">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#f6811e] focus:ring-[#f6811e] cursor-pointer flex-shrink-0"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                Acepto los{' '}
                <a href="#" className="text-[#f6811e] font-semibold hover:underline">Términos de uso</a>{' '}
                y la{' '}
                <a href="#" className="text-[#f6811e] font-semibold hover:underline">Política de privacidad</a>
              </label>
            </div>

            {/* Botón de registro */}
            <button
              id="register-btn"
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
                <UserPlus className="w-5 h-5" />
              )}
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          {/* Link a login */}
          <p className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-bold text-[#f6811e] hover:text-[#b45309] transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Universidad. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
