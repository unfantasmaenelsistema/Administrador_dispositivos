import { useEffect, useState } from 'react';
import {
  getDeviceStatusMessage,
  isDriverSignatureVerified,
  type DriverPackage,
  type HardwareDevice,
} from '../data/devices';
import { UpdateDriverModal } from './UpdateDriverModal';

export type PropertiesTab = 'general' | 'driver' | 'details' | 'events';

type DetailPropertyKey =
  | 'hardware-ids'
  | 'description'
  | 'device-class'
  | 'instance-id'
  | 'provider'
  | 'signature-status'
  | 'problem-code';

interface DevicePropertiesModalProps {
  device: HardwareDevice | null;
  deviceIconClass: string;
  initialTab?: PropertiesTab;
  openUpdateImmediately?: boolean;
  onClose: () => void;
  onRevertDriver: (deviceId: string) => void;
  onInstallDriver: (deviceId: string, pkg: DriverPackage) => void;
  onToggleDisable: (deviceId: string) => void;
  onUninstallDevice: (deviceId: string) => void;
}

function getHardwareIdLines(hardwareID: string): string {
  const shortMatch = hardwareID.match(
    /^((?:PCI\\VEN_[^&]+&DEV_[^&]+)|(?:USB\\VID_[^&]+&PID_[^&]+)|(?:ACPI\\VEN_[^&]+&DEV_[^&]+))/i
  );
  if (shortMatch && shortMatch[1] !== hardwareID) {
    return `${hardwareID}\n${shortMatch[1]}`;
  }
  return hardwareID;
}

function getDetailValue(device: HardwareDevice, key: DetailPropertyKey): string {
  switch (key) {
    case 'hardware-ids':
      return getHardwareIdLines(device.hardwareID);
    case 'description':
      return device.name;
    case 'device-class':
      return device.category;
    case 'instance-id':
      return `${device.hardwareID}\\4&1A2B3C4D&0&0008`;
    case 'provider':
      return device.driverProvider;
    case 'signature-status':
      return isDriverSignatureVerified(device)
        ? `Firma verificada (${device.driverSigner})`
        : `ADVERTENCIA: Firma no verificada (${device.driverSigner})`;
    case 'problem-code':
      if (device.disabled) return '00000016 (22 - Deshabilitado)';
      if (device.errorCode === null) return '00000000';
      return `000000${device.errorCode.toString(16).toUpperCase().padStart(2, '0')} (${device.errorCode})`;
  }
}

export function DevicePropertiesModal({
  device,
  deviceIconClass,
  initialTab = 'general',
  openUpdateImmediately = false,
  onClose,
  onRevertDriver,
  onInstallDriver,
  onToggleDisable,
  onUninstallDevice,
}: DevicePropertiesModalProps) {
  const [activeTab, setActiveTab] = useState<PropertiesTab>(initialTab);
  const [selectedDetailProp, setSelectedDetailProp] = useState<DetailPropertyKey>('hardware-ids');
  const [driverNotice, setDriverNotice] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(openUpdateImmediately);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  useEffect(() => {
    if (device) {
      setActiveTab(initialTab);
      setSelectedDetailProp('hardware-ids');
      setDriverNotice(null);
      setShowUpdateModal(openUpdateImmediately);
      setCopiedId(false);
    }
  }, [device?.id, initialTab, openUpdateImmediately]);

  useEffect(() => {
    if (!device) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !showUpdateModal) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [device, showUpdateModal, onClose]);

  if (!device) return null;

  const hasProblem = !device.disabled && (device.status === 'ERROR' || device.status === 'WARNING');
  const statusMessage = getDeviceStatusMessage(device);
  const signatureVerified = isDriverSignatureVerified(device);
  const canRevertDriver = Boolean(device.previousDriver);

  const tabs: { id: PropertiesTab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'driver', label: 'Controlador' },
    { id: 'details', label: 'Detalles' },
    { id: 'events', label: 'Eventos' },
  ];

  const handleCopyDetailValue = async () => {
    const valueToCopy =
      selectedDetailProp === 'hardware-ids'
        ? device.hardwareID
        : getDetailValue(device, selectedDetailProp);
    try {
      await navigator.clipboard.writeText(valueToCopy);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1800);
    } catch {
      setCopiedId(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-4"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="properties-dialog-title"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[492px] max-h-[calc(100vh-1.5rem)] bg-[#f0f0f0] border border-[#adadad] rounded-[8px] shadow-[0_20px_56px_rgba(15,23,42,0.28)] flex flex-col overflow-hidden select-none"
        >
          {/* Barra de título del cuadro de Propiedades */}
          <div className="h-9 bg-[#f3f3f3] border-b border-[#dcdcdc] flex items-center justify-between pl-3 shrink-0">
            <h2
              id="properties-dialog-title"
              className="text-[12px] font-medium text-[#1a1a1a] truncate pr-2"
            >
              Propiedades de: {device.name}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar propiedades"
              title="Cerrar"
              className="w-10 h-full flex items-center justify-center text-[#1a1a1a] hover:bg-[#c42b1c] hover:text-white transition-colors duration-150 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c42b1c]"
            >
              <i className="fa-solid fa-xmark text-[13px]" aria-hidden="true" />
            </button>
          </div>

          {/* Cuerpo con pestañas estilo Windows */}
          <div className="p-3 sm:p-3.5 flex-1 min-h-0 flex flex-col overflow-y-auto win11-scrollbar">
            {/* Barra de pestañas */}
            <div role="tablist" aria-label="Secciones de propiedades" className="flex flex-wrap items-end gap-0.5 pl-0.5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${tab.id}`}
                    id={`tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 text-[12px] rounded-t-[3px] whitespace-nowrap shrink-0 transition-colors duration-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0] ${
                      isActive
                        ? 'bg-white text-[#1a1a1a] font-medium border border-[#d0d0d0] border-b-white border-t-2 border-t-[#0067c0] -mb-px relative z-10'
                        : 'bg-[#e6e6e6] text-[#4b5563] border border-transparent hover:bg-[#dcdcdc] hover:text-[#1a1a1a]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Panel blanco de la pestaña activa */}
            <div className="bg-white border border-[#d0d0d0] rounded-b-[4px] rounded-tr-[4px] p-4 min-h-[372px] flex flex-col">
              {/* Cabecera común del dispositivo */}
              <div className="flex items-center gap-3 pb-3 border-b border-[#e5e5e5]">
                <span className="relative w-8 h-8 flex items-center justify-center bg-[#f8fafc] border border-[#e2e8f0] rounded-[4px] shrink-0">
                  <i className={`${deviceIconClass} text-[18px]`} aria-hidden="true" />
                  {hasProblem && (
                    <span
                      className="absolute -bottom-1 -right-1 flex items-center justify-center leading-none"
                      aria-hidden="true"
                    >
                      <i className="fa-solid fa-triangle-exclamation text-[11px] text-[#eab308] drop-shadow-[0_0_1px_rgba(0,0,0,0.85)]" />
                    </span>
                  )}
                  {device.disabled && (
                    <span
                      className="absolute -bottom-1 -right-1 flex items-center justify-center leading-none bg-white rounded-full"
                      aria-hidden="true"
                    >
                      <i className="fa-solid fa-circle-arrow-down text-[11px] text-[#475569]" />
                    </span>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#1a1a1a] leading-snug break-words">
                    {device.name}
                  </p>
                  {device.hidden && (
                    <p className="text-[11px] text-[#64748b]">Dispositivo oculto (desconectado)</p>
                  )}
                </div>
              </div>

              {/* Pestaña 1: General */}
              {activeTab === 'general' && (
                <div
                  id="tabpanel-general"
                  role="tabpanel"
                  aria-labelledby="tab-general"
                  className="pt-3.5 flex-1 flex flex-col justify-between gap-4"
                >
                  <dl className="grid grid-cols-[124px_1fr] gap-y-2 gap-x-3 text-[12px]">
                    <dt className="text-[#52525b]">Tipo de dispositivo:</dt>
                    <dd className="text-[#1a1a1a] font-medium">{device.category}</dd>

                    <dt className="text-[#52525b]">Fabricante:</dt>
                    <dd className="text-[#1a1a1a]">{device.manufacturer}</dd>

                    <dt className="text-[#52525b]">Ubicación:</dt>
                    <dd className="text-[#1a1a1a] break-words">{device.location}</dd>
                  </dl>

                  {/* Cuadro de Estado del dispositivo */}
                  <fieldset className="border border-[#d4d4d8] rounded-[4px] bg-[#fafafa] px-3 pb-3 pt-2 mt-auto">
                    <legend className="text-[12px] font-medium text-[#1a1a1a] px-1">
                      Estado del dispositivo
                    </legend>
                    <div className="flex items-start gap-2.5 pt-1">
                      <span className="mt-0.5 shrink-0" aria-hidden="true">
                        {device.disabled ? (
                          <i className="fa-solid fa-circle-pause text-[14px] text-[#64748b]" />
                        ) : hasProblem ? (
                          <i className="fa-solid fa-triangle-exclamation text-[14px] text-[#d97706]" />
                        ) : (
                          <i className="fa-solid fa-circle-check text-[14px] text-[#16a34a]" />
                        )}
                      </span>
                      <div className="text-[12px] leading-relaxed text-[#1a1a1a] select-text">
                        <p
                          className={
                            hasProblem
                              ? 'font-medium text-[#92400e]'
                              : device.disabled
                                ? 'font-medium text-[#475569]'
                                : 'text-[#15803d] font-medium'
                          }
                        >
                          {statusMessage}
                        </p>
                        {!device.disabled && device.errorCode === 28 && (
                          <p className="text-[#52525b] mt-1.5">
                            No hay ningún controlador compatible para este dispositivo. Copie el
                            identificador de hardware en <strong>Detalles</strong> y use{' '}
                            <strong>Controlador &rarr; Actualizar controlador...</strong>.
                          </p>
                        )}
                        {!device.disabled && device.errorCode === 43 && (
                          <p className="text-[#52525b] mt-1.5">
                            Un controlador recién instalado o sin verificar ha provocado un fallo.
                            Pruebe a revertir al controlador anterior en la pestaña{' '}
                            <strong>Controlador</strong>.
                          </p>
                        )}
                        {!device.disabled && device.errorCode === 10 && (
                          <p className="text-[#52525b] mt-1.5">
                            El dispositivo no respondió durante la secuencia de arranque. Actualice
                            el controlador desde la pestaña <strong>Controlador</strong>.
                          </p>
                        )}
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* Pestaña 2: Controlador */}
              {activeTab === 'driver' && (
                <div
                  id="tabpanel-driver"
                  role="tabpanel"
                  aria-labelledby="tab-driver"
                  className="pt-3.5 flex-1 flex flex-col gap-3.5"
                >
                  <dl className="grid grid-cols-[148px_1fr] gap-y-2 gap-x-3 text-[12px]">
                    <dt className="text-[#52525b]">Proveedor del controlador:</dt>
                    <dd className="text-[#1a1a1a]">{device.driverProvider}</dd>

                    <dt className="text-[#52525b]">Fecha del controlador:</dt>
                    <dd className="text-[#1a1a1a] tabular-nums">{device.driverDate}</dd>

                    <dt className="text-[#52525b]">Versión del controlador:</dt>
                    <dd className="text-[#1a1a1a] font-mono text-[11.5px] tabular-nums">
                      {device.driverVersion}
                    </dd>

                    <dt className="text-[#52525b]">Firmante digital:</dt>
                    <dd
                      className={`break-words ${
                        signatureVerified ? 'text-[#15803d] font-medium' : 'text-[#b45309] font-medium'
                      }`}
                    >
                      {device.driverSigner}
                    </dd>
                  </dl>

                  {/* Aviso visual de firma no verificada */}
                  {!signatureVerified && (
                    <div
                      role="alert"
                      className="border border-[#fca5a5] bg-[#fef2f2] rounded-[4px] px-3 py-2 flex items-start gap-2 text-[11.5px] leading-snug text-[#991b1b]"
                    >
                      <i
                        className="fa-solid fa-shield-halved text-[13px] text-[#dc2626] mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-semibold">Firma de controlador no verificada</p>
                        <p className="mt-0.5 text-[#7f1d1d]">
                          El firmante no coincide con{' '}
                          <span className="font-medium">
                            Microsoft Windows Hardware Compatibility Publisher
                          </span>
                          . Este controlador podría estar corrupto, sin firmar o manipulado.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-[#e5e5e5] pt-3 space-y-2 mt-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShowUpdateModal(true)}
                        className="px-3 py-1.5 text-[12px] text-[#1a1a1a] bg-[#fdfdfd] border border-[#adadad] rounded-[4px] hover:bg-[#e5f1fb] hover:border-[#0078d4] active:bg-[#cce4f7] transition-colors whitespace-nowrap text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
                      >
                        Actualizar controlador...
                      </button>

                      <button
                        type="button"
                        disabled={!canRevertDriver}
                        onClick={() => {
                          onRevertDriver(device.id);
                          setDriverNotice(
                            'Se restauró la versión anterior verificada del controlador. El dispositivo funciona correctamente.'
                          );
                        }}
                        className="px-3 py-1.5 text-[12px] text-[#1a1a1a] bg-[#fdfdfd] border border-[#adadad] rounded-[4px] hover:bg-[#e5f1fb] hover:border-[#0078d4] active:bg-[#cce4f7] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fdfdfd] disabled:hover:border-[#adadad] transition-colors whitespace-nowrap text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
                      >
                        Revertir al controlador anterior
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onToggleDisable(device.id);
                          setDriverNotice(
                            device.disabled
                              ? `Dispositivo "${device.name}" habilitado.`
                              : `Dispositivo "${device.name}" deshabilitado.`
                          );
                        }}
                        className="px-3 py-1.5 text-[12px] text-[#1a1a1a] bg-[#fdfdfd] border border-[#adadad] rounded-[4px] hover:bg-[#e5f1fb] hover:border-[#0078d4] active:bg-[#cce4f7] transition-colors whitespace-nowrap text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
                      >
                        {device.disabled ? 'Habilitar' : 'Deshabilitar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onUninstallDevice(device.id)}
                        className="px-3 py-1.5 text-[12px] text-[#1a1a1a] bg-[#fdfdfd] border border-[#adadad] rounded-[4px] hover:bg-[#fef2f2] hover:border-[#dc2626] hover:text-[#991b1b] active:bg-[#fee2e2] transition-colors whitespace-nowrap text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#dc2626]"
                      >
                        Desinstalar
                      </button>
                    </div>

                    {driverNotice && (
                      <p
                        role="status"
                        className="text-[11.5px] text-[#1e3a8a] bg-[#eff6ff] border border-[#bfdbfe] rounded-[4px] px-2.5 py-1.5"
                      >
                        {driverNotice}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Pestaña 3: Detalles */}
              {activeTab === 'details' && (
                <div
                  id="tabpanel-details"
                  role="tabpanel"
                  aria-labelledby="tab-details"
                  className="pt-3.5 flex-1 flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="detail-property-select" className="text-[12px] text-[#1a1a1a]">
                      Propiedad
                    </label>
                    <select
                      id="detail-property-select"
                      value={selectedDetailProp}
                      onChange={(e) => {
                        setSelectedDetailProp(e.target.value as DetailPropertyKey);
                        setCopiedId(false);
                      }}
                      className="w-full h-7 px-2 text-[12px] text-[#1a1a1a] bg-white border border-[#adadad] rounded-[3px] focus:outline-none focus:border-[#0067c0] focus:ring-1 focus:ring-[#0067c0]"
                    >
                      <option value="hardware-ids">Identificadores de hardware</option>
                      <option value="description">Descripción del dispositivo</option>
                      <option value="device-class">Clase de dispositivo</option>
                      <option value="instance-id">Id. de instancia de dispositivo</option>
                      <option value="provider">Proveedor</option>
                      <option value="signature-status">Estado de firma digital</option>
                      <option value="problem-code">Código de problema</option>
                    </select>
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="detail-property-value" className="text-[12px] text-[#1a1a1a]">
                        Valor
                      </label>
                      <button
                        type="button"
                        onClick={handleCopyDetailValue}
                        className="px-2 py-0.5 text-[11px] text-[#1a1a1a] bg-[#f8fafc] border border-[#cbd5e1] rounded-[3px] hover:bg-[#e5f1fb] hover:border-[#0078d4] transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                      >
                        <i
                          className={`fa-solid ${copiedId ? 'fa-check text-[#16a34a]' : 'fa-copy text-[#475569]'} text-[10px]`}
                          aria-hidden="true"
                        />
                        <span>{copiedId ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <textarea
                      id="detail-property-value"
                      readOnly
                      value={getDetailValue(device, selectedDetailProp)}
                      rows={6}
                      className="w-full flex-1 p-2 font-mono text-[11.5px] leading-relaxed text-[#1a1a1a] bg-[#fafafa] border border-[#cccccc] rounded-[3px] resize-none select-text focus:outline-none focus:border-[#0067c0]"
                    />
                  </div>
                </div>
              )}

              {/* Pestaña 4: Eventos */}
              {activeTab === 'events' && (
                <div
                  id="tabpanel-events"
                  role="tabpanel"
                  aria-labelledby="tab-events"
                  className="pt-3.5 flex-1 flex flex-col gap-2.5 min-h-0"
                >
                  <p className="text-[12px] text-[#52525b]">
                    Registro cronológico de eventos PnP e instalación de controladores:
                  </p>
                  <div className="flex-1 max-h-[240px] overflow-y-auto win11-scrollbar border border-[#dcdcdc] rounded-[3px] bg-[#fafafa] divide-y divide-[#e5e5e5]">
                    {device.events.map((evt, index) => (
                      <div key={`${evt.timestamp}-${index}`} className="p-2.5 text-[11.5px] select-text">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-[#1a1a1a]">{evt.title}</span>
                          <span className="font-mono text-[10.5px] text-[#64748b] tabular-nums shrink-0">
                            {evt.timestamp}
                          </span>
                        </div>
                        <p className="text-[#52525b] mt-0.5 leading-snug">{evt.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botones inferiores clásicos Aceptar / Cancelar */}
          <div className="bg-[#f0f0f0] px-3.5 pb-3 pt-0.5 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="min-w-[84px] px-4 py-1.5 text-[12px] font-medium text-[#1a1a1a] bg-[#fdfdfd] border border-[#0067c0] rounded-[4px] hover:bg-[#e5f1fb] active:bg-[#cce4f7] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
            >
              Aceptar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-w-[84px] px-4 py-1.5 text-[12px] text-[#1a1a1a] bg-[#fdfdfd] border border-[#adadad] rounded-[4px] hover:bg-[#e5f1fb] hover:border-[#0078d4] active:bg-[#cce4f7] transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modal de Buscar software de controlador */}
      {showUpdateModal && (
        <UpdateDriverModal
          device={device}
          onClose={() => setShowUpdateModal(false)}
          onInstallDriver={(deviceId, pkg) => {
            onInstallDriver(deviceId, pkg);
            setDriverNotice(
              `Controlador v${pkg.version} instalado correctamente. El código de error ha sido resuelto.`
            );
          }}
        />
      )}
    </>
  );
}
