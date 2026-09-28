import React from 'react';
import { Settings, Power, Gauge, Lightbulb, Settings2, Car, ToggleRight, ShieldAlert, AlertTriangle, Wrench, Cpu, RefreshCcw, ShieldCheck, LineChart, Target, CheckCircle2, Zap } from 'lucide-react';

export const Course1Leccion3Content = () => {
  return (
          <div className="py-6 flex flex-col gap-8 w-full">

            {/* TARJETA BLANCA GIGANTE QUE ENVUELVE A, B y C */}
            <div className="bg-white rounded-[24px] border border-gray-100 p-6 md:p-10 shadow-sm flex flex-col gap-10">

              {/* --- SECCIÓN A --- */}
              <div className="max-w-4xl mx-auto w-full">
                {/* ENCABEZADO E INTRODUCCIÓN */}
                <div className="leading-relaxed text-gray-700 text-base">
                  <div className="flex items-center gap-6 mb-8 justify-start text-left w-full">
                    <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                      <Settings className="w-9 h-9" />
                    </div>
                    <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-left text-xl lg:text-2xl">
                      EL CONMUTADOR
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6 text-base">
                    El conmutador tiene dos posiciones que permiten el <span className="font-bold text-[#f6811e]">funcionamiento a gas</span> con arranque a gasolina y conmutación automática, el funcionamiento a gasolina y el funcionamiento a <span className="text-[#f6811e] font-bold lowercase">autoglp</span>.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-6 text-base">
                    La primera es la <span className="font-bold text-[#f6811e]">modalidad aconsejada</span> para la correcta utilización del vehículo.
                  </p>
                </div>

                {/* SEPARADOR (PUNTO A) */}
                <div className="mt-12 mb-10 flex items-center gap-4">
                  <span className="bg-[#f6811e] text-white px-6 py-2 rounded-full font-black text-sm tracking-widest shadow-lg shadow-[#f6811e]/20 uppercase">
                    A) Funcionamiento con conmutación automática gasolina - <span className="lowercase">autoglp</span>
                  </span>
                  <div className="h-px bg-[#f6811e] flex-1 opacity-20"></div>
                </div>
              </div>

              {/* GRID DE TARJETAS A */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tarjeta 1 */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Power className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Arranque y<br />Transición</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    Con la tecla del conmutador en posición automática el vehículo <span className="font-bold">arranca a gasolina</span> y luego conmuta automáticamente a gas.
                  </p>
                </div>
                {/* Tarjeta 2 */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Gauge className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Condiciones de<br />Conmutación</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    La conmutación ocurre en aceleración o aceleración (según las impostaciones configuradas por el instalador), después que se haya superado un <span className="font-bold">umbral de revoluciones</span> del motor programado y después de una disminución del régimen motor configurado antes, o bien después de una deceleración.
                  </p>
                </div>
                {/* Tarjeta 3 */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Lightbulb className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Indicadores<br />LED</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    Durante el funcionamiento a gasolina del motor, el LED del conmutador se enciende de color <span className="font-bold text-[#f59e0b]">amarillo</span> y cambia a <span className="font-bold text-[#10b981]">verde</span> cuando el motor marcha a <span className="text-[#f6811e] font-bold lowercase">autoglp</span>.
                  </p>
                </div>
              </div>

              {/* --- SECCIÓN B --- */}
              <div className="mt-4 mb-2 flex items-center gap-4">
                <span className="bg-[#f6811e] text-white px-6 py-2 rounded-full font-black text-sm tracking-widest shadow-lg shadow-[#f6811e]/20 uppercase">
                  B) Funcionamiento a gasolina
                </span>
                <div className="h-px bg-[#f6811e] flex-1 opacity-20"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Settings2 className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Configuración<br />y Estado</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    Con la tecla del conmutador presionado (o hacia el símbolo de la bomba de gasolina), el LED del conmutador se enciende de color <span className="font-bold text-red-500">rojo</span>, los inyectores marchan, las electroválvulas <span className="text-[#f6811e] font-bold lowercase">autoglp</span> están cerradas y el sistema de control del caudal de Glp está desactivado.
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Car className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Comportamiento<br />del Vehículo</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    El vehículo marcha regularmente a <span className="font-bold">gasolina</span>, como si no hubiera ningún equipo de <span className="text-[#f6811e] font-bold lowercase">autoglp</span> instalado.
                  </p>
                </div>
              </div>

              {/* --- SECCIÓN C --- */}
              <div className="mt-8 mb-2 flex items-center gap-4">
                <span className="bg-[#f6811e] text-white px-6 py-2 rounded-full font-black text-sm tracking-widest shadow-lg shadow-[#f6811e]/20 uppercase">
                  C) Funcionamiento a gas
                </span>
                <div className="h-px bg-[#f6811e] flex-1 opacity-20"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <ToggleRight className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Configuración<br />y Estado</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    Con la tecla del conmutador presionado hacia la derecha, el LED del conmutador se enciende de color <span className="font-bold text-green-500">verde</span> y el sistema marcha solamente a <span className="text-[#f6811e] font-bold lowercase">autoglp</span>.
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Sistema de<br />Seguridad</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    El sistema conmuta de toda manera a gasolina en caso de <span className="font-bold">falta de arranque</span> o de <span className="font-bold">apagado accidental</span>.
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Uso y<br />Recomendaciones</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base mb-4">
                    Hay que considerar el funcionamiento con conmutador en posición gas como <span className="font-bold">solución de emergencia</span>, para ser utilizado sólo en caso de avería del equipo gasolina, y con la precaución de nunca dejar que el tanque gasolina se vacíe completamente.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    Es posible seleccionar el funcionamiento sólo a gasolina o sólo a gas, si la disponibilidad de carburantes lo hace necesario.
                  </p>
                </div>
              </div>

            </div> {/* CIERRE TARJETA BLANCA GIGANTE */}



            {/* NUEVA TARJETA BLANCA GIGANTE: VEHÍCULOS CON CARBURADOR */}
            <div className="bg-white rounded-[24px] border border-gray-100 p-6 md:p-10 shadow-sm flex flex-col gap-10">

              {/* ENCABEZADO E INTRODUCCIÓN */}
              <div className="max-w-4xl mx-auto w-full">
                <div className="leading-relaxed text-gray-700 text-base">
                  <div className="flex items-center gap-6 mb-8 justify-start text-left w-full">
                    <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                      <Wrench className="w-9 h-9" />
                    </div>
                    <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-left text-xl lg:text-2xl">
                      ARRANQUE Y CONMUTACIÓN PARA VEHÍCULOS CON CARBURADOR
                    </h3>
                  </div>
                </div>

                {/* SEPARADOR (PUNTO A) */}
                <div className="mt-8 mb-10 flex items-center gap-4">
                  <div className="h-px bg-[#f6811e] flex-1 opacity-20"></div>
                  <span className="bg-[#f6811e] text-white px-6 py-2 rounded-full font-black text-sm tracking-widest shadow-lg shadow-[#f6811e]/20 text-center uppercase">
                    A) Funcionamiento a gasolina
                  </span>
                  <div className="h-px bg-[#f6811e] flex-1 opacity-20"></div>
                </div>
              </div>

              {/* GRID A (2 Columnas) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tarjeta 1 - A */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Settings2 className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Alimentación<br />y LED</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    Con el conmutador en posición gasolina, se obtiene la alimentación de la electroválvula gasolina y el color <span className="font-bold text-red-500">rojo</span> del LED situado sobre el conmutador mismo, permite el flujo normal de gasolina al carburador.
                  </p>
                </div>

                {/* Tarjeta 2 - A */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Car className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Modalidad de<br />Trabajo</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    En esta posición el vehículo, solo trabaja en modalidad <span className="font-bold">gasolina</span>.
                  </p>
                </div>
              </div>

              {/* --- SECCIÓN B --- */}
              <div className="mt-4 mb-2 flex items-center gap-4">
                <div className="h-px bg-[#f6811e] flex-1 opacity-20"></div>
                <span className="bg-[#f6811e] text-white px-6 py-2 rounded-full font-black text-sm tracking-widest shadow-lg shadow-[#f6811e]/20 text-center">
                  B) FUNCIONAMIENTO A autoglp
                </span>
                <div className="h-px bg-[#f6811e] flex-1 opacity-20"></div>
              </div>

              {/* GRID B (2 Columnas) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tarjeta 1 - B */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Power className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Alimentación<br />y LED</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    Con el conmutador en posición gasolina, se obtiene, la alimentación de la electroválvula de gasolina y el color <span className="font-bold text-green-500">verde</span> del LED situado sobre el conmutador mismo.
                  </p>
                </div>

                {/* Tarjeta 2 - B */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Zap className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Modalidad de<br />Trabajo</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    En esta posición enciende y trabaja solo en <span className="text-[#f6811e] font-bold">autoglp</span>.
                  </p>
                </div>
              </div>

              {/* --- SECCIÓN C --- */}
              <div className="mt-8 mb-2 flex items-center gap-4">
                <div className="h-px bg-[#f6811e] flex-1 opacity-20"></div>
                <span className="bg-[#f6811e] text-white px-6 py-2 rounded-full font-black text-sm tracking-widest shadow-lg shadow-[#f6811e]/20 text-center">
                  C)  CONMUTACIÓN GASOLINA - autoglp
                </span>
                <div className="h-px bg-[#f6811e] flex-1 opacity-20"></div>
              </div>

              {/* GRID C (3 Columnas) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tarjeta 1 - C */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Cpu className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Control de la<br />Centralita</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base mb-4">
                    La centralita efectúa el pasaje de alimentación de gasolina a <span className="text-[#f6811e] font-bold">autoglp</span>, sin riesgo a que el vehículo se ahogue, siguiendo los procedimientos indicados.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    Con la tecla de conmutación en posición central se actúa el cierre contemporáneo de todas las electroválvulas.
                  </p>
                </div>

                {/* Tarjeta 2 - C */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Gauge className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Transición a<br />autoglp</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    Una vez el carburador se haya vaciado (perceptible por una ligera disminución de potencia), es suficiente llevar el conmutador a la posición <span className="text-[#f6811e] font-bold">autoglp</span> (función no prevista para todos los modelos).
                  </p>
                </div>

                {/* Tarjeta 3 - C */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <RefreshCcw className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-[#f6811e] uppercase leading-tight text-left text-lg">Transición a<br />Gasolina</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-left text-base mb-4">
                    Para conmutar, es suficiente traer el conmutador de la posición autoglp a gasolina. Deteniendo la tecla en posición central se actúa el llenado del carburador (perceptible por una ligera disminución de potencia).
                  </p>
                  <p className="text-gray-700 leading-relaxed text-left text-base">
                    Una vez el carburador se haya vaciado (perceptible por una ligera disminución de potencia), es suficiente llevar el conmutador a la posición <span className="text-[#f6811e] font-bold">autoglp</span> (función no prevista para todos los modelos).
                  </p>
                </div>
              </div>

              {/* TARJETA BLANCA 3: INDICADOR DE NIVEL */}
              <div className="bg-white rounded-[24px] border border-gray-100 p-6 md:p-10 shadow-sm flex flex-col gap-6">

                {/* ENCABEZADO */}
                <div className="max-w-4xl mx-auto w-full">
                  <div className="flex items-center gap-6 mb-6 justify-start text-left w-full">
                    <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                      <Gauge className="w-9 h-9" />
                    </div>
                    <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-left text-xl lg:text-2xl">
                      INDICADOR DE NIVEL PARA VEHÍCULOS DE INYECCIÓN Y CON CARBURADOR
                    </h3>
                  </div>

                  {/* DESCRIPCIÓN */}
                  <div className="text-gray-600 leading-relaxed text-base flex flex-col gap-4">
                    <p>
                      El conmutador tiene también función de medidor de nivel gracias al encendido de los LED situados sobre el conmutador mismo. Normalmente el conmutador tiene <span className="font-bold text-[#10b981]">4 LED verdes</span> indicando la cantidad de gas que hay en el tanque (4 LED=4/4, 3 LED=3/4, 2 LED=2/4, 1 LED=1/4).
                    </p>
                    <p>
                      La indicación de reserva está señalada por el encendido titilante del primer LED verde. Normalmente el conmutador tiene 4 LED verdes indicando la cantidad de <span className="text-[#f6811e] font-bold">autoglp</span> existente.
                    </p>
                  </div>

                  {/* NOTA DESTACADA (AZUL CLARITO) */}
                  <div className="mt-8 bg-[#f2ffef] border border-[#f6811e]/30 rounded-[16px] p-6 shadow-sm flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-white text-[#f6811e] flex items-center justify-center flex-shrink-0 border border-[#f6811e]/20 shadow-sm mt-0.5">
                      <span className="font-black text-2xl leading-none">!</span>
                    </div>
                    <div>
                      <h4 className="text-[#f6811e] font-black uppercase tracking-widest text-[13px] mb-1.5">
                        NOTAS:
                      </h4>
                      <p className="text-[#f6811e] leading-relaxed text-[15px] font-medium">
                        Aconsejamos siempre utilizar el cuenta kilómetros parcial para tener bajo control la autonomía del vehículo. En algunos conmutadores se encuentra un especial LED <span className="font-bold text-red-500">rojo</span> que señala la reserva.
                      </p>
                    </div>
                  </div>

                </div>
              </div> {/* CIERRE DE TARJETA INDICADOR DE NIVEL */}

              {/* TARJETA BLANCA 4: PARTES DEL CONMUTADOR */}
              <div className="bg-white rounded-[24px] border border-gray-100 p-6 md:p-10 shadow-sm flex flex-col gap-8">

                {/* ENCABEZADO */}
                <div className="max-w-4xl mx-auto w-full">
                  <div className="flex items-center gap-6 mb-8 justify-start text-left w-full">
                    <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                      <Settings className="w-9 h-9" />
                    </div>
                    <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-left text-xl lg:text-2xl">
                      EL CONMUTADOR
                    </h3>
                  </div>

                  {/* LISTA DE PARTES */}
                  <ul className="flex flex-col gap-4">

                    {/* 1. Tecla de conmutación (Gris) */}
                    <li className="flex gap-5 items-start bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <span className="text-white text-[18px] font-black">1</span>
                      </div>
                      <div>
                        <p className="text-[16px] text-[#f6811e] font-black uppercase leading-tight mb-1.5">
                          Tecla de conmutación:
                        </p>
                        <p className="text-[15px] text-gray-700 leading-relaxed font-medium">
                          Sirve para seleccionar el tipo de alimentación: gasolina o gas; al pulsarla, se pasa de un tipo de combustible al otro.
                        </p>
                      </div>
                    </li>

                    {/* 2. Testigo verde (Verde) */}
                    <li className="flex gap-5 items-start bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <span className="text-white text-[18px] font-black">2</span>
                      </div>
                      <div>
                        <p className="text-[16px] text-[#10b981] font-black uppercase leading-tight mb-1.5">
                          Testigo verde:
                        </p>
                        <p className="text-[15px] text-gray-700 leading-relaxed font-medium">
                          Funcionamiento con gas y señalización del diagnóstico.
                        </p>
                      </div>
                    </li>

                    {/* 3. Testigo naranja (Naranja) */}
                    <li className="flex gap-5 items-start bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-[#f59e0b] flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <span className="text-white text-[18px] font-black">3</span>
                      </div>
                      <div>
                        <p className="text-[16px] text-[#f59e0b] font-black uppercase leading-tight mb-1.5">
                          Testigo naranja:
                        </p>
                        <p className="text-[15px] text-gray-700 leading-relaxed font-medium">
                          Funcionamiento con gasolina.
                        </p>
                      </div>
                    </li>

                    {/* 4. Testigo rojo (Rojo) */}
                    <li className="flex gap-5 items-start bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <span className="text-white text-[18px] font-black">4</span>
                      </div>
                      <div>
                        <p className="text-[16px] text-red-500 font-black uppercase leading-tight mb-1.5">
                          Testigo rojo:
                        </p>
                        <p className="text-[15px] text-gray-700 leading-relaxed font-medium">
                          Indicador de reserva de combustible.
                        </p>
                      </div>
                    </li>

                    {/* 5. Testigos verdes (Verde) */}
                    <li className="flex gap-5 items-start bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                        <span className="text-white text-[18px] font-black">5</span>
                      </div>
                      <div>
                        <p className="text-[16px] text-[#10b981] font-black uppercase leading-tight mb-1.5">
                          Testigos verdes:
                        </p>
                        <p className="text-[15px] text-gray-700 leading-relaxed font-medium">
                          Nivel de combustible.
                        </p>
                      </div>
                    </li>

                    {/* 6. Timbre interno (Blanco con borde) */}
                    <li className="flex gap-5 items-center bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-gray-700 text-[18px] font-black">6</span>
                      </div>
                      <div>
                        <p className="text-[16px] text-gray-700 font-black uppercase leading-tight">
                          Timbre interno.
                        </p>
                      </div>
                    </li>

                  </ul>
                </div> {/* CERRAR contenedor max-w-4xl de la Tarjeta 4 */}
              </div> {/* CERRAR Tarjeta Blanca 4 */}

              <br /> {/* CORRECCIÓN: Etiqueta br auto-cerrada */}

              {/* TARJETA BLANCA 5: FUNCIONES DEL CONMUTADOR */}
              <div className="bg-white rounded-[24px] border border-gray-100 p-6 md:p-10 shadow-sm flex flex-col gap-8">

                {/* ENCABEZADO */}
                <div className="max-w-4xl mx-auto w-full">
                  <div className="flex items-center gap-6 mb-8 justify-start text-left w-full">
                    <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                      <ToggleRight className="w-9 h-9" />
                    </div>
                    <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-left text-xl lg:text-2xl">
                      FUNCIONES DEL CONMUTADOR
                    </h3>
                  </div>

                  {/* CONTENEDOR DE LA IMAGEN */}
                  <div className="w-full bg-gray-50 rounded-[20px] border border-gray-100 p-4 sm:p-8 flex items-center justify-center shadow-inner">
                    <img
                      src="https://i.imgur.com/EsOHnmM.png"
                      alt="Funciones del Conmutador"
                      className="max-w-full h-auto object-contain rounded-xl drop-shadow-sm"
                    />
                  </div>
                </div>

              </div> {/* CIERRE DE TARJETA FUNCIONES DEL CONMUTADOR */}

              {/* TARJETA BLANCA 6: INDICACIÓN DE CANTIDAD */}
              <div className="bg-white rounded-[24px] border border-gray-100 p-6 md:p-10 shadow-sm flex flex-col gap-8">
                <div className="max-w-4xl mx-auto w-full">

                  {/* ENCABEZADO */}
                  <div className="flex items-center gap-6 mb-6 justify-start text-left w-full">
                    <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                      <Gauge className="w-9 h-9" />
                    </div>
                    <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-left text-xl lg:text-2xl leading-tight">
                      INDICACIÓN DE LA CANTIDAD DE autoglp EN EL DEPÓSITO
                    </h3>
                  </div>

                  {/* PRIMER PÁRRAFO */}
                  <p className="text-gray-700 leading-relaxed text-[16px] font-medium mb-8">
                    La cantidad de combustible contenida en el depósito se indica mediante el encendido de distintos testigos conforme al siguiente esquema:
                  </p>

                  {/* CONTENEDOR DE LA IMAGEN */}
                  <div className="w-full bg-gray-50 rounded-[20px] border border-gray-100 p-6 sm:p-10 flex items-center justify-center shadow-inner mb-8">
                    <img
                      src="https://i.imgur.com/7VgrRuq.png"
                      alt="Esquema de indicadores de combustible"
                      className="max-w-full h-auto object-contain drop-shadow-sm mix-blend-multiply"
                    />
                  </div>

                  {/* EXPLICACIÓN TÉCNICA (PÁRRAFO FINAL DESTACADO) */}
                  <div className="bg-[#f2ffef] border border-[#f6811e]/20 rounded-[16px] p-6 shadow-sm">
                    <p className="text-[#f6811e] leading-relaxed text-[15px] font-medium">
                      En las instalaciones del <span className="font-black text-[#f6811e]">autoglp</span>, el gas se almacena en el depósito en estado líquido: el nivel se mide por la altura de la parte líquida. En las instalaciones de <span className="font-bold">metano</span>, el gas se almacena en el depósito en estado gaseoso: el nivel se mide por la presión interior del depósito.
                    </p>
                  </div>

                </div>
              </div> {/* CIERRE DE TARJETA INDICACIÓN DE CANTIDAD */}

              {/* TARJETA BLANCA 7: REVISIONES OBLIGATORIAS DE SEGURIDAD */}
              <div className="bg-white rounded-[24px] border border-gray-100 p-6 md:p-10 shadow-sm flex flex-col gap-10">
                <div className="max-w-4xl mx-auto w-full">

                  {/* ENCABEZADO */}
                  <div className="flex items-center gap-6 mb-8 justify-start text-left w-full">
                    <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                      <ShieldCheck className="w-9 h-9" />
                    </div>
                    <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-left text-xl lg:text-2xl leading-tight">
                      REVISIONES OBLIGATORIAS DE SEGURIDAD
                    </h3>
                  </div>

                  {/* PUNTO 1: PRUEBA QUINQUENAL */}
                  <div className="flex flex-col gap-6 mb-12">

                    <div className="flex items-center gap-4">
                      <span className="bg-[#f6811e] text-white px-6 py-2 rounded-full font-black text-sm tracking-widest shadow-lg uppercase">
                        1. PRUEBA QUINQUENAL
                      </span>
                      <div className="h-px bg-[#f6811e] flex-1 opacity-20"></div>
                    </div>

                    <p className="text-gray-700 leading-relaxed text-[16px] font-medium">
                      Todo tanque debe ser sometido cada cinco años a una revisión técnica, donde se define su permanencia o sustitución mediante la determinación de los siguientes parámetros, entre otros:
                    </p>

                    {/* Grid 2 Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                      <div className="bg-gray-50 rounded-[16px] border border-gray-100 p-6 flex flex-col items-center text-center shadow-sm">
                        <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center mb-4 shadow-md">
                          <LineChart className="w-7 h-7" />
                        </div>
                        <p className="text-[#f6811e] font-black uppercase text-[15px] leading-snug">
                          Porcentaje de expansión permanente.
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-[16px] border border-gray-100 p-6 flex flex-col items-center text-center shadow-sm">
                        <div className="w-14 h-14 rounded-full bg-[#f6811e] text-white flex items-center justify-center mb-4 shadow-md">
                          <AlertTriangle className="w-7 h-7" />
                        </div>
                        <p className="text-[#f6811e] font-black uppercase text-[15px] leading-snug">
                          Pérdida de espesor de pared por corrosión o rozamiento.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PUNTO 2: REVISIÓN ANUAL */}
                  <div className="flex flex-col gap-6">

                    <div className="flex items-center gap-4">
                      <span className="bg-[#f6811e] text-white px-6 py-2 rounded-full font-black text-sm tracking-widest shadow-lg uppercase">
                        2. REVISIÓN ANUAL
                      </span>
                      <div className="h-px bg-[#f6811e] flex-1 opacity-20"></div>
                    </div>

                    <p className="text-gray-700 leading-relaxed text-[16px] font-medium">
                      Inspección que se realiza cada año por organismo de certificación:
                    </p>

                    {/* Grid 4 Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                      {/* Card 1 */}
                      <div className="bg-white rounded-[16px] border border-[#f6811e]/30 p-5 flex flex-col items-center text-center shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-[#f2ffef] text-[#f6811e] flex items-center justify-center mb-3">
                          <Settings className="w-6 h-6" />
                        </div>
                        <p className="text-gray-800 font-bold text-[14px] leading-tight">
                          Revisión<br />componentes.
                        </p>
                      </div>

                      {/* Card 2 */}
                      <div className="bg-white rounded-[16px] border border-[#f6811e]/30 p-5 flex flex-col items-center text-center shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-[#f2ffef] text-[#f6811e] flex items-center justify-center mb-3">
                          <Target className="w-6 h-6" />
                        </div>
                        <p className="text-gray-800 font-bold text-[14px] leading-tight">
                          Concordancia<br />de seriales.
                        </p>
                      </div>

                      {/* Card 3 */}
                      <div className="bg-white rounded-[16px] border border-[#f6811e]/30 p-5 flex flex-col items-center text-center shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-[#f2ffef] text-[#10b981] flex items-center justify-center mb-3">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="text-gray-800 font-bold text-[14px] leading-tight">
                          Estanqueidad de<br />componentes.
                        </p>
                      </div>

                      {/* Card 4 */}
                      <div className="bg-white rounded-[16px] border border-[#f6811e]/30 p-5 flex flex-col items-center text-center shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-[#f2ffef] text-[#f59e0b] flex items-center justify-center mb-3">
                          <Zap className="w-6 h-6" />
                        </div>
                        <p className="text-gray-800 font-bold text-[14px] leading-tight">
                          Funcionamiento.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div> {/* CIERRE DE TARJETA REVISIONES OBLIGATORIAS */}

              {/* TARJETA BLANCA 8: NORMAS DE SEGURIDAD */}
              <div className="bg-white rounded-[24px] border border-gray-100 p-6 md:p-10 shadow-sm flex flex-col gap-8">
                <div className="max-w-4xl mx-auto w-full">

                  {/* ENCABEZADO */}
                  <div className="flex items-center gap-6 mb-8 justify-start text-left w-full">
                    <div className="w-16 h-16 rounded-full bg-[#f6811e] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                      <ShieldAlert className="w-9 h-9" />
                    </div>
                    <h3 className="font-black tracking-tighter text-[#f6811e] uppercase text-left text-xl lg:text-2xl leading-tight">
                      NORMAS DE SEGURIDAD
                    </h3>
                  </div>

                  {/* CONTENIDO DE NORMAS */}
                  <div className="flex flex-col gap-6">

                    {/* PUNTO 1: MANIPULACIÓN */}
                    <div className="bg-gray-50 rounded-[16px] p-6 sm:p-8 border-l-[6px] border-[#f6811e] shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                          <Wrench className="w-5 h-5 text-[#f6811e]" />
                        </div>
                        <h4 className="text-[#f6811e] font-black uppercase text-lg">
                          MANIPULACIÓN DE LA INSTALACIÓN
                        </h4>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-[15px] font-medium">
                        El usuario del vehículo convertido a <span className="font-bold text-[#f6811e]">autoglp</span>, no debe realizar ningún cambio sobre la instalación, ni sobre ninguna de las partes correspondientes al equipo. Todo este conjunto ha sido montado, calibrado y probado por personal idóneo y técnicos entrenados para este fin y su instalación y funcionamiento han sido controlados y aprobados por las autoridades competentes. Ante cualquier problema que se le presente con su vehículo debe recurrir al taller de servicio autorizado.
                      </p>
                    </div>

                    {/* PUNTO 2: PERDIDAS DE AUTOGLP (Destacado en Naranja/Ámbar) */}
                    <div className="bg-[#fffbeb] rounded-[16px] p-6 sm:p-8 border-l-[6px] border-[#f59e0b] shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-orange-100">
                          <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
                        </div>
                        <h4 className="text-[#b45309] font-black ">
                          PÉRDIDAS DE <span className="font-bold text-[#f6811e]">autoglp</span>
                        </h4>
                      </div>
                      <p className="text-[#92400e] leading-relaxed text-[15px] font-medium mb-4">
                        Si el usuario detecta alguna pérdida de gas en el área del motor, deberá apagar el mismo y cerrar la válvula manual del cilindro o cilindros de gas, girando la manija en sentido de las manecillas del reloj, dirigirse a un taller autorizado para solucionar la fuga.
                      </p>
                      <p className="text-[#92400e] leading-relaxed text-[15px] font-medium">
                        En caso de accidente, pare el motor y cierre todas las válvulas de los cilindros, si tiene pasajeros hágalos bajar, interrumpa el circuito de la batería y si hay fuego atáquelo con los extintores.
                      </p>
                    </div>

                    {/* PUNTO 3: REVISIÓN DEL TANQUE */}
                    <div className="bg-gray-50 rounded-[16px] p-6 sm:p-8 border-l-[6px] border-[#f6811e] shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                          <Settings className="w-5 h-5 text-[#f6811e]" />
                        </div>
                        <h4 className="text-[#f6811e] font-black uppercase text-lg">
                          REVISIÓN DEL TANQUE
                        </h4>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-[15px] font-medium mb-4">
                        Todo <span className="font-bold">TANQUE</span> tiene su número de serie, para realizar su trazabilidad durante su vida útil.
                      </p>
                      <p className="text-gray-700 leading-relaxed text-[15px] font-medium mb-4">
                        Es necesario evitar que se reduzca el espesor de la pared del cilindro por talladuras, rozamiento o golpes, así como protegerlo de ataques corrosivos químicos en la superficie externa del mismo. Es necesario evitar mantener en el baúl del vehículo productos combustibles.
                      </p>
                      <p className="text-gray-700 leading-relaxed text-[15px] font-medium">
                        No permita que se altere o se modifique el número de serie de su cilindro ya que esto ocasionaría la pérdida o anulación de este para la certificación como apto para trabajar con él.
                      </p>
                    </div>

                  </div>

                </div>
              </div> {/* CIERRE DE TARJETA NORMAS DE SEGURIDAD */}

            </div> {/* CIERRE DE LA NUEVA TARJETA BLANCA GIGANTE */}
          </div>
  );
};
