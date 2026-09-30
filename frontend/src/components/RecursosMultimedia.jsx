import React, { useState } from 'react';
import { Play, X, Video, Download, FileText } from 'lucide-react';

const course1Resources = [
  {
    id: 29,
    title: "Ley 2128 de 2021",
    type: "PDF",
    pdfUrl: "https://jumpshare.com/share/R7IY9dS9FfvyMbf1tprg",
    thumbnail: "https://images.unsplash.com/photo-1623276527153-fa38c1616b05?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {


    id: 27,
    title: "NORMA NFPA 54 ANSI Z223.1",
    type: "PDF",
    pdfUrl: "https://smallpdf.com/es/file#s=f646908b-387b-4a45-bcdf-b459190ff708",
    thumbnail: "https://images.unsplash.com/photo-1623276527153-fa38c1616b05?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: 28,
    title: "NORMA TÉCNICA COLOMBIANA - NTC 3853-1",
    type: "PDF",
    pdfUrl: "https://smallpdf.com/es/file#s=f1c1b52f-9f18-4d0c-a704-4d3425c353b4",
    thumbnail: "https://images.unsplash.com/photo-1623276527153-fa38c1616b05?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {

    id: 1,
    title: "Conoce nuestro servicio de instalación de Gasmax autoglp",
    type: "Video",
    youtubeId: "oXaUJS4FjIU",
    thumbnail: "https://img.youtube.com/vi/oXaUJS4FjIU/maxresdefault.jpg"
  },

  {
    id: 22,
    title: "Filtro fase gaseosa",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/37SgWWj.jpeg",
    thumbnail: "https://i.imgur.com/37SgWWj.jpeg",
    description: "Filtra el autoglp y esta dotado de un sensor que mide la temperatura y la presión del gas y la carga del motor"
  },
  {
    id: 25,
    title: "Regulador",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/p1h24Sc.jpeg",
    thumbnail: "https://i.imgur.com/p1h24Sc.jpeg",
    description: "Pasa el autoglp de estado gaseoso y reduce y regula su presión."
  },

  {
    id: 26,
    title: "Sensor indicador de nivel",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/bWVKWTJ.jpeg",
    thumbnail: "https://i.imgur.com/bWVKWTJ.jpeg",
    description: "Indica el nivel de autoglp disponible en el tanque"
  },
  {
    id: 10,
    title: "Multiválvula de tanque",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/47no0aO.jpeg",
    thumbnail: "https://i.imgur.com/47no0aO.jpeg",
    description: "Permite el pado del autoglp que entra y sale del depósito, mide el nivel de gas, consta de varias válvulas de seguridad"
  },
  {
    id: 8,
    title: "Valvula carga o abastecimiento",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/yyvVbun.jpeg",
    thumbnail: "https://i.imgur.com/yyvVbun.jpeg",
    description: "Valvula antiretorno por la que se llena el depósito"
  },
  {
    id: 16,
    title: "Centralita de gas",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/1GYZBYi.jpeg",
    thumbnail: "https://i.imgur.com/1GYZBYi.jpeg",
    description: "Recibe las señales de los distintos sensores y calcula y garantiza los parametros para el funcionamiento con autoglp"
  },
  {
    id: 13,
    title: "Riel de inyectores",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/V6dzAD8.jpeg",
    thumbnail: "https://i.imgur.com/V6dzAD8.jpeg",
    description: "Inyecta la cantidad de autoglp correcta en cada cilindro"
  },
  {
    id: 18,
    title: "Sensor de presión (MAP)",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/wPSxrCg.jpeg",
    thumbnail: "https://i.imgur.com/wPSxrCg.jpeg",
    description: "Mide la presion del gas y calcula la cantidad del gas a inyectar a traves de los inyectores"
  },
  {
    id: 26,
    title: "Llave conmutadora",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/tqvu2BF.jpeg",
    thumbnail: "https://i.imgur.com/tqvu2BF.jpeg",
    description: "Permite la conmutación entre autoglp y gasolina e indica el nivel de gas en el deposito"
  },
  {
    id: 17,
    title: "Acoples para lineas de conducción",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/486qNqL.jpeg",
    thumbnail: "https://i.imgur.com/486qNqL.jpeg",
    description: "Terminal de conexion de mangueras a la valvula de carga y al regulador"
  },

  {
    id: 24,
    title: "Tanque Toroidal - cilindrico",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/m4OfuDe.jpeg",
    thumbnail: "https://i.imgur.com/m4OfuDe.jpeg",
    description: "Contiene el autoglp en fase liquida y gaseosa"
  }

];



const course2Resources = [
  {
    id: 13,
    title: "Recurso 1",
    type: "Video",
    youtubeId: "swu4iTgSuUA",
    thumbnail: "https://img.youtube.com/vi/swu4iTgSuUA/maxresdefault.jpg"
  },
  {
    id: 1,
    title: "Recurso 02",
    type: "Short informativo",
    youtubeId: "6v9heEbWuLk",
    thumbnail: "https://img.youtube.com/vi/6v9heEbWuLk/maxresdefault.jpg"
  },
  {
    id: 2,
    title: "Recurso 03",
    type: "Short informativo",
    youtubeId: "XVsKusLX4kg",
    thumbnail: "https://img.youtube.com/vi/XVsKusLX4kg/maxresdefault.jpg"
  },
  {
    id: 3,
    title: "Recurso 04",
    type: "Short informativo",
    youtubeId: "RW_B7rHNtTg",
    thumbnail: "https://img.youtube.com/vi/RW_B7rHNtTg/maxresdefault.jpg"
  },
  {
    id: 4,
    title: "Recurso 05",
    type: "Short informativo",
    youtubeId: "OYF4dq0mTEw",
    thumbnail: "https://img.youtube.com/vi/OYF4dq0mTEw/maxresdefault.jpg"
  },
  {
    id: 5,
    title: "Recurso 06",
    type: "Short informativo",
    youtubeId: "8dlJt93mS7I",
    thumbnail: "https://img.youtube.com/vi/8dlJt93mS7I/maxresdefault.jpg"
  },
  {
    id: 6,
    title: "Recurso 07",
    type: "Short informativo",
    youtubeId: "GsP-nIXHvWY",
    thumbnail: "https://img.youtube.com/vi/GsP-nIXHvWY/maxresdefault.jpg"
  },

  {
    id: 7,
    title: "Recurso 08",
    type: "Short informativo",
    youtubeId: "oU2qJpHZF7Y",
    thumbnail: "https://img.youtube.com/vi/oU2qJpHZF7Y/maxresdefault.jpg"
  },
  {
    id: 8,
    title: "Recurso 09",
    type: "Short informativo",
    youtubeId: "01625BFBVjs",
    thumbnail: "https://img.youtube.com/vi/01625BFBVjs/maxresdefault.jpg"
  },
  {
    id: 9,
    title: "Recurso 10",
    type: "Short informativo",
    youtubeId: "2hEzQrsF7KQ",
    thumbnail: "https://img.youtube.com/vi/2hEzQrsF7KQ/maxresdefault.jpg"
  },
  {
    id: 10,
    title: "Recurso 11",
    type: "Short informativo",
    youtubeId: "Lpoq41DebBs",
    thumbnail: "https://img.youtube.com/vi/Lpoq41DebBs/maxresdefault.jpg"
  },
  {
    id: 11,
    title: "Recurso 12",
    type: "Short informativo",
    youtubeId: "64lVbdY1H6s",
    thumbnail: "https://img.youtube.com/vi/64lVbdY1H6s/maxresdefault.jpg"
  }
];

const course3Resources = [
  {
    id: 4,
    title: "Short Informativo: Postventa AutoGLP",
    type: "Short informativo",
    youtubeId: "cAPkwx2CD4o",
    thumbnail: "https://img.youtube.com/vi/cAPkwx2CD4o/maxresdefault.jpg"
  },
  {
    id: 5,
    title: "Short Informativo: Servicio GMAX",
    type: "Short informativo",
    youtubeId: "xvTHXT4CQy4",
    thumbnail: "https://img.youtube.com/vi/xvTHXT4CQy4/maxresdefault.jpg"
  },
  {
    id: 6,
    title: "Short Informativo: Fidelización GLP",
    type: "Short informativo",
    youtubeId: "ej0L_bVftpA",
    thumbnail: "https://img.youtube.com/vi/ej0L_bVftpA/maxresdefault.jpg"
  }
];

// Bibliotecas que aun viven en el codigo porque son material de produccion ya
// publicado. Un curso que no este en este mapa NO debe caer en course1Resources:
// antes el ternario terminaba en course1Resources, asi que todo curso nuevo
// mostraba los 14 recursos GLP del curso 1.
const RECURSOS_POR_CURSO = {
  1: course1Resources,
  2: course2Resources,
  3: course3Resources,
};

export const RecursosMultimedia = ({ courseId }) => {
  const [selectedResource, setSelectedResource] = useState(null);

  const currentResources = RECURSOS_POR_CURSO[courseId] ?? [];

  const openModal = (resource) => {
    if (resource.type === 'PDF') {
      window.open(resource.pdfUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setSelectedResource(resource);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedResource(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="w-full animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="mb-10 flex flex-col items-start gap-3">
        <span className="bg-[#5fbd44]/10 text-[#5fbd44] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-[#5fbd44]/20">
          Biblioteca Multimedia
        </span>
        <h2 className="text-4xl font-black text-[#f6811e] tracking-tight">
          Recursos del Curso {courseId}
        </h2>
        <p className="text-gray-500 font-medium text-lg max-w-2xl">
          Contenido complementario y material audiovisual del curso.
        </p>
      </div>

      {/* GRID */}
      {currentResources.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-dashed border-gray-200 px-6 py-16 text-center">
          <Play className="w-12 h-12 mx-auto text-gray-300" />
          <h3 className="mt-4 text-xl font-black text-gray-800">
            Este curso aún no tiene recursos
          </h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Cuando se carguen videos, imágenes o documentos de este curso,
            aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentResources.map((resource) => (
          <div
            key={resource.id}
            onClick={() => openModal(resource)}
            className="group relative bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#5fbd44]/20 transition-all duration-500 cursor-pointer border border-gray-100 hover:-translate-y-2"
          >
            {/* THUMBNAIL CONTAINER */}
            <div className={`relative ${resource.type === 'Short informativo' ? 'aspect-[9/16] max-h-[480px]' : 'aspect-[9/16] md:aspect-video'} overflow-hidden`}>
              <img
                src={resource.thumbnail}
                alt={resource.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80";
                }}
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-[#f6811e]/40 group-hover:bg-[#f6811e]/20 transition-colors duration-500 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transform transition-all duration-500 group-hover:scale-125 group-hover:bg-[#5fbd44] group-hover:border-[#5fbd44] shadow-xl">
                  {resource.type === 'PDF'
                    ? <Download className="w-8 h-8 text-white" />
                    : <Play className="w-8 h-8 text-white fill-current ml-1" />
                  }
                </div>
              </div>
            </div>

            {/* INFO */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2 text-[#5fbd44]">
                {resource.type === 'Imagen' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                ) : resource.type === 'PDF' ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <Video className="w-4 h-4" />
                )}
                <span className="text-[10px] font-black uppercase tracking-widest">{resource.type}</span>
              </div>
              <h3 className="text-xl font-black text-[#f6811e] group-hover:text-[#5fbd44] transition-colors duration-300">
                {resource.title}
              </h3>

            </div>
          </div>
        ))}
        </div>
      )}

      {/* MODAL */}
      {selectedResource && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#f6811e]/90 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          {/* Modal Content */}
          <div className={`relative w-full ${selectedResource.type === 'Imagen' ? 'max-w-4xl' : (selectedResource.type === 'Short informativo' ? 'max-w-[400px] aspect-[9/16]' : 'max-w-5xl aspect-video')} bg-black rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300`}>
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Content: Video or Image */}
            {selectedResource.type === 'Imagen' ? (
              <div className="flex flex-col bg-white"> {/* Le puse fondo blanco para que resalte la imagen */}
                <img
                  src={selectedResource.imageUrl}
                  alt={selectedResource.title}
                  className="w-full h-auto max-h-[75vh] object-contain mx-auto"
                />
                {/* ESTO ES LO NUEVO */}
                {selectedResource.description && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-gray-700 text-center text-sm md:text-base font-medium">
                      {selectedResource.description}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${selectedResource.youtubeId}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={selectedResource.title}
              ></iframe>
            )}
          </div>
        </div>
      )}

      {/* BACKGROUND DECORATIONS */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] -left-[5%] w-[30%] h-[30%] bg-[#5fbd44]/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-[#f6811e]/5 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};
