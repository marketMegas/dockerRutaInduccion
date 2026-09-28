// 1. Aquí agregué { useState }
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Compass, CheckCircle, TrendingUp, MessageCircle, GraduationCap, MousePointer2, Flame,
  Target, Users, Handshake, Wrench, Package, Fuel, CreditCard, Globe, Truck, Building2,
  MapPin, Megaphone, Leaf, Cog, User, CircleDollarSign, Award, Briefcase,
  ChevronRight, Play, CheckCircle2, Lock,
  Table, X // 2. Aquí agregué Table y X al final de esta lista
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
  };
  const steps = [

    { icon: Compass, title: 'Explora tus cursos', desc: 'Descubre el catálogo completo de nuestra universidad.' },
    { icon: CheckCircle, title: 'Completa lecciones', desc: 'Avanza a tu propio ritmo en cada módulo.' },
    { icon: TrendingUp, title: 'Revisa tu progreso', desc: 'Mide tu crecimiento y alcanza tus metas.' },
    { icon: MessageCircle, title: 'Participa', desc: 'Únete a los foros y actividades interactivas.' },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1000px] mx-auto">

      {/* Columna Principal */}
      <div className="w-full flex flex-col gap-8">

        {/* Título principal */}
        <div className="mb-4 flex flex-col items-center">
          <h1 className="flex flex-col leading-[0.85] tracking-tighter font-black text-center">
            <span className="text-[42px] sm:text-[56px] md:text-[72px] text-[#424242] uppercase">
              Ruta de
            </span>
            <span className="text-[40px] sm:text-[52px] md:text-[68px] text-[#f6811e] lowercase">
              Inducción
            </span>
          </h1>
        </div>



        {/* Logos (Solo imágenes, sin cajas) */}
        <div className="flex justify-center items-center gap-10 sm:gap-20 py-8 -mt-4 mb-6">
          <img
            src="https://www.g-max.com.co/gasmax2.png"
            alt="Gasmax"
            className="h-14 sm:h-20 lg:h-28 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer"
          />
          <img
            src="https://www.g-max.com.co/logo2.png"
            alt="Logo G-Max Secondary"
            className="h-14 sm:h-20 lg:h-28 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer"
          />
        </div>

        {/* Nueva Descripción con Negrillas centrada */}
        <div className="text-center -mt-6 mb-8 w-full">
          <p className="text-gray-700 leading-tight max-w-4xl mx-auto font-medium tracking-tight text-center text-xl md:text-2xl">
            Una <strong className="text-gray-900 font-bold">escuela continua</strong> de <strong className="text-gray-900 font-bold">lenguaje</strong>, <strong className="text-gray-900 font-bold">método</strong>, <strong className="text-gray-900 font-bold">disciplina</strong> y <strong className="text-gray-900 font-bold">cierre</strong>, como <strong className="text-gray-900 font-bold">manual de ventas</strong> para nuestros <strong className="text-gray-900 font-bold">colaboradores</strong>.
          </p>
        </div>
        {/* Sección de Onboarding (Movida arriba) */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] mb-4">
          <div className="flex items-center justify-start gap-4 mb-12 w-full text-left">
            <div className="w-10 h-10 rounded-full bg-[#f6811e] flex items-center justify-center flex-shrink-0 shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h2 className="lg: font-black tracking-tighter uppercase text-left text-3xl lg:text-4xl text-[#f6811e]">
              ¿CÓMO USAR LA PLATAFORMA?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center group">
                  <div className="w-20 h-20 rounded-[2rem] bg-[#f6811e]/5 flex items-center justify-center mb-6 group-hover:bg-[#f6811e] group-hover:-translate-y-2 transition-all duration-500 shadow-sm group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]">
                    <Icon className="w-10 h-10 text-[#f6811e] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold mb-3 text-xl text-[#f6811e]">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-base">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECCIÓN: OBJETIVO */}
        <div className="bg-white rounded-[20px] border border-gray-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-6 mb-6 justify-start text-left w-full">
            <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
              <Target className="w-9 h-9" />
            </div>
            <h2 className="lg: font-black tracking-tighter uppercase text-left text-3xl lg:text-4xl text-[#f6811e]">OBJETIVO</h2>
          </div>
          <p className="text-gray-600 leading-relaxed font-medium tracking-tight text-left w-full text-base">
            "Convertir a conductores que dependen económicamente de su vehículo en usuarios fieles de <span className="text-[#f6811e] font-bold">autoglp</span>, mediante una propuesta de valor clara basada en mayor potencia, más economía y mayor versatilidad, logrando un ahorro  hasta del 40% frente a la gasolina, sin sacrificar desempeño ni confiabilidad,un sistema bicombustible <span className="text-[#f6811e] font-bold">autoglp</span> + Gasolina, posicionando a la marca como una decisión aspiracional de progreso y no solo como una alternativa de ahorro."
          </p>
        </div>

        <div className="w-full h-px bg-gray-100 my-10"></div>

        {/* SECCIÓN: DESCRIPCIÓN */}
        <div className="mb-10">
          <div className="bg-white rounded-[32px] border border-[#e3f3df] shadow-sm overflow-hidden">



            <div className="p-8 lg:p-12">
              <div className="flex items-center gap-6 mb-12 justify-start text-left w-full">
                <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                  <Compass className="w-9 h-9" />
                </div>
                <h2 className="lg: font-black tracking-tighter uppercase text-left text-3xl lg:text-4xl text-[#f6811e]">DESCRIPCIÓN</h2>
              </div>

              <div className="space-y-12">
                {/* Block 1 */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="w-20 h-20 rounded-full bg-[#eef8f1] flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#00B140]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 17V9m4 8V5m4 12v-6m4 6V7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 border-l-2 border-[#8FE3A8] pl-6 md:pl-8">
                    <p className="text-gray-600 leading-relaxed font-medium text-left text-base">
                      El <span className="text-[#f6811e] font-bold">autoglp</span> se ha consolidado como una alternativa energética eficiente, económica y más amigable con el medio ambiente para el sector transporte. Su crecimiento representa una gran oportunidad comercial para las empresas del sector energético, especialmente para aquellas que buscan ofrecer soluciones competitivas, seguras y sostenibles a sus clientes.
                    </p>
                  </div>
                </div>

                {/* Block 2 */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="w-20 h-20 rounded-full bg-[#f2ffee] flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#5fbd44]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        <circle cx="12" cy="12" r="9" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 border-l-2 border-[#8FE3A8] pl-6 md:pl-8">
                    <p className="text-gray-600 leading-relaxed text-left text-base">
                      Este curso comercial de <span className="text-[#f6811e] font-bold">autoglp</span> está diseñado para capacitar al personal administrativo y comercial en los conceptos fundamentales del producto, sus beneficios, aplicaciones, normatividad básica, procesos de venta y argumentos comerciales más importantes. A través de esta formación, los participantes podrán comprender mejor qué es el <span className="text-[#f6811e] font-bold">autoglp</span>, cómo funciona, cuáles son sus ventajas frente a otros combustibles y cómo comunicar su valor de manera clara, profesional y confiable.
                    </p>
                  </div>
                </div>

                {/* Block 3 */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="w-20 h-20 rounded-full bg-[#eef8f1] flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#00B140]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5V4H2v16h5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20v-6h6v6" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 border-l-2 border-[#8FE3A8] pl-6 md:pl-8">
                    <p className="text-gray-600 leading-relaxed text-left text-base">
                      La capacitación permitirá fortalecer las competencias del equipo para atender clientes, resolver inquietudes, identificar oportunidades de negocio y apoyar el crecimiento del mercado de <span className="text-[#f6811e] font-bold">autoglp</span>. Además, brindará herramientas prácticas para promover una venta responsable, alineada con la seguridad, la normativa vigente y los objetivos comerciales de la empresa.
                    </p>
                  </div>
                </div>

                {/* Bottom Highlight */}
                <div className="rounded-3xl border-2 border-[#dbfbd3] bg-[#fafff8] p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-full bg-[#efffea] flex items-center justify-center">
                        <svg className="w-10 h-10 text-[#5fbd44]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
                        </svg>
                      </div>
                    </div>
                    <div className="w-full text-left">
                      <p className="text-gray-600 leading-relaxed font-medium text-left text-base">
                        Al finalizar el curso, los participantes estarán mejor preparados para representar el <span className="text-[#f6811e] font-bold">autoglp</span> como una solución energética moderna, rentable y segura, contribuyendo al posicionamiento de la compañía y a la generación de confianza en los clientes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gray-100 mb-10"></div>

        {/* SECCIÓN: MERCADO ALIADOS, PARTNER */}
        <div className="mt-12 mb-8">
          <div className="flex items-center gap-6 mb-6 justify-start text-left w-full">
            <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
              <Globe className="w-9 h-9" />
            </div>
            <h2 className="lg: font-black uppercase tracking-tighter text-left text-3xl lg:text-4xl text-[#f6811e]">
              MERCADO, ALIADOS Y PARTNERS
            </h2>
          </div>
          <div className="w-full h-px bg-gray-200"></div>
        </div>

        {/* CONTENEDOR UNIFICADO: MERCADO ALIADOS, PARTNER */}
        <div className="bg-white rounded-[32px] border border-gray-100 p-6 sm:p-12 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col gap-16">

          {/* 1. STAKEHOLDERS GENERAL Y LOGOS */}
          <div className="flex flex-col gap-10">
            {/* Texto Stakeholder */}
            <div className="flex items-center gap-6 justify-start text-left w-full">
              <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                <Users className="w-9 h-9" strokeWidth={2} />
              </div>
              <div className="text-left">
                <h2 className="lg: font-black text-3xl lg:text-4xl text-[#f6811e]">Stakeholders:</h2>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4 ml-0 lg:ml-22 text-base">
              Para Gasmax los stakeholders representan una red de valor esencial que abarca desde los proveedores y distribuidores, hasta los conductores, comunidades locales, autoridades ambientales y aliados estratégicos.
            </p>

            {/* Divisor */}
            <div className="w-full h-px bg-gray-100"></div>

            {/* Grid de Logos Unificado */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-10 gap-x-8 items-center justify-items-center opacity-70">
              {/* Biomax */}
              <div className="flex flex-col items-center gap-2">
                <img src="https://i.imgur.com/nal4DBC.png" alt="Biomax" className="h-14 w-auto object-contain rounded-lg" />

              </div>
              {/* Megas */}
              <div className="flex flex-col items-center gap-2">
                <img src="https://i.imgur.com/ky88V7H.png" alt="Megas" className="h-14 w-auto object-contain" />
              </div>
              {/* Texaco */}
              <div className="flex flex-col items-center gap-2">
                <img src="https://i.imgur.com/Hehf3GM.png" alt="Texaco" className="h-14 w-auto object-contain" />
              </div>
              {/* Vigigas */}
              <div className="flex flex-col items-center gap-2">
                <img src="https://i.imgur.com/rR9fsAK.png" alt="Vigigas" className="h-14 w-auto object-contain" />
              </div>
              {/* Zencillo */}
              <div className="flex flex-col items-center gap-2">
                <img src="https://i.imgur.com/WBd6QE5.png" alt="Zencillo Connect" className="h-14 w-auto object-contain" />
              </div>
              {/* Lovato */}
              <div className="flex flex-col items-center gap-2">
                <img src="https://i.imgur.com/UY29cna.png" alt="Lovato" className="h-14 w-auto object-contain" />
              </div>
              {/* J2K */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-[#f6811e] text-white px-4 py-2 font-black text-2xl italic h-14 flex items-center justify-center rounded-lg">J2K</div>
              </div>
              {/* Europump */}
              <div className="flex flex-col items-center gap-2">
                <img src="https://i.imgur.com/oXQ8YXl.png" alt="Europump" className="h-14 w-auto object-contain" />
              </div>
              {/* CCS */}
              <div className="flex flex-col items-center gap-2">
                <img src="https://i.imgur.com/VkqOljD.png" alt="CCS" className="h-14 w-auto object-contain" />
              </div>
              {/* Cámara Comercio */}
              <div className="flex flex-col items-center gap-2">
                <img src="https://i.imgur.com/l1u4qvs.png" alt="Cámara de Comercio de Bogotá" className="h-14 w-auto object-contain" />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100"></div>

          {/* 2. STAKEHOLDERS INTERNOS Y EXTERNOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Internos */}
            <div className="bg-[#f3fff0] rounded-[20px] border border-[#f6811e]/10 p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-4 mb-6 justify-start text-left w-full">
                <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-md">
                  <Users className="w-9 h-9" />
                </div>
                <div className="text-left">
                  <h2 className="font-bold text-xl text-[#f6811e]">Stakeholders Internos</h2>
                  <p className="text-gray-500 text-base">Aquellos que forman parte directa de la organización:</p>
                </div>

              </div>
              <ul className="space-y-5 mb-8">
                <li className="flex gap-4">
                  <User className="w-6 h-6 text-[#f6811e] shrink-0 mt-1" />
                  <p className="text-gray-700 leading-tight text-base">
                    <span className="font-bold text-gray-900">Empleados:</span> técnicos, instaladores, asesores comerciales, personal de estación y administrativo.
                  </p>
                </li>
                <li className="flex gap-4">
                  <Briefcase className="w-6 h-6 text-[#f6811e] shrink-0 mt-1" />
                  <p className="text-gray-700 leading-tight text-base">
                    <span className="font-bold text-gray-900">Directivos y accionistas:</span> responsables de la toma de decisiones estratégicas, inversión y expansión.
                  </p>
                </li>
                <li className="flex gap-4">
                  <Cog className="w-6 h-6 text-[#f6811e] shrink-0 mt-1" />
                  <p className="text-gray-700 leading-tight text-base">
                    <span className="font-bold text-gray-900">Áreas de apoyo:</span> mercadeo, ingeniería, servicio al cliente y sostenibilidad.
                  </p>
                </li>
              </ul>

              {/* Divisor y Sección Inferior */}
              <div className="pt-6 border-t border-[#f6811e]/10 mt-auto">
                <div className="flex gap-4 items-start">
                  <Target className="w-6 h-6 text-[#f6811e] shrink-0 mt-1" />
                  <p className="text-gray-700 leading-tight text-base">
                    <span className="font-bold text-gray-900">Interés principal:</span> crecimiento sostenible, seguridad operativa y rentabilidad del negocio.
                  </p>
                </div>
              </div>
            </div>

            {/* Externos */}
            <div className="bg-[#f2f9f2] rounded-[20px] border border-green-100 p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-4 mb-6 justify-start text-left w-full">
                <div className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center shadow-md">
                  <Globe className="w-9 h-9" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-xl text-[#f6811e]">Stakeholders Externos</h3>
                  <p className="text-gray-500 text-base">Relacionados con la operación e impacto de la empresa:</p>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-4">
                  <Users className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                  <p className="text-gray-700 leading-tight text-base">
                    <span className="font-bold text-gray-900">Clientes finales:</span> taxistas, conductores de plataformas, flotas empresariales y familias usuarias de <span className="text-[#f6811e]">autoglp</span>.
                  </p>
                </li>
                <li className="flex gap-4">
                  <Truck className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                  <p className="text-gray-700 leading-tight text-base">
                    <span className="font-bold text-gray-900">Proveedores y distribuidores:</span> aliados en la cadena de suministro, estaciones y talleres de conversión.
                  </p>
                </li>
                <li className="flex gap-4">
                  <Building2 className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                  <p className="text-gray-700 leading-tight text-base">
                    <span className="font-bold text-gray-900">Entidades gubernamentales:</span> Ministerio de Minas y Energía, autoridades ambientales y de tránsito.
                  </p>
                </li>
                <li className="flex gap-4">
                  <MapPin className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                  <p className="text-gray-700 leading-tight text-base">
                    <span className="font-bold text-gray-900">Comunidades locales:</span> poblaciones cercanas a estaciones o centros de operación.
                  </p>
                </li>
                <li className="flex gap-4">
                  <Megaphone className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                  <p className="text-gray-700 leading-tight text-base">
                    <span className="font-bold text-gray-900">Medios y sociedad civil:</span> actores interesados en la sostenibilidad energética y reducción de emisiones.
                  </p>
                </li>
              </ul>

              {/* Divisor y Sección Inferior */}
              <div className="pt-6 border-t border-green-200 mt-auto">
                <div className="flex gap-4 items-start">
                  <Leaf className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                  <p className="text-gray-700 leading-tight text-base">
                    <span className="font-bold text-gray-900">Interés principal:</span> seguridad, economía, innovación y aporte ambiental.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100"></div>

          {/* 3. PARTNER COMERCIAL */}
          <div className="flex flex-col gap-10">
            <div className="max-w-4xl mx-auto">
              <div className="leading-relaxed text-gray-700 text-base">
                <div className="flex items-center gap-6 justify-start text-left w-full mb-8">
                  <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                    <Handshake className="w-9 h-9" />
                  </div>
                  <h2 className="font-black tracking-tighter text-left text-3xl lg:text-4xl text-[#f6811e]">
                    Un partner comercial <span className="text-[#f6811e]">autoglp</span>:
                  </h2>
                </div>


                <p className="text-gray-600 leading-relaxed mb-6 text-base">
                  Es una empresa <span className="font-bold text-[#f6811e]">estratégico autorizado</span> que colabora con <span className="font-bold text-[#f6811e]">Gas Max</span> en la promoción, distribución, instalación y/o soporte técnico de sistemas <span className="text-[#f6811e] font-bold">autoglp</span>.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6 text-base">
                  Su función es ampliar la cobertura del producto en el mercado, garantizar la <span className="font-bold text-[#f6811e]">calidad del servicio postventa</span> y mantener los estándares técnicos y de seguridad definidos por la marca.
                </p>
                <p className="text-gray-600 leading-relaxed text-base">
                  El partner actúa bajo un modelo de <span className="font-bold text-[#f6811e]">cooperación comercial</span>, compartiendo objetivos de crecimiento, capacitación continua y desarrollo tecnológico, orientados a fortalecer la adopción del <span className="text-[#f6811e]">autoglp</span> como una solución energética más eficiente, económica y sostenible para el transporte.
                </p>
              </div>

              <div className="mt-12 mb-10 flex items-center gap-4">
                <div className="h-px bg-[#f6811e] flex-1 opacity-20"></div>
                <span className="bg-[#f6811e] text-white px-6 py-2 rounded-full font-black text-sm tracking-widest shadow-lg shadow-[#f6811e]/20">
                  SON CANALES DE VENTA
                </span>
                <br></br>
                <br></br>
                <div className="h-px bg-[#f6811e] flex-1 opacity-20"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* Tarjeta 1 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                <div className="flex flex-col items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <Wrench className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold leading-tight text-left text-lg text-[#f6811e]">Talleres<br />certificados:</h4>
                </div>
                <p className="text-gray-700 leading-relaxed text-left text-base">
                  Talleres certificados para conversiones, con personal experto, que buscan maximizar sus ventas. Financieramente estables y con fuerza comercial dedicada a <span className="text-[#f6811e]">autoglp</span> , con tecnología apta como: <span className="font-bold">Equipos multimarca para realizar un pre-diagnóstico.</span>
                </p>
              </div>

              {/* Tarjeta 2 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                <div className="flex flex-col items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <Package className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold leading-tight text-left text-lg text-[#f6811e]">Marcas de equipos<br />y elementos de<br />suministro</h4>
                </div>
                <p className="text-gray-700 leading-relaxed text-left mb-4 text-base">
                  Comerciales con vinculación indirecta a la compañía
                </p>

                <p className="text-gray-700 leading-relaxed text-left text-base">
                  Empresas de tecnología, medios y canales de comunicación, agremiaciones (Influencer).
                </p>
              </div>

              {/* Tarjeta 3 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                <div className="flex flex-col items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <Fuel className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold leading-tight text-left text-lg text-[#f6811e]">Estaciones de servicio<br />minorista y mayorista</h4>
                </div>

                <p className="text-gray-700 leading-relaxed text-left text-base">
                  Texaco, Biomax y Shell en el corredor centro sur del país
                </p>
              </div>

              {/* Tarjeta 4 */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                <div className="flex flex-col items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold leading-tight text-left text-lg text-[#f6811e]">Empresa de credito</h4>
                </div>

                <p className="text-gray-600 leading-relaxed text-left text-base">
                  <span className="font-bold text-gray-900">Magic.</span> encargada de la gestión de tramites de crédito
                </p>
              </div>
            </div>
          </div>
          <div className="w-full h-px bg-gray-100"></div>
          {/* 4. ALIADO ESTRATÉGICO */}
          <div className="flex flex-col lg:flex-row gap-10 items-start mb-12">
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-8 justify-start text-left w-full">
                <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg">
                  <Handshake className="w-9 h-9" />
                </div>
                <h2 className="lg: font-black tracking-tighter text-left text-3xl lg:text-4xl text-[#f6811e]">
                  Aliado estratégico <span className="text-[#f6811e]">G-MAX autoglp</span> :
                </h2>
              </div>

              <div className="space-y-6 text-base text-gray-600 leading-relaxed">

                <p>
                  Un Aliado Estratégico de <span className="font-bold text-[#f6811e]">G-MAX <span className="text-[#f6811e]">autoglp</span></span> : es una empresa, organización o entidad que establece una relación de cooperación a largo plazo con <span className="font-bold text-[#f6811e]">Gas Max</span> , con el propósito de fortalecer la presencia, adopción y desarrollo del <span className="text-[#f6811e]">autoglp</span> en el mercado de movilidad.
                </p>

                <p>
                  Este tipo de alianza se basa en objetivos comunes de crecimiento, sostenibilidad y rentabilidad, y busca integrar capacidades técnicas, comerciales, logísticas o institucionales que aporten valor al ecosistema de <span className="text-[#f6811e]">autoglp</span> .
                </p>

                <p>
                  El aliado estratégico no solo actúa como un distribuidor o cliente, sino como un socio colaborador en innovación, promoción y expansión, compartiendo información, conocimiento y recursos para impulsar una movilidad más eficiente, económica y ecológica.
                </p>
              </div>
            </div>

            {/* Ilustración visual */}
            <div className="w-full lg:w-[40%] flex flex-col items-center justify-center p-0 lg:mt-8">
              <img
                src="https://i.imgur.com/7zmOueM.png"
                alt="Aliado Estratégico"
                className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tarjeta 1 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-18 h-18 rounded-full bg-[#f3fff0] text-[#f6811e] flex items-center justify-center mb-4 border border-[#f6811e]/10">
                  <div className="relative">
                    <Cog className="w-10 h-10 opacity-40" />
                    <Package className="w-6 h-6 absolute inset-0 m-auto" />
                  </div>
                </div>
                <h4 className="font-bold leading-tight px-4 text-lg text-[#f6811e]">Marcas Distribuidoras de Equipos:</h4>
              </div>
              <div className="w-full h-px bg-gray-100 mb-6"></div>
              <div className="flex items-center gap-4 px-2">
                <TrendingUp className="w-8 h-8 text-[#f6811e] shrink-0" />
                <p className="font-medium text-gray-700 text-base">Buscan expandir su mercado</p>
              </div>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-18 h-18 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4 border border-green-100">
                  <Building2 className="w-10 h-10" />
                </div>
                <h4 className="font-bold leading-tight px-4 text-lg text-[#f6811e]">Alcaldías y Secretarías de Movilidad:</h4>
              </div>
              <div className="w-full h-px bg-gray-100 mb-6"></div>
              <div className="flex items-center gap-4 px-2">
                <Users className="w-8 h-8 text-[#34a853] shrink-0" />
                <p className="font-medium text-gray-700 text-base">Beneficios para la comunidad</p>
              </div>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-18 h-18 rounded-full bg-[#f3fff0] text-[#f6811e] flex items-center justify-center mb-4 border border-[#f6811e]/10">
                  <div className="relative">
                    <User className="w-10 h-10" />
                    <CircleDollarSign className="w-5 h-5 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />
                  </div>
                </div>
                <h4 className="font-bold leading-tight px-4 text-lg text-[#f6811e]">Empresarios Inversionistas:</h4>
              </div>
              <div className="w-full h-px bg-gray-100 mb-6"></div>
              <div className="flex items-center gap-4 px-2">
                <Handshake className="w-8 h-8 text-[#f6811e] shrink-0" />
                <p className="font-medium text-gray-700 text-base">Empresarios y accionistas interesados</p>
              </div>
            </div>

            {/* Tarjeta 4 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-18 h-18 rounded-full bg-green-50 text-green-700 flex items-center justify-center mb-4 border border-green-100">
                  <Leaf className="w-10 h-10" />
                </div>
                <h4 className="font-bold leading-tight px-4 text-lg text-[#f6811e]">Agremiaciones de GLP</h4>
              </div>
              <div className="w-full h-px bg-gray-100 mb-6"></div>
              <div className="flex items-center gap-4 px-2">
                <Leaf className="w-8 h-8 text-green-700 shrink-0" />
                <p className="font-medium text-gray-700 text-base">valoran economía + sostenibilidad.</p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-100"></div>

          {/* 5. ESTRATEGIAS PARTNER G-MAX AUTOGLP */}
          <div className="w-full">
            <div className="flex flex-col">
              {/* CONTENIDO REDUCIDO */}
              <div className="flex-1">
                {/* HEADER */}
                <div className="flex flex-col lg:flex-row gap-4 items-start mb-10 justify-start text-left w-full">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] shadow-lg flex items-center justify-center flex-shrink-0">
                      <Handshake className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-left text-[#f6811e]">
                        Estrategia partner G-MAX autoglp:
                      </h1>

                    </div>
                  </div>
                </div>

                {/* CONTENIDO CENTRAL */}
                <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-8">
                  {/* CIRCULO IZQUIERDO REDUCIDO */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-[240px] h-[240px]">
                      <div className="absolute inset-0 rounded-full border-[16px] border-[#a0b29b] shadow-inner opacity-40"></div>
                      <div className="absolute inset-[30px] bg-white rounded-full shadow-xl flex flex-col items-center justify-center text-center p-4">
                        <h3 className="font-bold text-xl text-[#f6811e]">ESTRATEGIAS</h3>
                        <h3 className="font-bold mb-2 text-xl text-[#f6811e]">PARTNER:</h3>
                        <div className="mb-2">
                          <img src="https://www.g-max.com.co/logo2.png" alt="G-MAX" className="h-10 object-contain mx-auto" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DERECHA COMPACTA */}
                  <div className="flex flex-col gap-6">
                    {/* CARD 1 */}
                    <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-start">
                      <div className="flex flex-col items-center justify-center text-center shrink-0 w-[110px]">
                        <Users className="w-5 h-5 text-[#f6811e] mb-1" />
                        <h3 className="font-black leading-tight uppercase text-xl text-[#f6811e]">ASSOCIATE</h3>
                        <h3 className="font-black leading-tight uppercase text-xl text-[#f6811e]">PARTNER</h3>
                      </div>
                      <div className="flex-1 bg-white border border-gray-200 rounded-[18px] shadow-sm overflow-hidden w-full">
                        <div className="bg-[#f6811e] text-white font-black px-4 py-1.5 text-xs uppercase tracking-wider">
                          Partners en etapa inicial
                        </div>
                        <div className="p-4">
                          <p className="text-gray-600 font-bold leading-tight mb-2 text-base">
                            Flotas públicas (alcaldias y gobernaciones)
                            <br />
                            privadas (Plataformas/Uber)
                          </p>
                          <div className="w-full h-px bg-gray-100 my-2"></div>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                            <li>• Proyectos piloto (2/5 veh.)</li>
                            <li>• Ahorro compartido</li>
                            <li>• Llave en mano</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* CARD 2 */}
                    <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-start">
                      <div className="flex flex-col items-center justify-center text-center shrink-0 w-[110px]">
                        <Wrench className="w-5 h-5 text-[#ff9800] mb-1" />
                        <h3 className="font-black leading-tight text-xl text-[#f6811e]">SOLUTION</h3>
                        <h3 className="font-black leading-tight text-xl text-[#f6811e]">PARTNER</h3>
                      </div>
                      <div className="flex-1 bg-white border border-gray-200 rounded-[18px] shadow-sm overflow-hidden w-full">
                        <div className="bg-[#ff9800] text-white font-black px-4 py-1.5 text-xs uppercase tracking-wider">
                          Partners con experiencia
                        </div>
                        <div className="p-4">
                          <p className="text-gray-600 font-bold leading-tight mb-2 text-base">
                            Talleres (Servigas - Powergas - Surigas)
                          </p>
                          <div className="w-full h-px bg-gray-100 my-2"></div>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                            <li>• Promoción al punto de venta (POP) </li>
                            <li>• Apoyo técnico permanente</li>
                            <li>• Bonos para conversión</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* CARD 3 */}
                    <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-start">
                      <div className="flex flex-col items-center justify-center text-center shrink-0 w-[110px]">
                        <Award className="w-5 h-5 text-[#b4b4a5] mb-1" />
                        <h3 className="font-black leading-tight text-xl text-[#f6811e]">PREMIUM</h3>
                        <h3 className="font-black leading-tight text-xl text-[#f6811e]">PARTNER</h3>
                      </div>
                      <div className="flex-1 bg-white border border-gray-200 rounded-[18px] shadow-sm overflow-hidden w-full">
                        <div className="bg-[#b4b4a5] text-white font-black px-4 py-1.5 text-xs uppercase tracking-wider">
                          Líderes de mercado
                        </div>
                        <div className="p-4">
                          <p className="text-gray-600 font-bold leading-tight mb-2 text-base">
                            EDS (Fusa / Melgar / Medellín / Ibague)
                          </p>
                          <div className="w-full h-px bg-gray-100 my-2"></div>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-500 font-medium">
                            <li>• Promoción en punto de venta</li>
                            <li>• Activaciones de marca</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* SECCIÓN PROPUESTA DE VALOR REDISEÑADA (SEGÚN SCREENSHOT) */}
                <div className="mt-12 pt-12 border-t border-gray-100">
                  <div className="flex items-center gap-6 mb-12 justify-start text-left w-full">
                    <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                      <Target className="w-9 h-9" />
                    </div>
                    <div className="text-left">
                      <h2 className="lg: font-black tracking-tighter leading-tight text-left text-3xl lg:text-4xl text-[#f6811e]">
                        Propuesta de valor
                      </h2>
                      <p className="mt-2 text-gray-600 font-semibold max-w-xl leading-tight text-left text-base">
                        Instalación consultiva de equipos italianos de alta tecnología para soluciones duales GLP + gasolina
                      </p>
                    </div>
                  </div>


                  {/* Ítem 1: Máx Potencia */}
                  <div className="grid grid-cols-1 sm:sm:grid-cols-4 gap-2 md:gap-4 max-w-5xl mx-auto py-8">
                    {/* Ítem 1: Máx Potencia */}
                    <div className="flex flex-col items-center text-center group">
                      <div className="w-48 h-48 md:w-80 md:h-80 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                        <img
                          src="https://i.imgur.com/w3JUxZi.png"
                          alt="Máx Potencia"
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      </div>
                      <h3 className="font-bold mb-3 text-2xl text-[#f6811e] tracking-wide">Máx<br />Potencia</h3>
                      <p className="text-gray-600 leading-normal max-w-[200px] text-lg">
                        Sin comprometer el rendimiento.
                      </p>
                    </div>

                    {/* Ítem 2: Max Economía */}
                    <div className="flex flex-col items-center text-center group">
                      <div className="w-48 h-48 md:w-80 md:h-80 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                        <img
                          src="https://i.imgur.com/uSPr6dU.png"
                          alt="Max Economía"
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      </div>
                      <h3 className="font-bold mb-3 text-2xl text-[#f6811e] tracking-wide">Máx<br />Economía</h3>
                      <p className="text-gray-600 leading-normal max-w-[200px] text-lg">
                        En cada trayecto que realizas.
                      </p>
                    </div>

                    {/* Ítem 3: Max Espacio */}
                    <div className="flex flex-col items-center text-center group">
                      <div className="w-48 h-48 md:w-80 md:h-80 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                        <img
                          src="https://i.imgur.com/cL5mqMf.png"
                          alt="Max Espacio"
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      </div>
                      <h3 className="font-bold mb-3 text-2xl text-[#f6811e] tracking-wide">Máx<br />Espacio</h3>
                      <p className="text-gray-600 leading-normal max-w-[200px] text-lg">
                        Más libertad en tu maletero.
                      </p>
                    </div>

                    {/* Ítem 4: Max Ecológico */}
                    <div className="flex flex-col items-center text-center group">
                      <div className="w-80 h-80 md:w-80 md:h-80 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                        <img
                          src="https://i.imgur.com/3yz6j9K.png"
                          alt="Max Ecológico"
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      </div>
                      <h3 className="font-bold mb-3 text-2xl text-[#f6811e] tracking-wide">Máx<br />Ecológico</h3>
                      <p className="text-gray-600 leading-normal max-w-[200px] text-lg">
                        Cuidando el medio ambiente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* FOOTER COMPACTO */}

              </div>
            </div>
          </div>

        </div> {/* Cierra el CONTENEDOR UNIFICADO */}


        {/* SECCIÓN PRINCIPAL CON EL BOTÓN */}
        <section className="w-full bg-transparent py-12 px-4 overflow-hidden">
          <div className="max-w-[1400px] mx-auto bg-white rounded-[32px] overflow-hidden shadow-xl border border-gray-100">
            <div className="bg-[#f2f8f0] pt-10 pb-10 px-8 text-left justify-start w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black tracking-tighter leading-none mb-4 text-left text-[#f6811e]">
                  Situación Actual del Mercado
                </h2>
                <p className="text-gray-700 font-medium tracking-wide text-left text-base max-w-2xl">
                  El mercado de combustibles para movilidad se encuentra en una fase de transición energética incompleta. Haz clic en el botón para ver el análisis detallado.
                </p>
              </div>

              {/* BOTÓN QUE ABRE EL MODAL */}
              <button
                onClick={openModal}
                className="group flex items-center gap-3 bg-[#f6811e] hover:bg-[#f6811e] text-white px-8 py-4 rounded-full font-black uppercase tracking-wider transition-colors duration-300 shadow-lg shadow-[#f6811e]/30 whitespace-nowrap flex-shrink-0"
              >
                <Table className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Ver Tabla Comparativa
              </button>
              {/* MODAL CON LA TABLA */}
              {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
                  {/* Fondo oscuro desenfocado */}
                  <div
                    className="absolute inset-0 bg-[#5fbd44]/80 backdrop-blur-sm"
                    onClick={closeModal}
                  ></div>

                  {/* Contenedor del Modal */}
                  <div className="relative w-full max-w-[1400px] max-h-[90vh] bg-white rounded-[32px] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">

                    {/* Botón de cerrar superior */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
                      <h3 className="text-2xl font-black text-[#f6811e] uppercase tracking-tight">Comparativa de Combustibles</h3>
                      <button
                        onClick={closeModal}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* CONTENEDOR CON SCROLL DE LA TABLA */}
                    <div className="w-full overflow-x-auto overflow-y-auto p-4 custom-scrollbar">
                      <div className="min-w-[1200px] p-2 bg-white pb-10">
                        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr] gap-x-1 gap-y-1">

                          {/* FILA 0: ENCABEZADOS DE COLUMNA */}
                          <div className="p-4"></div>

                          {[
                            { title: "GASOLINA", color: "bg-[#ffc000]" },
                            { title: "DIESEL", color: "bg-[#c00000]" },
                            { title: "GNV", color: "bg-[#70ad47]" },
                            { title: "ELECTROMOVILIDAD", color: "bg-[#00b050]" },
                            { title: "GLP", color: "bg-[#f6811e]" }
                          ].map((col, idx) => (
                            <div key={idx} className="flex items-center justify-center py-4">
                              <div className="flex items-center h-12 relative w-full justify-center pl-4">
                                <div className={`w-14 h-14 rounded-full border-[4px] border-white shadow-md z-10 ${col.color} absolute left-2 lg:left-6`}></div>
                                <div className="bg-[#e6e7e8] h-10 w-full ml-10 rounded-r-full flex items-center pl-6 pr-4 font-black text-[#5fbd44] text-[15px] xl:text-[17px] uppercase shadow-sm">
                                  {col.title}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* FILAS DE DATOS */}
                          {[
                            {
                              label: "PRECIO",
                              data: [
                                ["Incertidumbre de precios"],
                                ["Tendencia al alza de precio"],
                                ["Incertidumbre de precios"],
                                ["Bajo por km recorrido"],
                                ["Bajo-medio"]
                              ]
                            },
                            {
                              label: "CALIDAD",
                              data: [
                                ["Alta eficiencia en motores livianos"],
                                ["Alta en carga y torque"],
                                ["Buena, menor potencia"],
                                ["Muy alta (eficiencia energética)"],
                                ["Buena, rendimiento estable"]
                              ]
                            },
                            {
                              label: "PERCEPCION",
                              data: [
                                ["Tradicional, confiable"],
                                ["Potente pero contaminante"],
                                ["Económico, “menos potente”"],
                                ["Moderna, innovadora"],
                                ["Económico y funcional"]
                              ]
                            },
                            {
                              label: "TENDENCIA DE MERCADO",
                              data: [
                                ["Decreciente"],
                                ["Estancada / decreciente"],
                                ["Decreciente"],
                                ["Fuertemente creciente"],
                                ["Moderadamente creciente"]
                              ]
                            },
                            {
                              label: "APLICACIÓN TÍPICA",
                              data: [
                                ["Vehículos particulares"],
                                ["Transporte pesado"],
                                ["Flotas, taxis, transporte público"],
                                ["Flotas urbanas y particulares"],
                                ["Flotas livianas y particulares"]
                              ]
                            },
                            {
                              label: "AUTONOMIA Y COSTOS",
                              data: [
                                ["Alta Autonomia", "Costo Medio"],
                                ["Alta Autonomia", "Costo Alto"],
                                ["Media Autonomia", "Costo Bajo"],
                                ["Media Autonomia", "Costo Muy Bajo"],
                                ["Media Autonomia", "Costo Bajo"]
                              ]
                            },
                            {
                              label: "IMPACTO ECOLÓGICO",
                              data: [
                                ["Alto (CO₂ y contaminantes)"],
                                ["Muy alto (NOx, partículas)"],
                                ["Bajo"],
                                ["Muy bajo (cero emisiones directas)"],
                                ["Bajo"]
                              ]
                            }
                          ].map((row, rowIndex) => (
                            <React.Fragment key={rowIndex}>
                              <div className="bg-[#e6e7e8] flex items-center justify-center p-4 text-center rounded-sm">
                                <span className="text-[#5fbd44] font-black text-[14px] xl:text-[15px] uppercase tracking-wide">
                                  {row.label}
                                </span>
                              </div>

                              {row.data.map((cellContent, cellIndex) => (
                                <div key={cellIndex} className="bg-[#f4f6f9] p-4 flex flex-col justify-center rounded-sm">
                                  <ul className="space-y-1">
                                    {cellContent.map((item, itemIdx) => (
                                      <li key={itemIdx} className="flex items-start text-[#5fbd44] text-[14px] xl:text-[16px] font-medium leading-snug">
                                        <span className="mr-2 text-lg leading-none mt-[2px]">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </section>


        <section className="w-full bg-[#f4f6f9] py-12 px-4 overflow-hidden">
          <div className="max-w-[1400px] mx-auto bg-white rounded-[32px] overflow-hidden">

            {/* CONTENIDO */}
            <div className="w-full overflow-x-auto pb-8">
              <div className="min-w-[900px] p-6 bg-white">

                <div className="flex justify-start">
                  <div className="max-w-[800px] w-full">

                    {/* TÍTULO CON ICONO */}
                    {/* AÑADIDO: Div contenedor para agrupar todo */}
                    <div className="flex flex-col items-center">

                      {/* TÍTULO Y LOGO */}
                      <div className="flex items-center gap-6 mb-10 w-full justify-start text-left">
                        <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                          {/* Icono de Usuario genérico en SVG */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <h3 className="font-black tracking-tighter text-left text-3xl lg:text-4xl text-[#f6811e]">
                          Perfil Vendedor
                        </h3>
                      </div>

                      {/* TEXTO */}
                      <p className="max-w-[700px] text-gray-700 md: font-medium leading-relaxed mb-8 text-left w-full text-base">
                        El vendedor GASMAX no es solo un comercial, es un asesor técnico-estratégico del conductor profesional.
                      </p>

                      {/* IMAGEN */}
                      <img
                        src="https://i.imgur.com/eVHPQrF.jpeg"
                        alt="Perfil vendedor"
                        className="h-[680px] md:h-[680px] object-contain drop-shadow-xl"
                      />

                    </div> {/* ESTE ES EL DIV DE CIERRE QUE TENÍAS AL FINAL (Ahora sí tiene su pareja arriba) */}





                    {/* CARACTERÍSTICAS PROFESIONALES */}
                    <div className="mb-6 text-left w-full">
                      <h3 className="font-black mb-2 text-left text-xl text-[#f6811e]">
                        <br>
                        </br>
                        Características profesionales
                      </h3>
                      <ul className="space-y-1">
                        <li className="text-[14px] font-medium"><span className="mr-2">•</span>Formación o experiencia en la industria automotriz.</li>
                        <li className="text-[14px] font-medium"><span className="mr-2">•</span>Conoce el funcionamiento general del sistema <span className="text-[#f6811e] font-bold">autoglp</span> vehicular.</li>
                        <li className="text-[14px] font-medium"><span className="mr-2">•</span>Entiende componentes básicos de instalación: tanque, multiválvula, tubería, ECU, inyectores, regulador/vaporizador, conmutador, sensores y calibración.</li>
                        <li className="text-[14px] font-medium"><span className="mr-2">•</span>Puede explicar compatibilidades por marca y tipo de vehículo.</li>
                        <li className="text-[14px] font-medium"><span className="mr-2">•</span>Sabe hablar de instalación, tuning, puesta a punto y postventa sin tecnicismos innecesarios.</li>
                        <li className="text-[14px] font-medium"><span className="mr-2">•</span>Capacidad para explicar diferencias técnicas entre <span className="text-[#f6811e] font-bold">autoglp</span> vs Gas Natural, de forma clara y convincente.</li>
                      </ul>
                    </div>

                    {/* RASGOS COMERCIALES */}
                    <div className="mb-6 text-left w-full">
                      <h3 className="font-black mb-2 text-left text-xl text-[#f6811e]">
                        Rasgos comerciales clave
                      </h3>
                      <ul className="space-y-1">
                        <li className="text-[14px] font-medium"><span className="mr-2">•</span>Perfil comercial alto, orientado a resultados y cierre.</li>
                        <li className="text-[14px] font-medium"><span className="mr-2">•</span>Escucha activa y habilidad para detectar el dolor económico del cliente.</li>
                        <li className="text-[14px] font-medium"><span className="mr-2">•</span>Seguridad al hablar de números: ahorro, recuperación de inversión, costo por kilómetro.</li>
                        <li className="text-[14px] font-medium"><span className="mr-2">•</span>Lenguaje claro, cercano y orgánico.</li>
                        <li className="text-[14px] font-medium"><span className="mr-2">•</span>Mentalidad consultiva, no agresiva. Entiende el dolor del conductor: combustible caro, jornadas largas, mantenimiento, disponibilidad y flujo de caja.</li>
                      </ul>
                    </div>

                    {/* ACTITUD */}
                    <div className="text-left w-full">
                      <h3 className="font-black mb-2 text-left text-xl text-[#f6811e]">
                        Actitud GASMAX
                      </h3>
                      <ul className="space-y-1">
                        <li className="text-[14px] font-medium"><span className="mr-2">•</span>Profesional, confiable y aspiracional.</li>
                        <li className="text-[14px] font-medium"><span className="mr-2">•</span>Proyecta dominio técnico y orgullo de marca.</li>
                        <li className="text-[14px] font-medium"><span className="mr-2">•</span>Se posiciona como experto que cuida el activo más importante del cliente: su vehículo y sus ingresos.Capaz de convertir dudas en certeza.</li>
                      </ul>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* BOTÓN SIGUIENTE LECCIÓN */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => navigate(`/curso/4`)}
            className="flex items-center gap-2 bg-[#f6811e] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#5fbd44] transition-all shadow-lg shadow-[#f6811e]/20 group"
          >
            Siguiente Lección
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div >
  );
};