import { useEffect, useState, type FormEvent } from 'react';
import {
  matchesHardwareIdQuery,
  type DriverPackage,
  type HardwareDevice,
} from '../data/devices';

interface UpdateDriverModalProps {
  device: HardwareDevice;
  onClose: () => void;
  onInstallDriver: (deviceId: string, pkg: DriverPackage) => void;
}

export function UpdateDriverModal({
  device,
  onClose,
  onInstallDriver,
}: UpdateDriverModalProps) {
  const [query, setQuery] = useState<string>('');
  const [searchState, setSearchState] = useState<'idle' | 'found' | 'not-found' | 'up-to-date'>(
    'idle'
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearchState('not-found');
      return;
    }

    if (matchesHardwareIdQuery(device, query)) {
      if (device.availableDriverUpdate && (device.errorCode !== null || device.status !== 'OK')) {
        setSearchState('found');
      } else {
        setSearchState('up-to-date');
      }
    } else {
      setSearchState('not-found');
    }
  };

  const foundPackage = device.availableDriverUpdate;

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-900/40 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-driver-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] max-h-[calc(100vh-1.5rem)] bg-[#f0f0f0] border border-[#9e9e9e] rounded-[8px] shadow-[0_24px_64px_rgba(15,23,42,0.34)] flex flex-col overflow-hidden select-none"
      >
        {/* Barra de título */}
        <div className="h-9 bg-[#f3f3f3] border-b border-[#dcdcdc] flex items-center justify-between pl-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <i className="fa-solid fa-magnifying-glass text-[12px] text-[#0067c0]" aria-hidden="true" />
            <h3
              id="update-driver-title"
              className="text-[12px] font-medium text-[#1a1a1a] truncate pr-2"
            >
              Actualizar controladores: {device.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar buscador de software"
            className="w-10 h-full flex items-center justify-center text-[#1a1a1a] hover:bg-[#c42b1c] hover:text-white transition-colors duration-150 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c42b1c]"
          >
            <i className="fa-solid fa-xmark text-[13px]" aria-hidden="true" />
          </button>
        </div>

        {/* Contenido blanco del asistente */}
        <div className="bg-white p-4 space-y-4 border-b border-[#dcdcdc] overflow-y-auto win11-scrollbar">
          <div>
            <h4 className="text-[14px] font-semibold text-[#004578]">
              Buscar software de controlador
            </h4>
            <p className="text-[12px] text-[#52525b] mt-1 leading-relaxed">
              Pegue el identificador de hardware (<span className="font-mono text-[#1a1a1a]">VEN/DEV</span> o{' '}
              <span className="font-mono text-[#1a1a1a]">VID/PID</span>) copiado desde la pestaña{' '}
              <strong className="font-medium text-[#1a1a1a]">Detalles</strong> para localizar el controlador compatible.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-2.5">
            <label htmlFor="hardware-id-search" className="block text-[12px] font-medium text-[#1a1a1a]">
              Identificador de hardware:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="hardware-id-search"
                type="text"
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (searchState !== 'idle') setSearchState('idle');
                }}
                placeholder="Ej. USB\VID_072F&PID_2200 o PCI\VEN_8086&DEV_51F0"
                className="flex-1 min-w-0 h-8 px-2.5 font-mono text-[11.5px] text-[#1a1a1a] bg-white border border-[#adadad] rounded-[3px] focus:outline-none focus:border-[#0067c0] focus:ring-1 focus:ring-[#0067c0]"
              />
              <button
                type="submit"
                className="h-8 px-3 text-[12px] font-medium text-[#1a1a1a] bg-[#fdfdfd] border border-[#0067c0] rounded-[4px] hover:bg-[#e5f1fb] active:bg-[#cce4f7] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
              >
                Buscar software
              </button>
            </div>
            <p className="text-[11px] text-[#64748b] leading-snug">
              <strong className="font-medium text-[#475569]">Referencia técnica:</strong>{' '}
              <span className="font-mono">VEN/VID</span> identifica al fabricante (ej.{' '}
              <span className="font-mono">8086</span> Intel, <span className="font-mono">10DE</span> NVIDIA,{' '}
              <span className="font-mono">072F</span> ACS) y <span className="font-mono">DEV/PID</span> al modelo exacto.
            </p>
          </form>

          {/* Resultado: Paquete encontrado */}
          {searchState === 'found' && foundPackage && (
            <div className="border border-[#bbf7d0] bg-[#f0fdf4] rounded-[4px] p-3 space-y-2.5">
              <div className="flex items-start gap-2">
                <i className="fa-solid fa-circle-check text-[14px] text-[#16a34a] mt-0.5 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-[#166534]">
                    Controlador compatible encontrado
                  </p>
                  <p className="text-[12px] text-[#1a1a1a] font-medium mt-0.5">
                    {foundPackage.resolvedName ?? device.name}
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-[90px_1fr] gap-y-1 gap-x-2 text-[11.5px] pl-5">
                <dt className="text-[#52525b]">Proveedor:</dt>
                <dd className="text-[#1a1a1a]">{foundPackage.provider}</dd>
                <dt className="text-[#52525b]">Versión:</dt>
                <dd className="text-[#1a1a1a] font-mono tabular-nums">{foundPackage.version}</dd>
                <dt className="text-[#52525b]">Fecha:</dt>
                <dd className="text-[#1a1a1a] tabular-nums">{foundPackage.date}</dd>
                <dt className="text-[#52525b]">Firmante:</dt>
                <dd className="text-[#166534] font-medium">{foundPackage.signer}</dd>
              </dl>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onInstallDriver(device.id, foundPackage);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 text-[12px] font-medium text-white bg-[#0067c0] hover:bg-[#005a9e] active:bg-[#004578] rounded-[4px] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0067c0] focus-visible:ring-offset-1"
                >
                  Instalar controlador
                </button>
              </div>
            </div>
          )}

          {/* Resultado: No coincide con el dispositivo actual */}
          {searchState === 'not-found' && (
            <div className="border border-[#fecaca] bg-[#fef2f2] rounded-[4px] p-3 flex items-start gap-2 text-[12px]">
              <i className="fa-solid fa-circle-exclamation text-[14px] text-[#dc2626] mt-0.5 shrink-0" aria-hidden="true" />
              <div className="text-[#7f1d1d]">
                <p className="font-medium">No se encontró ningún controlador compatible</p>
                <p className="text-[11.5px] mt-0.5 text-[#991b1b]">
                  El identificador introducido no corresponde a este dispositivo. Consulte la pestaña{' '}
                  <strong>Detalles &rarr; Identificadores de hardware</strong> y copie su código VEN/DEV exacto.
                </p>
              </div>
            </div>
          )}

          {/* Resultado: Ya actualizado */}
          {searchState === 'up-to-date' && (
            <div className="border border-[#bfdbfe] bg-[#eff6ff] rounded-[4px] p-3 flex items-start gap-2 text-[12px] text-[#1e3a8a]">
              <i className="fa-solid fa-circle-info text-[14px] text-[#2563eb] mt-0.5 shrink-0" aria-hidden="true" />
              <p>Ya están instalados los mejores controladores para este dispositivo.</p>
            </div>
          )}
        </div>

        {/* Pie del sub-modal */}
        <div className="bg-[#f0f0f0] px-3.5 py-2.5 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-w-[84px] px-4 py-1.5 text-[12px] text-[#1a1a1a] bg-[#fdfdfd] border border-[#adadad] rounded-[4px] hover:bg-[#e5f1fb] hover:border-[#0078d4] active:bg-[#cce4f7] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
