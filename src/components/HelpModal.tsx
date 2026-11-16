import { useEffect } from 'react';

export type HelpModalMode = 'guide' | 'about' | null;

interface HelpModalProps {
  mode: HelpModalMode;
  onClose: () => void;
}

export function HelpModal({ mode, onClose }: HelpModalProps) {
  useEffect(() => {
    if (!mode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, onClose]);

  if (!mode) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] max-h-[calc(100vh-1.5rem)] bg-[#f0f0f0] border border-[#adadad] rounded-[8px] shadow-[0_20px_56px_rgba(15,23,42,0.28)] flex flex-col overflow-hidden select-none"
      >
        <div className="h-9 bg-[#f3f3f3] border-b border-[#dcdcdc] flex items-center justify-between pl-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <i
              className={`fa-solid ${
                mode === 'guide' ? 'fa-book-open' : 'fa-circle-info'
              } text-[12px] text-[#0067c0]`}
              aria-hidden="true"
            />
            <h2 id="help-modal-title" className="text-[12px] font-medium text-[#1a1a1a] truncate pr-2">
              {mode === 'guide'
                ? 'Guía técnica: Códigos de error, VEN/DEV y firmas WHQL'
                : 'Acerca del Administrador de dispositivos'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de ayuda"
            className="w-10 h-full flex items-center justify-center text-[#1a1a1a] hover:bg-[#c42b1c] hover:text-white transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c42b1c]"
          >
            <i className="fa-solid fa-xmark text-[13px]" aria-hidden="true" />
          </button>
        </div>

        <div className="bg-white p-4 sm:p-5 overflow-y-auto win11-scrollbar space-y-4 text-[12.5px] leading-relaxed text-[#1e293b] select-text">
          {mode === 'guide' ? (
            <>
              <section className="space-y-2">
                <h3 className="text-[13px] font-semibold text-[#004578]">
                  1. Códigos de error principales en devmgmt.msc
                </h3>
                <div className="space-y-2">
                  <div className="border border-[#e2e8f0] rounded-[4px] p-2.5 bg-[#fafafa]">
                    <p className="font-semibold text-[#92400e]">
                      Código 10 — Este dispositivo no puede iniciar
                    </p>
                    <p className="text-[12px] text-[#475569] mt-0.5">
                      El controlador falló al inicializar el hardware durante el arranque. Suele
                      resolverse actualizando/reinstalando el controlador o deshabilitando y
                      habilitando el adaptador.
                    </p>
                  </div>

                  <div className="border border-[#e2e8f0] rounded-[4px] p-2.5 bg-[#fafafa]">
                    <p className="font-semibold text-[#92400e]">
                      Código 28 — Los controladores no están instalados
                    </p>
                    <p className="text-[12px] text-[#475569] mt-0.5">
                      Windows detectó el hardware físico, pero no dispone de un controlador
                      compatible. Use la pestaña <strong>Detalles → Identificadores de hardware</strong>{' '}
                      para identificar el fabricante y modelo exacto.
                    </p>
                  </div>

                  <div className="border border-[#e2e8f0] rounded-[4px] p-2.5 bg-[#fafafa]">
                    <p className="font-semibold text-[#92400e]">
                      Código 43 — Windows detuvo este dispositivo porque informó de problemas
                    </p>
                    <p className="text-[12px] text-[#475569] mt-0.5">
                      Fallo reportado por el controlador o el dispositivo tras arrancar (frecuente
                      tras instalar drivers beta o corruptos). Si existe una versión previa estable,
                      utilice <strong>Revertir al controlador anterior</strong>.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-[13px] font-semibold text-[#004578]">
                  2. Anatomía de un Identificador de Hardware (VEN/DEV y VID/PID)
                </h3>
                <p className="text-[12px] text-[#475569]">
                  En dispositivos PCIe aparece como{' '}
                  <code className="font-mono text-[#0f172a] bg-[#f1f5f9] px-1 py-0.5 rounded">
                    PCI\VEN_10DE&amp;DEV_2786
                  </code>{' '}
                  (<em>Vendor ID</em> + <em>Device ID</em>) y en USB como{' '}
                  <code className="font-mono text-[#0f172a] bg-[#f1f5f9] px-1 py-0.5 rounded">
                    USB\VID_072F&amp;PID_2200
                  </code>{' '}
                  (<em>Vendor ID</em> + <em>Product ID</em>).
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-[13px] font-semibold text-[#004578]">
                  3. Seguridad y Firmas Digitales (WHQL)
                </h3>
                <p className="text-[12px] text-[#475569]">
                  Un controlador legítimo certificado por Microsoft muestra como firmante{' '}
                  <strong className="text-[#15803d]">
                    Microsoft Windows Hardware Compatibility Publisher
                  </strong>
                  . Los controladores sin firma o con firmante desconocido pueden provocar
                  inestabilidad (pantallazos azules) o representar un vector de ataque en el kernel.
                </p>
              </section>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 pb-3 border-b border-[#e5e5e5]">
                <img
                  src="./assets/aistudio/icono_81a3db5b.png"
                  alt="Logo de Un Fantasma en el Sistema"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-contain shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-[#1a1a1a]">
                    Administrador de dispositivos — GhostAcademy
                  </h3>
                  <p className="text-[12px] text-[#52525b] mt-0.5">
                    Simulador educativo de diagnóstico de hardware y controladores estilo Windows 11 (devmgmt.msc).
                  </p>
                </div>
              </div>

              <p className="text-[12px] text-[#475569]">
                Diseñado para prácticas de soporte técnico HelpDesk, identificación de hardware
                mediante códigos VEN/DEV y auditoría básica de firmas digitales en controladores.
              </p>

              <div className="pt-1">
                <a
                  href="https://www.unfantasmaenelsistema.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[12px] font-medium text-[#0067c0] hover:underline"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square text-[11px]" aria-hidden="true" />
                  <span>Visitar unfantasmaenelsistema.com</span>
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#f0f0f0] px-3.5 py-2.5 border-t border-[#dcdcdc] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-w-[84px] px-4 py-1.5 text-[12px] font-medium text-[#1a1a1a] bg-[#fdfdfd] border border-[#0067c0] rounded-[4px] hover:bg-[#e5f1fb] active:bg-[#cce4f7] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
