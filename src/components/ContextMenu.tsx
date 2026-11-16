import { useEffect } from 'react';
import type { HardwareDevice } from '../data/devices';

interface ContextMenuProps {
  device: HardwareDevice | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onOpenProperties: (device: HardwareDevice) => void;
  onUpdateDriver: (device: HardwareDevice) => void;
  onToggleDisable: (deviceId: string) => void;
  onUninstall: (deviceId: string) => void;
  onScanHardware: () => void;
}

export function ContextMenu({
  device,
  position,
  onClose,
  onOpenProperties,
  onUpdateDriver,
  onToggleDisable,
  onUninstall,
  onScanHardware,
}: ContextMenuProps) {
  useEffect(() => {
    if (!position || !device) return;
    const handleDismiss = () => onClose();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('click', handleDismiss);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('click', handleDismiss);
      window.removeEventListener('keydown', handleKey);
    };
  }, [position, device, onClose]);

  if (!position || !device) return null;

  const clampedX = Math.min(position.x, typeof window !== 'undefined' ? window.innerWidth - 230 : position.x);
  const clampedY = Math.min(position.y, typeof window !== 'undefined' ? window.innerHeight - 210 : position.y);

  return (
    <div
      role="menu"
      aria-label={`Acciones para ${device.name}`}
      style={{ top: Math.max(8, clampedY), left: Math.max(8, clampedX) }}
      onClick={(e) => e.stopPropagation()}
      className="fixed z-50 w-[220px] bg-[#ffffff] border border-[#cfcfcf] rounded-[6px] shadow-[0_8px_24px_rgba(15,23,42,0.18)] py-1 text-[12px] text-[#1a1a1a] select-none"
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onUpdateDriver(device);
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#e5f3ff] transition-colors"
      >
        <i className="fa-solid fa-magnifying-glass text-[11px] text-[#0067c0] w-3.5 text-center" aria-hidden="true" />
        <span>Actualizar controlador</span>
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onToggleDisable(device.id);
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#e5f3ff] transition-colors"
      >
        <i
          className={`fa-solid ${device.disabled ? 'fa-circle-play text-[#16a34a]' : 'fa-circle-pause text-[#64748b]'} text-[11px] w-3.5 text-center`}
          aria-hidden="true"
        />
        <span>{device.disabled ? 'Habilitar dispositivo' : 'Deshabilitar dispositivo'}</span>
      </button>

      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onUninstall(device.id);
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#fef2f2] hover:text-[#991b1b] transition-colors"
      >
        <i className="fa-solid fa-trash-can text-[11px] text-[#dc2626] w-3.5 text-center" aria-hidden="true" />
        <span>Desinstalar el dispositivo</span>
      </button>

      <div className="my-1 border-t border-[#e5e5e5]" />

      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onScanHardware();
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#e5f3ff] transition-colors"
      >
        <i className="fa-solid fa-rotate text-[11px] text-[#475569] w-3.5 text-center" aria-hidden="true" />
        <span>Buscar cambios de hardware</span>
      </button>

      <div className="my-1 border-t border-[#e5e5e5]" />

      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onOpenProperties(device);
          onClose();
        }}
        className="w-full px-3 py-1.5 text-left font-medium flex items-center gap-2.5 hover:bg-[#e5f3ff] transition-colors"
      >
        <i className="fa-solid fa-sliders text-[11px] text-[#0067c0] w-3.5 text-center" aria-hidden="true" />
        <span>Propiedades</span>
      </button>
    </div>
  );
}
