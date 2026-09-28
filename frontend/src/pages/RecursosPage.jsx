import React, { useState } from 'react';
import { Play, X, Video, Download, FileText, Search, BookOpen, Layers, HelpCircle } from 'lucide-react';

// Consolidado de todos los recursos de todos los cursos
const course1Resources = [
  {
    id: "c1-r1",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "Ley 2128 de 2021",
    type: "PDF",
    pdfUrl: "https://jumpshare.com/share/R7IY9dS9FfvyMbf1tprg",
    thumbnail: "https://images.unsplash.com/photo-1623276527153-fa38c1616b05?q=80&w=1169&auto=format&fit=crop"
  },
  {

    id: "c1-r1",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "NORMA NFPA 54 ANSI Z223.1",
    type: "PDF",
    pdfUrl: "https://smallpdf.com/es/file#s=f646908b-387b-4a45-bcdf-b459190ff708",
    thumbnail: "https://images.unsplash.com/photo-1623276527153-fa38c1616b05?q=80&w=1169&auto=format&fit=crop"
  },
  {
    id: "c1-r2",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "NORMA TÉCNICA COLOMBIANA - NTC 3853-1",
    type: "PDF",
    pdfUrl: "https://smallpdf.com/es/file#s=f1c1b52f-9f18-4d0c-a704-4d3425c353b4",
    thumbnail: "https://images.unsplash.com/photo-1623276527153-fa38c1616b05?q=80&w=1169&auto=format&fit=crop"
  },
  {
    id: "c1-r3",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "Conoce nuestro servicio de instalación de Gasmax autoglp",
    type: "Video",
    youtubeId: "oXaUJS4FjIU",
    thumbnail: "https://img.youtube.com/vi/oXaUJS4FjIU/maxresdefault.jpg"
  },
  {
    id: "c1-r4",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "Filtro fase gaseosa",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/37SgWWj.jpeg",
    thumbnail: "https://i.imgur.com/37SgWWj.jpeg",
    description: "Filtra el autoglp y está dotado de un sensor que mide la temperatura y la presión del gas y la carga del motor."
  },
  {
    id: "c1-r5",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "Regulador",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/p1h24Sc.jpeg",
    thumbnail: "https://i.imgur.com/p1h24Sc.jpeg",
    description: "Pasa el autoglp de estado gaseoso y reduce y regula su presión."
  },
  {
    id: "c1-r6",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "Sensor indicador de nivel",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/bWVKWTJ.jpeg",
    thumbnail: "https://i.imgur.com/bWVKWTJ.jpeg",
    description: "Indica el nivel de autoglp disponible en el tanque."
  },
  {
    id: "c1-r7",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "Multiválvula de tanque",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/47no0aO.jpeg",
    thumbnail: "https://i.imgur.com/47no0aO.jpeg",
    description: "Permite el paso del autoglp que entra y sale del depósito, mide el nivel de gas y consta de varias válvulas de seguridad."
  },
  {
    id: "c1-r8",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "Válvula carga o abastecimiento",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/yyvVbun.jpeg",
    thumbnail: "https://i.imgur.com/yyvVbun.jpeg",
    description: "Válvula antirretorno por la que se llena el depósito."
  },
  {
    id: "c1-r9",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "Centralita de gas",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/1GYZBYi.jpeg",
    thumbnail: "https://i.imgur.com/1GYZBYi.jpeg",
    description: "Recibe las señales de los distintos sensores y calcula y garantiza los parámetros para el funcionamiento con autoglp."
  },
  {
    id: "c1-r10",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "Riel de inyectores",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/V6dzAD8.jpeg",
    thumbnail: "https://i.imgur.com/V6dzAD8.jpeg",
    description: "Inyecta la cantidad de autoglp correcta en cada cilindro."
  },
  {
    id: "c1-r11",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "Sensor de presión (MAP)",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/wPSxrCg.jpeg",
    thumbnail: "https://i.imgur.com/wPSxrCg.jpeg",
    description: "Mide la presión del gas y calcula la cantidad del gas a inyectar a través de los inyectores."
  },
  {
    id: "c1-r12",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "Llave conmutadora",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/tqvu2BF.jpeg",
    thumbnail: "https://i.imgur.com/tqvu2BF.jpeg",
    description: "Permite la conmutación entre autoglp y gasolina e indica el nivel de gas en el depósito."
  },
  {
    id: "c1-r13",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "Acoples para líneas de conducción",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/486qNqL.jpeg",
    thumbnail: "https://i.imgur.com/486qNqL.jpeg",
    description: "Terminal de conexión de mangueras a la válvula de carga y al regulador."
  },
  {
    id: "c1-r14",
    courseId: 1,
    courseTitle: "Curso 1: ¿Qué es el autoglp?",
    title: "Tanque Toroidal - cilíndrico",
    type: "Imagen",
    imageUrl: "https://i.imgur.com/m4OfuDe.jpeg",
    thumbnail: "https://i.imgur.com/m4OfuDe.jpeg",
    description: "Contiene el autoglp en fase líquida y gaseosa."
  }
];

const course2Resources = [
  {
    id: "c2-r1",
    courseId: 2,
    courseTitle: "Curso 2: Proceso comercial",
    title: "Recurso Comercial 1",
    type: "Video",
    youtubeId: "swu4iTgSuUA",
    thumbnail: "https://img.youtube.com/vi/swu4iTgSuUA/maxresdefault.jpg"
  },
  {
    id: "c2-r2",
    courseId: 2,
    courseTitle: "Curso 2: Proceso comercial",
    title: "Recurso 02: Presentación comercial",
    type: "Short informativo",
    youtubeId: "6v9heEbWuLk",
    thumbnail: "https://img.youtube.com/vi/6v9heEbWuLk/maxresdefault.jpg"
  },
  {
    id: "c2-r3",
    courseId: 2,
    courseTitle: "Curso 2: Proceso comercial",
    title: "Recurso 03: Beneficios del GLP",
    type: "Short informativo",
    youtubeId: "XVsKusLX4kg",
    thumbnail: "https://img.youtube.com/vi/XVsKusLX4kg/maxresdefault.jpg"
  },
  {
    id: "c2-r4",
    courseId: 2,
    courseTitle: "Curso 2: Proceso comercial",
    title: "Recurso 04: Ventajas comparativas",
    type: "Short informativo",
    youtubeId: "RW_B7rHNtTg",
    thumbnail: "https://img.youtube.com/vi/RW_B7rHNtTg/maxresdefault.jpg"
  },
  {
    id: "c2-r5",
    courseId: 2,
    courseTitle: "Curso 2: Proceso comercial",
    title: "Recurso 05: Ahorro y eficiencia",
    type: "Short informativo",
    youtubeId: "OYF4dq0mTEw",
    thumbnail: "https://img.youtube.com/vi/OYF4dq0mTEw/maxresdefault.jpg"
  },
  {
    id: "c2-r6",
    courseId: 2,
    courseTitle: "Curso 2: Proceso comercial",
    title: "Recurso 06: Mitos del GLP",
    type: "Short informativo",
    youtubeId: "8dlJt93mS7I",
    thumbnail: "https://img.youtube.com/vi/8dlJt93mS7I/maxresdefault.jpg"
  },
  {
    id: "c2-r7",
    courseId: 2,
    courseTitle: "Curso 2: Proceso comercial",
    title: "Recurso 07: Argumentación",
    type: "Short informativo",
    youtubeId: "GsP-nIXHvWY",
    thumbnail: "https://img.youtube.com/vi/GsP-nIXHvWY/maxresdefault.jpg"
  },
  {
    id: "c2-r8",
    courseId: 2,
    courseTitle: "Curso 2: Proceso comercial",
    title: "Recurso 08: Manejo de dudas",
    type: "Short informativo",
    youtubeId: "oU2qJpHZF7Y",
    thumbnail: "https://img.youtube.com/vi/oU2qJpHZF7Y/maxresdefault.jpg"
  },
  {
    id: "c2-r9",
    courseId: 2,
    courseTitle: "Curso 2: Proceso comercial",
    title: "Recurso 09: Cierre comercial",
    type: "Short informativo",
    youtubeId: "01625BFBVjs",
    thumbnail: "https://img.youtube.com/vi/01625BFBVjs/maxresdefault.jpg"
  },
  {
    id: "c2-r10",
    courseId: 2,
    courseTitle: "Curso 2: Proceso comercial",
    title: "Recurso 10: Financiación",
    type: "Short informativo",
    youtubeId: "2hEzQrsF7KQ",
    thumbnail: "https://img.youtube.com/vi/2hEzQrsF7KQ/maxresdefault.jpg"
  },
  {
    id: "c2-r11",
    courseId: 2,
    courseTitle: "Curso 2: Proceso comercial",
    title: "Recurso 11: Documentación",
    type: "Short informativo",
    youtubeId: "Lpoq41DebBs",
    thumbnail: "https://img.youtube.com/vi/Lpoq41DebBs/maxresdefault.jpg"
  },
  {
    id: "c2-r12",
    courseId: 2,
    courseTitle: "Curso 2: Proceso comercial",
    title: "Recurso 12: Casos de éxito",
    type: "Short informativo",
    youtubeId: "64lVbdY1H6s",
    thumbnail: "https://img.youtube.com/vi/64lVbdY1H6s/maxresdefault.jpg"
  }
];

const course3Resources = [
  {
    id: "c3-r1",
    courseId: 3,
    courseTitle: "Curso 3: Postventa y CRM",
    title: "Short Informativo: Postventa AutoGLP",
    type: "Short informativo",
    youtubeId: "cAPkwx2CD4o",
    thumbnail: "https://img.youtube.com/vi/cAPkwx2CD4o/maxresdefault.jpg"
  },
  {
    id: "c3-r2",
    courseId: 3,
    courseTitle: "Curso 3: Postventa y CRM",
    title: "Short Informativo: Servicio GMAX",
    type: "Short informativo",
    youtubeId: "xvTHXT4CQy4",
    thumbnail: "https://img.youtube.com/vi/xvTHXT4CQy4/maxresdefault.jpg"
  },
  {
    id: "c3-r3",
    courseId: 3,
    courseTitle: "Curso 3: Postventa y CRM",
    title: "Short Informativo: Fidelización GLP",
    type: "Short informativo",
    youtubeId: "ej0L_bVftpA",
    thumbnail: "https://img.youtube.com/vi/ej0L_bVftpA/maxresdefault.jpg"
  }
];

// Unimos todos los recursos en una sola lista maestra
const allResources = [...course1Resources, ...course2Resources, ...course3Resources];

export const RecursosPage = () => {
  const [selectedResource, setSelectedResource] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Filtrado de recursos
  const filteredResources = allResources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCourse = selectedCourse === 'all' || resource.courseId === parseInt(selectedCourse);
    const matchesType = selectedType === 'all' || resource.type === selectedType;

    return matchesSearch && matchesCourse && matchesType;
  });

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
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-700 pb-12">
      {/* HEADER */}
      <div className="mb-8 flex flex-col items-start gap-3">
        <span className="bg-[#5fbd44]/10 text-[#5fbd44] px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-[#5fbd44]/20">
          Biblioteca de Recursos
        </span>
        <h2 className="text-4xl font-black text-[#f6811e] tracking-tight">
          Todos los Recursos de Formación
        </h2>
        <p className="text-gray-500 font-medium text-lg max-w-2xl">
          Explora y busca manuales, videos complementarios, esquemas técnicos y shorts de todas las materias.
        </p>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between mb-10">
        {/* Barra de búsqueda */}
        <div className="relative w-full lg:max-w-md flex items-center group">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 group-focus-within:text-[#5fbd44] transition-colors" />
          <input
            type="text"
            placeholder="Buscar por título, componente o palabra clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-[#5fbd44] focus:ring-2 focus:ring-[#5fbd44]/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 font-semibold"
          />
        </div>

        {/* Filtros Dropdown */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
          {/* Filtrar por curso */}
          <div className="relative w-full sm:w-48 flex items-center">
            <BookOpen className="w-4 h-4 text-gray-400 absolute left-4 pointer-events-none" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full bg-slate-50 border border-transparent rounded-2xl py-3 pl-11 pr-8 text-xs font-bold text-gray-700 appearance-none focus:bg-white focus:border-[#5fbd44] outline-none transition-all cursor-pointer"
            >
              <option value="all">Todos los Cursos</option>
              <option value="1">Curso 1 (Técnico)</option>
              <option value="2">Curso 2 (Comercial)</option>
              <option value="3">Curso 3 (Postventa)</option>
            </select>
          </div>

          {/* Filtrar por tipo */}
          <div className="relative w-full sm:w-48 flex items-center">
            <Layers className="w-4 h-4 text-gray-400 absolute left-4 pointer-events-none" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-transparent rounded-2xl py-3 pl-11 pr-8 text-xs font-bold text-gray-700 appearance-none focus:bg-white focus:border-[#5fbd44] outline-none transition-all cursor-pointer"
            >
              <option value="all">Todos los Tipos</option>
              <option value="PDF">Documentos PDF</option>
              <option value="Video">Videos</option>
              <option value="Short informativo">Shorts Informales</option>
              <option value="Imagen">Esquemas / Imágenes</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRID DE RECURSOS */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              onClick={() => openModal(resource)}
              className="group relative bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#5fbd44]/10 transition-all duration-500 cursor-pointer border border-gray-100 hover:-translate-y-2 flex flex-col justify-between"
            >
              {/* THUMBNAIL CONTAINER */}
              <div className={`relative ${resource.type === 'Short informativo' ? 'aspect-[9/16] max-h-[360px]' : 'aspect-video'} overflow-hidden`}>
                <img
                  src={resource.thumbnail}
                  alt={resource.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80";
                  }}
                />

                {/* TAG DE CURSO */}
                <span className="absolute top-4 left-4 z-10 bg-[#f6811e]/80 text-white backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Curso {resource.courseId}
                </span>

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-[#f6811e]/40 group-hover:bg-[#f6811e]/20 transition-colors duration-500 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transform transition-all duration-500 group-hover:scale-110 group-hover:bg-[#5fbd44] group-hover:border-[#5fbd44] shadow-xl">
                    {resource.type === 'PDF'
                      ? <Download className="w-6 h-6 text-white" />
                      : <Play className="w-6 h-6 text-white fill-current ml-1" />
                    }
                  </div>
                </div>
              </div>

              {/* INFO */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-[#5fbd44]">
                    {resource.type === 'Imagen' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                    ) : resource.type === 'PDF' ? (
                      <FileText className="w-3.5 h-3.5" />
                    ) : (
                      <Video className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[9px] font-black uppercase tracking-widest">{resource.type}</span>
                  </div>
                  <h3 className="text-[17px] font-black text-[#f6811e] group-hover:text-[#5fbd44] transition-colors duration-300 line-clamp-2 leading-tight">
                    {resource.title}
                  </h3>
                </div>

                {resource.description && (
                  <p className="text-gray-400 text-xs mt-3 line-clamp-2 font-medium">
                    {resource.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm">
          <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-black text-[#f6811e]">No se encontraron recursos</h3>
          <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto font-medium">
            Intenta cambiar tus parámetros de búsqueda o ajusta los filtros de cursos y formatos.
          </p>
        </div>
      )}

      {/* MODAL */}
      {selectedResource && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#f6811e]/90 backdrop-blur-sm" onClick={closeModal}></div>

          {/* Modal Content */}
          <div className={`relative w-full ${selectedResource.type === 'Imagen' ? 'max-w-4xl' : (selectedResource.type === 'Short informativo' ? 'max-w-[400px] aspect-[9/16]' : 'max-w-5xl aspect-video')} bg-black rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300`}>
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Content */}
            {selectedResource.type === 'Imagen' ? (
              <div className="flex flex-col bg-white">
                <img
                  src={selectedResource.imageUrl}
                  alt={selectedResource.title}
                  className="w-full h-auto max-h-[75vh] object-contain mx-auto"
                />
                {selectedResource.description && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-gray-700 text-center text-sm font-semibold">
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
    </div>
  );
};
