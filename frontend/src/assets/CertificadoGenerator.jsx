import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Award, CheckCircle } from 'lucide-react';

// JPEG, no PNG. El certificado se rasteriza entero y el diseño tiene
// degradados, sombras y logos, asi que como PNG lossless el PDF salia de
// ~10 MB: inalcanzable para adjuntarlo a un correo. A JPEG 0.95 con el doble
// de pixel ratio queda indistinguishable al imprimir y pesa ~300 KB.
const CALIDAD = 0.95;
const FONDO = '#ffffff';

const renderizarPDF = async (element) => {
    // Un nodo sin layout (display:none, un padre oculto, o todavia sin montar)
    // se rasteriza como un lienzo vacio: el PDF salia en blanco y se enviaba
    // por correo sin que nada fallara. Se corta aca, con un motivo util.
    const { offsetWidth, offsetHeight } = element;
    if (!offsetWidth || !offsetHeight) {
        throw new Error(
            'El certificado no tiene tamaño visible (esta oculto o todavia no se pintó). ' +
            'Recargá la página e intentá de nuevo.'
        );
    }

    const dataUrl = await toJpeg(element, {
        quality: CALIDAD,
        pixelRatio: 2,
        // El JPEG no tiene canal alfa: sin esto, lo que quede fuera del
        // elemento se rasteriza negro.
        backgroundColor: FONDO,
    });

    // html-to-image devuelve "data:," cuando no logra rasterizar nada.
    if (!dataUrl || dataUrl.length < 100) {
        throw new Error('No se pudo convertir el certificado a imagen. Probá de nuevo.');
    }

    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'in',
        format: 'letter'
    });

    // El nodo mide 1056x816 px, que es exactamente 11x8.5 pulgadas a 96 dpi:
    // estirar a medidas fijas sin encajar la relacion de aspecto deformaba el
    // diseño si el ancho de la pagina no cuadraba.
    const ancho = 11;
    const alto = 8.5;
    const proporcion = offsetWidth / offsetHeight;
    const proporcionPagina = ancho / alto;
    let destinoAncho = ancho;
    let destinoAlto = alto;
    if (proporcion > proporcionPagina) {
        destinoAlto = ancho / proporcion;
    } else {
        destinoAncho = alto * proporcion;
    }
    const offsetX = (ancho - destinoAncho) / 2;
    const offsetY = (alto - destinoAlto) / 2;

    pdf.addImage(dataUrl, 'JPEG', offsetX, offsetY, destinoAncho, destinoAlto);
    return pdf;
};

const CertificadoGenerator = forwardRef(({
    nombreUsuario,
    curso = 'Inducción Comercial de Ventas',
    fecha,
    score,
    total,
    porcentaje,
    umbral,
}, ref) => {
    const certificadoRef = useRef();

    useImperativeHandle(ref, () => ({
        generarPDF: async () => {
            const element = certificadoRef.current;
            if (!element) return null;

            const pdf = await renderizarPDF(element);
            return pdf.output('blob');
        },
        descargarPDF: async () => {
            try {
                const element = certificadoRef.current;
                if (!element) {
                    alert('Error: No se encontró el elemento del certificado en el DOM.');
                    return;
                }

                const pdf = await renderizarPDF(element);
                pdf.save(`Certificado_${nombreUsuario}_${fecha}.pdf`);

            } catch (err) {
                console.error('Error al descargar el PDF:', err);
                alert('Hubo un error al intentar descargar el certificado: ' + err.message);
            }
        }
    }));

    // Fuera de la vista pero NO oculto: `display:none`, `visibility:hidden` o
    // quitarlo del DOM dejan el nodo sin layout y html-to-image devuelve un
    // lienzo vacio (PDF en blanco). Por eso va con `position: fixed` y
    // `left: -12000px`: el navegador lo sigue maquetando y rasterizando, y
    // el usuario no lo ve ni puede chocar con el.
    return (

        <div style={{ position: 'fixed', top: 0, left: '-12000px', width: '1056px', height: '816px', pointerEvents: 'none' }}>
            <div
                ref={certificadoRef}
                className="w-[1056px] h-[816px] relative overflow-hidden bg-white flex items-center justify-center p-8"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                {/* === DECORACIONES DE FONDO === */}
                {/* Gradiente principal / borde */}
                <div className="absolute inset-0 bg-[#e4fcde] opacity-30 z-0"></div>
                <div className="absolute inset-0 border-[12px] border-[#f6811e] z-0"></div>

                {/* Esquina Inferior Izquierda */}
                <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] z-0">
                    <div className="absolute bottom-0 left-0 w-full h-full bg-[#f6811e] origin-bottom-left transform rotate-45 scale-150 opacity-20"></div>
                    <div className="absolute bottom-10 left-10 w-full h-full bg-[#5fbd44] origin-bottom-left transform rotate-45 scale-110"></div>
                    <div className="absolute bottom-24 left-24 w-full h-full bg-[#5fbd44] origin-bottom-left transform rotate-45 scale-75 opacity-80"></div>
                </div>

                {/* Esquina Superior Derecha */}
                <div className="absolute -top-20 -right-20 w-[400px] h-[400px] z-0">
                    <div className="absolute top-0 right-0 w-full h-full bg-[#f6811e] origin-top-right transform rotate-45 scale-150 opacity-20"></div>
                    <div className="absolute top-10 right-10 w-full h-full bg-[#5fbd44] origin-top-right transform rotate-45 scale-110"></div>
                    <div className="absolute top-24 right-24 w-full h-full bg-[#5fbd44] origin-top-right transform rotate-45 scale-75 opacity-80"></div>
                </div>

                {/* === CONTENEDOR BLANCO CENTRAL === */}
                <div className="relative z-10 w-full h-full bg-white rounded-3xl shadow-xl flex flex-col justify-between p-16 border border-gray-100">

                    {/* HEADER: Logos y Título */}
                    <div className="flex flex-col items-center justify-center mt-4">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-[#f6811e] rounded-full flex items-center justify-center text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-[72px] font-black text-[#5fbd44] leading-none tracking-tight">
                                    CERTIFICADO
                                </h1>
                                <div className="flex items-baseline gap-3 mt-1">
                                    <h2 className="text-[32px] font-black text-[#50634b] uppercase tracking-wide">
                                        RUTA DE
                                    </h2>
                                    <h2 className="text-[36px] font-black text-[#f6811e] tracking-tight">
                                        INDUCCIÓN
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CUERPO CENTRAL */}
                    <div className="flex flex-col items-center text-center mt-12 flex-1">
                        <p className="text-[28px] font-bold text-[#5fbd44] mb-12">
                            Otorgado a
                        </p>

                        <h2 className="text-[52px] font-black text-[#5fbd44] mb-4 uppercase tracking-wide">
                            {nombreUsuario}
                        </h2>

                        <div className="w-full max-w-[800px] h-[3px] bg-[#f6811e] mb-12"></div>

                        <p className="text-[22px] font-bold text-[#5fbd44] max-w-[700px] leading-snug">
                            Por haber completado satisfactoriamente {curso.toLowerCase().includes('inducción') ? 'la' : 'el curso'} <br />
                            <span className="text-[#f6811e]">{curso}</span> en la modalidad online.
                        </p>

                        {/* Puntaje: el certificado ahora respalda una nota real y
                            solo aparece si el backend lo mandó. Un PDF es
                            permanente, asi que no se rellena con un numero que
                            el cliente podria inventar. */}
                        {porcentaje !== null && porcentaje !== undefined && (
                            <div className="flex items-center justify-center gap-8 mt-10">
                                <div className="text-center">
                                    <p className="text-[14px] uppercase tracking-widest text-[#50634b] font-bold">
                                        Puntaje
                                    </p>
                                    <p className="text-[32px] font-black text-[#5fbd44]">
                                        {porcentaje}%
                                    </p>
                                </div>
                                {umbral !== null && umbral !== undefined && (
                                    <div className="w-px h-12 bg-[#f6811e]/40"></div>
                                )}
                                {umbral !== null && umbral !== undefined && (
                                    <div className="text-center">
                                        <p className="text-[14px] uppercase tracking-widest text-[#50634b] font-bold">
                                            Mínimo para aprobar
                                        </p>
                                        <p className="text-[32px] font-black text-[#f6811e]">
                                            {umbral}%
                                        </p>
                                    </div>
                                )}
                                {score !== null && score !== undefined && total ? (
                                    <>
                                        <div className="w-px h-12 bg-[#f6811e]/40"></div>
                                        <div className="text-center">
                                            <p className="text-[14px] uppercase tracking-widest text-[#50634b] font-bold">
                                                Respuestas
                                            </p>
                                            <p className="text-[32px] font-black text-[#5fbd44]">
                                                {score}/{total}
                                            </p>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        )}

                        <p className="text-[24px] font-black text-[#f6811e] mt-10">
                            FECHA: <span className="text-[#5fbd44] ml-2">{fecha}</span>
                        </p>
                    </div>

                    {/* FOOTER: Firmas y Logos Inferiores */}
                    <div className="flex items-end justify-between w-full mt-auto mb-4 px-8">
                        {/* Logo Izquierdo (GASMAX) */}
                        <div className="flex flex-col items-center justify-center h-20">
                            <img src="https://i.imgur.com/MRtZVE1.png" alt="GASMAX" className="h-16 object-contain" crossOrigin="anonymous" />
                        </div>

                        {/* Firma Central */}
                        <div className="flex flex-col items-center w-80">
                            <div className="w-full border-b-[3px] border-[#f6811e] mb-3"></div>
                            <span className="text-xl font-black text-[#5fbd44] uppercase tracking-wide">
                                NASLY MARTINEZ
                            </span>
                            <span className="text-lg font-medium text-[#50634b]">
                                Líder de Gestión Humana
                            </span>
                        </div>

                        {/* Logo Derecho (G MAX) */}
                        <div className="flex flex-col items-center justify-center h-20">
                            <img src="https://i.imgur.com/0lJYiHW.png" alt="G MAX" className="h-16 object-contain" crossOrigin="anonymous" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
});

CertificadoGenerator.displayName = 'CertificadoGenerator';

export default CertificadoGenerator;
