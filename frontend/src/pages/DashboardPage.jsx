import heroImage from '../../nuevoLOGOMegas.png';

// La Ruta de Inducción quedó reducida a su título. Antes esta página traía
// ~1000 líneas de contenido fijo en el código (objetivo, descripción del
// autoglp, stakeholders, logos de partners, estrategias, tabla comparativa de
// combustibles, perfil del vendedor) que no se podía editar sin tocar el
// frontend y reaparecía igual en cualquier despliegue.
//
// Si ese contenido se vuelve a necesitar, la vía es crearlo desde /admin y
// leerlo de la API, igual que los cursos: no volver a escribirlo aquí.
export const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-8 w-full max-w-[1000px] mx-auto">

      {/* Columna Principal */}
      <div className="w-full flex flex-col gap-8">

        {/* Título principal */}
        <div className="mb-4 flex flex-col items-center">
          <h1 className="flex flex-col leading-[0.85] tracking-tighter font-black text-center">
            <span className="text-[52px] sm:text-[72px] md:text-[92px] lg:text-[108px] text-[#424242] uppercase">
              Ruta de
            </span>
            <span className="text-[48px] sm:text-[66px] md:text-[84px] lg:text-[100px] text-[#f6811e] lowercase">
              Inducción
            </span>
          </h1>
          <p className="mt-6 max-w-3xl text-center text-xl sm:text-2xl md:text-3xl font-medium leading-relaxed text-gray-600">
            Bienvenidos a nuestra Ruta de Inducción. Acá encontrarás recursos para conocernos mejor.
          </p>
          <img
            src={heroImage}
            alt="Bienvenidos a la Ruta de Inducción"
            className="mt-8 w-full max-w-4xl rounded-2xl object-cover"
          />
        </div>

      </div>
    </div>
  );
};
