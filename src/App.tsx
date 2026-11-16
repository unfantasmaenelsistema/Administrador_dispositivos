/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { ContextMenu } from './components/ContextMenu';
import {
  DevicePropertiesModal,
  type PropertiesTab,
} from './components/DevicePropertiesModal';
import { HelpDeskPanel } from './components/HelpDeskPanel';
import { HelpModal, type HelpModalMode } from './components/HelpModal';
import {
  buildDeviceTree,
  formatCurrentTimestamp,
  getDeviceStatusMessage,
  HARDWARE_DEVICES,
  HELPDESK_TICKETS,
  isDriverSignatureVerified,
  type DeviceTreeGroup,
  type DriverPackage,
  type HardwareDevice,
} from './data/devices';

type MenuKey = 'Archivo' | 'Acción' | 'Ver' | 'Ayuda';
const MENU_ITEMS: MenuKey[] = ['Archivo', 'Acción', 'Ver', 'Ayuda'];

function getDeviceIcon(device: HardwareDevice): string {
  switch (device.category) {
    case 'Adaptadores de pantalla':
      return 'fa-solid fa-display text-[#0369a1]';
    case 'Adaptadores de red':
      return 'fa-solid fa-network-wired text-[#0f766e]';
    case 'Controladoras de sonido, vídeo y juegos':
      return 'fa-solid fa-volume-high text-[#4f46e5]';
    case 'Controladoras USB':
      return 'fa-brands fa-usb text-[#475569]';
    case 'Procesadores':
      return 'fa-solid fa-microchip text-[#0369a1]';
    case 'Unidades de disco':
      return 'fa-solid fa-hard-drive text-[#334155]';
    case 'Otros dispositivos':
    default:
      return 'fa-solid fa-circle-question text-[#d97706]';
  }
}

function getInitialExpandedCategories(list: HardwareDevice[]): Record<string, boolean> {
  const initial: Record<string, boolean> = {};
  for (const group of buildDeviceTree(list)) {
    initial[group.id] = group.devices.some(
      (dev) => dev.status === 'ERROR' || dev.status === 'WARNING'
    );
  }
  return initial;
}

export default function App() {
  const [devices, setDevices] = useState<HardwareDevice[]>(() =>
    HARDWARE_DEVICES.map((d) => ({ ...d, events: [...d.events] }))
  );

  const [showHidden, setShowHidden] = useState<boolean>(false);
  const [onlyProblems, setOnlyProblems] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const deviceTree = useMemo<DeviceTreeGroup[]>(
    () => buildDeviceTree(devices, { showHidden, onlyProblems, searchQuery }),
    [devices, showHidden, onlyProblems, searchQuery]
  );

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() =>
    getInitialExpandedCategories(HARDWARE_DEVICES)
  );

  const [rootExpanded, setRootExpanded] = useState<boolean>(true);
  const [selectionHistory, setSelectionHistory] = useState<string[]>(['root-pc']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const selectedNodeId = selectionHistory[historyIndex] ?? 'root-pc';

  const [propertiesState, setPropertiesState] = useState<{
    deviceId: string | null;
    initialTab: PropertiesTab;
    openUpdateImmediately: boolean;
  }>({
    deviceId: null,
    initialTab: 'general',
    openUpdateImmediately: false,
  });

  const [showHelpDesk, setShowHelpDesk] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null);
  const [helpModalMode, setHelpModalMode] = useState<HelpModalMode>(null);
  const [contextMenu, setContextMenu] = useState<{
    device: HardwareDevice;
    position: { x: number; y: number };
  } | null>(null);
  const [logoError, setLogoError] = useState<boolean>(false);

  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeMenu) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenu(null);
    };
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMenu]);

  const selectNode = (nodeId: string) => {
    if (nodeId === selectedNodeId) return;
    const nextHistory = selectionHistory.slice(0, historyIndex + 1);
    nextHistory.push(nodeId);
    setSelectionHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < selectionHistory.length - 1;

  const handleGoBack = () => {
    if (canGoBack) setHistoryIndex((i) => i - 1);
  };

  const handleGoForward = () => {
    if (canGoForward) setHistoryIndex((i) => i + 1);
  };

  const selectedDevice = useMemo<HardwareDevice | null>(
    () => devices.find((d) => d.id === selectedNodeId) ?? null,
    [devices, selectedNodeId]
  );

  const propertiesDevice = useMemo<HardwareDevice | null>(
    () => devices.find((d) => d.id === propertiesState.deviceId) ?? null,
    [devices, propertiesState.deviceId]
  );

  const problemCount = useMemo(
    () =>
      devices.filter((d) => !d.disabled && (d.status === 'ERROR' || d.status === 'WARNING')).length,
    [devices]
  );

  const completedTicketsCount = useMemo(
    () => HELPDESK_TICKETS.filter((ticket) => ticket.isCompleted(devices)).length,
    [devices]
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const expandAllCategories = () => {
    const next: Record<string, boolean> = {};
    for (const group of deviceTree) next[group.id] = true;
    setRootExpanded(true);
    setExpandedCategories(next);
  };

  const collapseAllCategories = () => {
    setExpandedCategories({});
  };

  const openDeviceProperties = (
    device: HardwareDevice,
    initialTab: PropertiesTab = 'general',
    openUpdateImmediately = false
  ) => {
    selectNode(device.id);
    setPropertiesState({
      deviceId: device.id,
      initialTab,
      openUpdateImmediately,
    });
  };

  // Revertir controlador (resuelve p. ej. Código 43 en la GPU)
  const handleRevertDriver = (deviceId: string) => {
    const timestamp = formatCurrentTimestamp();
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id !== deviceId || !dev.previousDriver) return dev;
        return {
          ...dev,
          status: 'OK',
          errorCode: null,
          driverProvider: dev.previousDriver.provider,
          driverVersion: dev.previousDriver.version,
          driverDate: dev.previousDriver.date,
          driverSigner: dev.previousDriver.signer,
          previousDriver: undefined,
          events: [
            ...dev.events,
            {
              timestamp,
              title: 'Controlador revertido a versión anterior',
              detail: `Restaurada la versión v${dev.previousDriver.version} (${dev.previousDriver.signer}). Código de error eliminado.`,
            },
          ],
        };
      })
    );
  };

  // Instalar controlador encontrado por VEN/DEV o VID/PID (resuelve Código 28 / 10 / 43)
  const handleInstallDriver = (deviceId: string, pkg: DriverPackage) => {
    const timestamp = formatCurrentTimestamp();
    if (pkg.resolvedCategory) {
      const targetCatId = `cat-${pkg.resolvedCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      setExpandedCategories((prev) => ({ ...prev, [targetCatId]: true }));
    }
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id !== deviceId) return dev;
        return {
          ...dev,
          name: pkg.resolvedName ?? dev.name,
          category: pkg.resolvedCategory ?? dev.category,
          manufacturer: pkg.provider,
          status: 'OK',
          errorCode: null,
          driverProvider: pkg.provider,
          driverVersion: pkg.version,
          driverDate: pkg.date,
          driverSigner: pkg.signer,
          availableDriverUpdate: undefined,
          events: [
            ...dev.events,
            {
              timestamp,
              title: `Controlador instalado (v${pkg.version})`,
              detail: `Firmante verificado: ${pkg.signer}. Dispositivo funcionando correctamente.`,
            },
          ],
        };
      })
    );
  };

  // Habilitar o deshabilitar dispositivo
  const handleToggleDisable = (deviceId: string) => {
    const timestamp = formatCurrentTimestamp();
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id !== deviceId) return dev;
        const nextDisabled = !dev.disabled;
        return {
          ...dev,
          disabled: nextDisabled,
          events: [
            ...dev.events,
            {
              timestamp,
              title: nextDisabled ? 'Dispositivo deshabilitado' : 'Dispositivo habilitado',
              detail: nextDisabled
                ? 'Deshabilitado manualmente por el administrador.'
                : 'Habilitado manualmente por el administrador.',
            },
          ],
        };
      })
    );
  };

  // Desinstalar dispositivo del árbol
  const handleUninstallDevice = (deviceId: string) => {
    setDevices((prev) => prev.filter((dev) => dev.id !== deviceId));
    if (propertiesState.deviceId === deviceId) {
      setPropertiesState({ deviceId: null, initialTab: 'general', openUpdateImmediately: false });
    }
    if (selectedNodeId === deviceId) {
      selectNode('root-pc');
    }
  };

  // Buscar cambios de hardware (redetecta dispositivos Plug & Play desinstalados)
  const handleScanHardwareChanges = () => {
    if (isScanning) return;
    setIsScanning(true);
    const timestamp = formatCurrentTimestamp();
    setTimeout(() => {
      setDevices((prev) => {
        const existingIds = new Set(prev.map((d) => d.id));
        const missingDefaults = HARDWARE_DEVICES.filter((d) => !existingIds.has(d.id)).map((d) => {
          if (d.id === 'net-intel-wifi' && d.availableDriverUpdate) {
            return {
              ...d,
              status: 'OK' as const,
              errorCode: null,
              driverProvider: d.availableDriverUpdate.provider,
              driverVersion: d.availableDriverUpdate.version,
              driverDate: d.availableDriverUpdate.date,
              driverSigner: d.availableDriverUpdate.signer,
              availableDriverUpdate: undefined,
              events: [
                ...d.events,
                {
                  timestamp,
                  title: `Dispositivo reinstalado mediante PnP (v${d.availableDriverUpdate.version})`,
                  detail: 'Controlador limpio reinstalado tras búsqueda de cambios de hardware.',
                },
              ],
            };
          }
          return { ...d, events: [...d.events] };
        });
        if (missingDefaults.length === 0) return prev;
        return [...prev, ...missingDefaults];
      });
      setIsScanning(false);
    }, 350);
  };

  const handleFocusDevice = (deviceId: string) => {
    const target = devices.find((d) => d.id === deviceId);
    if (!target) return;
    if (target.hidden && !showHidden) setShowHidden(true);
    if (onlyProblems) setOnlyProblems(false);
    if (searchQuery) setSearchQuery('');

    const fullTree = buildDeviceTree(devices, { showHidden: true });
    const group = fullTree.find((g) => g.devices.some((d) => d.id === deviceId));
    setRootExpanded(true);
    if (group) {
      setExpandedCategories((prev) => ({ ...prev, [group.id]: true }));
    }
    selectNode(deviceId);
  };

  const handleResetLab = () => {
    const freshDevices = HARDWARE_DEVICES.map((d) => ({ ...d, events: [...d.events] }));
    setDevices(freshDevices);
    setExpandedCategories(getInitialExpandedCategories(freshDevices));
    setRootExpanded(true);
    setSelectionHistory(['root-pc']);
    setHistoryIndex(0);
    setOnlyProblems(false);
    setSearchQuery('');
    setPropertiesState({ deviceId: null, initialTab: 'general', openUpdateImmediately: false });
  };

  const handleExportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      host: 'DESKTOP-FANTASMA',
      summary: {
        totalDevices: devices.length,
        devicesWithProblems: problemCount,
        unverifiedSignatures: devices.filter((d) => !isDriverSignatureVerified(d)).length,
        ticketsCompleted: `${completedTicketsCount}/${HELPDESK_TICKETS.length}`,
      },
      tickets: HELPDESK_TICKETS.map((t) => ({
        code: t.code,
        title: t.title,
        completed: t.isCompleted(devices),
      })),
      devices: devices.map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        status: d.disabled ? 'DISABLED' : d.status,
        errorCode: d.errorCode,
        hardwareID: d.hardwareID,
        driverVersion: d.driverVersion,
        driverSigner: d.driverSigner,
        signatureVerified: isDriverSignatureVerified(d),
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagnostico-devmgmt.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderDeviceNode = (device: HardwareDevice) => {
    const isDeviceSelected = selectedNodeId === device.id;
    const hasProblem = !device.disabled && (device.status === 'ERROR' || device.status === 'WARNING');
    const statusMessage = getDeviceStatusMessage(device);

    return (
      <li
        key={device.id}
        role="treeitem"
        aria-selected={isDeviceSelected}
        aria-label={`${device.name} — ${statusMessage} (doble clic para propiedades)`}
      >
        <div
          tabIndex={0}
          onClick={() => selectNode(device.id)}
          onDoubleClick={() => openDeviceProperties(device)}
          onContextMenu={(e) => {
            e.preventDefault();
            selectNode(device.id);
            setContextMenu({
              device,
              position: { x: e.clientX, y: e.clientY },
            });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              openDeviceProperties(device);
            }
          }}
          title={`${device.name}\n${statusMessage}\nDoble clic para propiedades · Clic derecho para acciones`}
          className={`flex items-center gap-2 pl-4 pr-2 py-1 rounded-[2px] cursor-default min-w-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0] ${
            isDeviceSelected
              ? 'bg-[#cce8ff] ring-1 ring-inset ring-[#99d1ff]'
              : 'hover:bg-[#f0f7ff]'
          } ${device.hidden ? 'opacity-65' : ''}`}
        >
          <span className="relative w-4 h-4 flex items-center justify-center shrink-0">
            <i
              className={`${getDeviceIcon(device)} text-[13px] ${device.disabled ? 'opacity-50' : ''}`}
              aria-hidden="true"
            />
            {hasProblem && (
              <span
                className="absolute -bottom-0.5 -right-1 flex items-center justify-center leading-none"
                aria-hidden="true"
              >
                <i className="fa-solid fa-triangle-exclamation text-[9px] text-[#eab308] drop-shadow-[0_0_1px_rgba(0,0,0,0.85)]" />
              </span>
            )}
            {device.disabled && (
              <span
                className="absolute -bottom-0.5 -right-1 flex items-center justify-center leading-none bg-white rounded-full"
                aria-hidden="true"
              >
                <i className="fa-solid fa-circle-arrow-down text-[9px] text-[#475569]" />
              </span>
            )}
          </span>

          <span className={`truncate ${device.disabled ? 'text-[#64748b]' : 'text-[#202020]'}`}>
            {device.name}
          </span>

          {(hasProblem || device.disabled) && <span className="sr-only">({statusMessage})</span>}
        </div>
      </li>
    );
  };

  const renderCategoryTree = (groups: DeviceTreeGroup[]) => {
    const forceExpanded = Boolean(searchQuery.trim() || onlyProblems);

    return (
      <ul role="group" className="pl-5 mt-0.5 space-y-0.5">
        {groups.map((category) => {
          const isExpanded = forceExpanded || !!expandedCategories[category.id];
          const isCategorySelected = selectedNodeId === category.id;

          return (
            <li
              key={category.id}
              role="treeitem"
              aria-expanded={isExpanded}
              aria-selected={isCategorySelected}
            >
              <div
                onClick={() => selectNode(category.id)}
                onDoubleClick={() => toggleCategory(category.id)}
                className={`flex items-center gap-1.5 px-1.5 py-1 rounded-[2px] cursor-default min-w-0 ${
                  isCategorySelected
                    ? 'bg-[#cce8ff] ring-1 ring-inset ring-[#99d1ff]'
                    : 'hover:bg-[#f0f7ff]'
                }`}
              >
                <button
                  type="button"
                  aria-label={`${isExpanded ? 'Contraer' : 'Expandir'} ${category.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(category.id);
                  }}
                  className="w-4 h-4 flex items-center justify-center text-[#555555] hover:text-[#1a1a1a] shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
                >
                  <i
                    className={`fa-solid ${
                      isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'
                    } text-[10px] transition-transform duration-150`}
                    aria-hidden="true"
                  />
                </button>

                <span className={`w-4 h-4 flex items-center justify-center shrink-0 ${category.iconColor}`}>
                  <i className={`${category.iconClass} text-[13px]`} aria-hidden="true" />
                </span>

                <span className="text-[#1a1a1a] truncate">{category.name}</span>
              </div>

              {isExpanded && (
                <ul role="group" className="pl-6 mt-0.5 space-y-0.5">
                  {category.devices.map(renderDeviceNode)}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_#f8fafc_0%,_#e8eef6_55%,_#dde6f2_100%)] p-2 sm:p-6 md:p-8 flex items-center justify-center">
      {/* Ventana principal estilo devmgmt.msc de Windows 11 */}
      <main
        aria-label="Ventana de Administrador de dispositivos"
        className="w-full max-w-[1160px] h-[calc(100vh-1rem)] sm:h-[calc(100vh-3rem)] min-h-[540px] max-h-[840px] bg-white border border-[#c8c8c8] rounded-[8px] shadow-[0_18px_48px_rgba(15,23,42,0.12)] flex flex-col overflow-hidden"
      >
        {/* Barra de título superior */}
        <header className="h-9 bg-[#f3f3f3] border-b border-[#e5e5e5] flex items-center justify-between select-none shrink-0">
          <div className="flex items-center gap-2.5 pl-3 min-w-0">
            <span
              className="w-4 h-4 flex items-center justify-center text-[#0067c0] shrink-0"
              aria-hidden="true"
            >
              <i className="fa-solid fa-microchip text-[13px]" />
            </span>
            <h1 className="text-[12px] font-medium text-[#1a1a1a] truncate">
              Administrador de dispositivos
            </h1>
          </div>

          {/* Botones de control falsos estilo Windows 11 */}
          <div className="flex items-center h-full shrink-0">
            <button
              type="button"
              aria-label="Minimizar"
              title="Minimizar"
              className="w-[46px] h-full flex items-center justify-center text-[#1a1a1a] hover:bg-[#e5e5e5] active:bg-[#d8d8d8] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
            >
              <span className="block w-2.5 h-[1px] bg-[#1a1a1a]" />
            </button>
            <button
              type="button"
              aria-label="Maximizar"
              title="Maximizar"
              className="w-[46px] h-full flex items-center justify-center text-[#1a1a1a] hover:bg-[#e5e5e5] active:bg-[#d8d8d8] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
            >
              <span className="block w-2.5 h-2.5 border border-[#1a1a1a] rounded-[1px]" />
            </button>
            <button
              type="button"
              aria-label="Cerrar"
              title="Cerrar"
              className="w-[46px] h-full flex items-center justify-center text-[#1a1a1a] hover:bg-[#c42b1c] hover:text-white active:bg-[#a82417] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c42b1c]"
            >
              <i className="fa-solid fa-xmark text-[13px]" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Barra de menú clásica con desplegables reales */}
        <div ref={menuBarRef} className="relative z-30 shrink-0">
          <nav
            aria-label="Menú principal"
            className="h-7 bg-white border-b border-[#ececec] px-1.5 flex items-center gap-0.5 select-none"
          >
            {MENU_ITEMS.map((item) => {
              const isOpen = activeMenu === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  onClick={() => setActiveMenu(isOpen ? null : item)}
                  onMouseEnter={() => {
                    if (activeMenu && activeMenu !== item) setActiveMenu(item);
                  }}
                  className={`px-2.5 py-0.5 text-[12px] font-normal text-[#1a1a1a] rounded-[3px] transition-colors duration-100 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0] ${
                    isOpen
                      ? 'bg-[#cce8ff] ring-1 ring-inset ring-[#99d1ff]'
                      : 'hover:bg-[#e5f3ff] hover:ring-1 hover:ring-inset hover:ring-[#cce8ff]'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </nav>

          {/* Menú Archivo */}
          {activeMenu === 'Archivo' && (
            <div
              role="menu"
              className="absolute left-1.5 top-7 w-[240px] bg-white border border-[#cfcfcf] rounded-[6px] shadow-[0_8px_24px_rgba(15,23,42,0.16)] py-1 text-[12px] text-[#1a1a1a]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleExportReport();
                  setActiveMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#e5f3ff]"
              >
                <i className="fa-solid fa-file-export text-[11px] text-[#0067c0] w-3.5 text-center" aria-hidden="true" />
                <span>Exportar diagnóstico (.json)</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleResetLab();
                  setActiveMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#e5f3ff]"
              >
                <i className="fa-solid fa-rotate-left text-[11px] text-[#475569] w-3.5 text-center" aria-hidden="true" />
                <span>Reiniciar práctica</span>
              </button>
            </div>
          )}

          {/* Menú Acción */}
          {activeMenu === 'Acción' && (
            <div
              role="menu"
              className="absolute left-14 top-7 w-[240px] bg-white border border-[#cfcfcf] rounded-[6px] shadow-[0_8px_24px_rgba(15,23,42,0.16)] py-1 text-[12px] text-[#1a1a1a]"
            >
              {selectedDevice && (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      openDeviceProperties(selectedDevice, 'driver', true);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#e5f3ff]"
                  >
                    <i className="fa-solid fa-magnifying-glass text-[11px] text-[#0067c0] w-3.5 text-center" aria-hidden="true" />
                    <span>Actualizar controlador...</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      handleToggleDisable(selectedDevice.id);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#e5f3ff]"
                  >
                    <i
                      className={`fa-solid ${selectedDevice.disabled ? 'fa-circle-play text-[#16a34a]' : 'fa-circle-pause text-[#64748b]'} text-[11px] w-3.5 text-center`}
                      aria-hidden="true"
                    />
                    <span>
                      {selectedDevice.disabled ? 'Habilitar dispositivo' : 'Deshabilitar dispositivo'}
                    </span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      handleUninstallDevice(selectedDevice.id);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#fef2f2] hover:text-[#991b1b]"
                  >
                    <i className="fa-solid fa-trash-can text-[11px] text-[#dc2626] w-3.5 text-center" aria-hidden="true" />
                    <span>Desinstalar el dispositivo</span>
                  </button>
                  <div className="my-1 border-t border-[#e5e5e5]" />
                </>
              )}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  handleScanHardwareChanges();
                  setActiveMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#e5f3ff]"
              >
                <i className="fa-solid fa-rotate text-[11px] text-[#0067c0] w-3.5 text-center" aria-hidden="true" />
                <span>Buscar cambios de hardware</span>
              </button>
              {selectedDevice && (
                <>
                  <div className="my-1 border-t border-[#e5e5e5]" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      openDeviceProperties(selectedDevice);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3 py-1.5 text-left font-medium flex items-center gap-2.5 hover:bg-[#e5f3ff]"
                  >
                    <i className="fa-solid fa-sliders text-[11px] text-[#0067c0] w-3.5 text-center" aria-hidden="true" />
                    <span>Propiedades</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Menú Ver */}
          {activeMenu === 'Ver' && (
            <div
              role="menu"
              className="absolute left-28 top-7 w-[250px] bg-white border border-[#cfcfcf] rounded-[6px] shadow-[0_8px_24px_rgba(15,23,42,0.16)] py-1 text-[12px] text-[#1a1a1a]"
            >
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={showHidden}
                onClick={() => {
                  setShowHidden((prev) => !prev);
                  setActiveMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#e5f3ff]"
              >
                <i
                  className={`fa-solid fa-check text-[11px] w-3.5 text-center ${
                    showHidden ? 'text-[#0067c0]' : 'text-transparent'
                  }`}
                  aria-hidden="true"
                />
                <span>Mostrar dispositivos ocultos</span>
              </button>
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={onlyProblems}
                onClick={() => {
                  setOnlyProblems((prev) => !prev);
                  setActiveMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#e5f3ff]"
              >
                <i
                  className={`fa-solid fa-check text-[11px] w-3.5 text-center ${
                    onlyProblems ? 'text-[#0067c0]' : 'text-transparent'
                  }`}
                  aria-hidden="true"
                />
                <span>Solo dispositivos con problemas</span>
              </button>
              <div className="my-1 border-t border-[#e5e5e5]" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  expandAllCategories();
                  setActiveMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#e5f3ff]"
              >
                <i className="fa-solid fa-angles-down text-[11px] text-[#475569] w-3.5 text-center" aria-hidden="true" />
                <span>Expandir todo el árbol</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  collapseAllCategories();
                  setActiveMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#e5f3ff]"
              >
                <i className="fa-solid fa-angles-up text-[11px] text-[#475569] w-3.5 text-center" aria-hidden="true" />
                <span>Contraer todo el árbol</span>
              </button>
            </div>
          )}

          {/* Menú Ayuda */}
          {activeMenu === 'Ayuda' && (
            <div
              role="menu"
              className="absolute left-36 top-7 w-[270px] bg-white border border-[#cfcfcf] rounded-[6px] shadow-[0_8px_24px_rgba(15,23,42,0.16)] py-1 text-[12px] text-[#1a1a1a]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setHelpModalMode('guide');
                  setActiveMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#e5f3ff]"
              >
                <i className="fa-solid fa-book-open text-[11px] text-[#0067c0] w-3.5 text-center" aria-hidden="true" />
                <span>Guía de códigos (10, 28, 43) y VEN/DEV</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setHelpModalMode('about');
                  setActiveMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2.5 hover:bg-[#e5f3ff]"
              >
                <i className="fa-solid fa-circle-info text-[11px] text-[#475569] w-3.5 text-center" aria-hidden="true" />
                <span>Acerca del Administrador de dispositivos</span>
              </button>
            </div>
          )}
        </div>

        {/* Barra de herramientas con iconos */}
        <div
          role="toolbar"
          aria-label="Barra de herramientas de dispositivos"
          className="min-h-9 bg-[#fafafa] border-b border-[#e5e5e5] px-2 py-1 flex flex-wrap items-center justify-between gap-2 select-none shrink-0"
        >
          <div className="flex items-center gap-1 min-w-0">
            <button
              type="button"
              title="Atrás"
              aria-label="Atrás"
              disabled={!canGoBack}
              onClick={handleGoBack}
              className="w-7 h-7 flex items-center justify-center rounded-[3px] text-[#334155] hover:bg-[#e5f3ff] hover:text-[#1a1a1a] hover:ring-1 hover:ring-inset hover:ring-[#cce8ff] disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:ring-0 transition-colors duration-100 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
            >
              <i className="fa-solid fa-arrow-left text-[12px]" aria-hidden="true" />
            </button>

            <button
              type="button"
              title="Adelante"
              aria-label="Adelante"
              disabled={!canGoForward}
              onClick={handleGoForward}
              className="w-7 h-7 flex items-center justify-center rounded-[3px] text-[#334155] hover:bg-[#e5f3ff] hover:text-[#1a1a1a] hover:ring-1 hover:ring-inset hover:ring-[#cce8ff] disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:ring-0 transition-colors duration-100 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
            >
              <i className="fa-solid fa-arrow-right text-[12px]" aria-hidden="true" />
            </button>

            <div className="h-4 w-px bg-[#dcdcdc] mx-1 shrink-0" aria-hidden="true" />

            <button
              type="button"
              title="Buscar cambios de hardware"
              aria-label="Buscar cambios de hardware"
              onClick={handleScanHardwareChanges}
              className="h-7 px-2 flex items-center gap-1.5 rounded-[3px] text-[#1a1a1a] hover:bg-[#e5f3ff] hover:ring-1 hover:ring-inset hover:ring-[#cce8ff] active:bg-[#cce8ff] transition-colors duration-100 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
            >
              <span className="relative inline-flex items-center justify-center w-4 h-4 text-[#0067c0]">
                <i
                  className={`fa-solid ${isScanning ? 'fa-spinner fa-spin' : 'fa-desktop'} text-[12px]`}
                  aria-hidden="true"
                />
                {!isScanning && (
                  <i
                    className="fa-solid fa-magnifying-glass text-[8px] absolute -bottom-0.5 -right-0.5 text-[#1e293b] bg-[#fafafa] rounded-full p-[1px]"
                    aria-hidden="true"
                  />
                )}
              </span>
              <span className="text-[12px] font-normal hidden sm:inline">
                {isScanning ? 'Buscando cambios...' : 'Buscar cambios de hardware'}
              </span>
            </button>

            {selectedDevice && (
              <>
                <div className="h-4 w-px bg-[#dcdcdc] mx-1 shrink-0" aria-hidden="true" />
                <button
                  type="button"
                  title="Abrir propiedades del dispositivo seleccionado"
                  onClick={() => openDeviceProperties(selectedDevice)}
                  className="h-7 px-2 flex items-center gap-1.5 rounded-[3px] text-[#1a1a1a] hover:bg-[#e5f3ff] hover:ring-1 hover:ring-inset hover:ring-[#cce8ff] active:bg-[#cce8ff] transition-colors duration-100 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
                >
                  <i className="fa-solid fa-sliders text-[11px] text-[#0067c0]" aria-hidden="true" />
                  <span className="text-[12px] font-normal">Propiedades</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Filtro rápido de hardware */}
            <div className="relative hidden md:flex items-center">
              <i
                className="fa-solid fa-filter text-[10px] text-[#64748b] absolute left-2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="Filtrar dispositivos o VEN/DEV"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar hardware o VEN/DEV..."
                className="h-7 w-[200px] pl-6 pr-2 text-[11.5px] text-[#1a1a1a] bg-white border border-[#d4d4d8] rounded-[4px] focus:outline-none focus:border-[#0067c0] focus:ring-1 focus:ring-[#0067c0]"
              />
            </div>

            {/* Botón toggleable para HelpDesk Tickets */}
            <button
              type="button"
              aria-expanded={showHelpDesk}
              onClick={() => setShowHelpDesk((prev) => !prev)}
              className={`h-7 px-2.5 flex items-center gap-2 rounded-[4px] border text-[12px] font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0] ${
                showHelpDesk
                  ? 'bg-[#e5f3ff] border-[#99d1ff] text-[#004578]'
                  : 'bg-white border-[#d4d4d8] text-[#1a1a1a] hover:bg-[#f1f5f9]'
              }`}
            >
              <i className="fa-solid fa-ticket text-[11px] text-[#0067c0]" aria-hidden="true" />
              <span>HelpDesk Tickets</span>
              <span className="text-[11px] tabular-nums opacity-80">
                {completedTicketsCount}/{HELPDESK_TICKETS.length}
              </span>
            </button>
          </div>
        </div>

        {/* Cuerpo principal dividido: Tree View + Panel lateral HelpDesk Tickets */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          <section
            aria-label="Árbol de dispositivos"
            className="flex-1 min-w-0 min-h-0 bg-white overflow-y-auto overflow-x-hidden win11-scrollbar p-2 sm:p-3 select-none"
          >
            {deviceTree.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[12.5px] text-[#52525b]">
                <i className="fa-solid fa-magnifying-glass text-[20px] text-[#94a3b8] mb-2" aria-hidden="true" />
                <p className="font-medium text-[#1a1a1a]">
                  No hay dispositivos que coincidan con el filtro actual
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setOnlyProblems(false);
                  }}
                  className="mt-2.5 px-3 py-1 text-[12px] font-medium text-[#0067c0] border border-[#99d1ff] bg-[#e5f3ff] rounded-[4px] hover:bg-[#cce8ff]"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <ul role="tree" aria-label="Dispositivos del equipo" className="text-[13px] leading-tight">
                {/* Nodo raíz del equipo */}
                <li
                  role="treeitem"
                  aria-expanded={rootExpanded}
                  aria-selected={selectedNodeId === 'root-pc'}
                >
                  <div
                    onClick={() => selectNode('root-pc')}
                    onDoubleClick={() => setRootExpanded((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-1.5 py-1 rounded-[2px] cursor-default min-w-0 ${
                      selectedNodeId === 'root-pc'
                        ? 'bg-[#cce8ff] ring-1 ring-inset ring-[#99d1ff]'
                        : 'hover:bg-[#f0f7ff]'
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={rootExpanded ? 'Contraer equipo' : 'Expandir equipo'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRootExpanded((prev) => !prev);
                      }}
                      className="w-4 h-4 flex items-center justify-center text-[#555555] hover:text-[#1a1a1a] shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
                    >
                      <i
                        className={`fa-solid ${
                          rootExpanded ? 'fa-chevron-down' : 'fa-chevron-right'
                        } text-[10px] transition-transform duration-150`}
                        aria-hidden="true"
                      />
                    </button>
                    <span className="w-4 h-4 flex items-center justify-center text-[#0284c7] shrink-0">
                      <i className="fa-solid fa-desktop text-[13px]" aria-hidden="true" />
                    </span>
                    <span className="font-medium text-[#1a1a1a] truncate">DESKTOP-FANTASMA</span>
                  </div>

                  {rootExpanded && renderCategoryTree(deviceTree)}
                </li>
              </ul>
            )}
          </section>

          {showHelpDesk && (
            <HelpDeskPanel
              devices={devices}
              onClose={() => setShowHelpDesk(false)}
              onResetLab={handleResetLab}
              onExportReport={handleExportReport}
              onFocusDevice={handleFocusDevice}
            />
          )}
        </div>

        {/* Pie de ventana con estado dinámico del dispositivo y logo/enlace */}
        <footer className="bg-[#f8f9fa] border-t border-[#e5e5e5] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[12px] text-[#52525b] flex items-center gap-2 min-w-0 flex-1">
            {selectedDevice ? (
              <span className="truncate">
                <strong className="font-medium text-[#1e293b]">{selectedDevice.name}</strong>
                <span aria-hidden="true"> · </span>
                <span
                  className={
                    selectedDevice.disabled
                      ? 'text-[#475569] font-medium'
                      : selectedDevice.status === 'OK'
                        ? 'text-[#15803d] font-medium'
                        : 'text-[#b45309] font-medium'
                  }
                >
                  {getDeviceStatusMessage(selectedDevice)}
                </span>
              </span>
            ) : (
              <span className="truncate">
                <span>Vista: Dispositivos por tipo</span>
                {showHidden && <span> (incl. ocultos)</span>}
                <span aria-hidden="true"> · </span>
                <span className="tabular-nums">{devices.length} dispositivos</span>
                <span aria-hidden="true"> · </span>
                <span
                  className={`tabular-nums font-medium ${
                    problemCount > 0 ? 'text-[#b45309]' : 'text-[#15803d]'
                  }`}
                >
                  {problemCount > 0
                    ? `${problemCount} con problemas`
                    : 'Todos los dispositivos funcionan correctamente'}
                </span>
              </span>
            )}
          </div>

          <a
            href="https://www.unfantasmaenelsistema.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-[12px] font-medium text-[#1e293b] hover:text-[#0067c0] transition-colors duration-150 whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0] rounded-[4px] px-1.5 py-0.5"
          >
            {!logoError ? (
              <img
                src="./assets/aistudio/icono_81a3db5b.png"
                alt="Logo de Un Fantasma en el Sistema"
                referrerPolicy="no-referrer"
                onError={() => setLogoError(true)}
                className="w-8 h-8 object-contain shrink-0"
              />
            ) : (
              <span className="w-8 h-8 flex items-center justify-center bg-white border border-[#e2e8f0] rounded-[4px] text-[#0067c0] shrink-0">
                <i className="fa-solid fa-ghost text-[15px]" aria-hidden="true" />
              </span>
            )}
            <span className="group-hover:underline">unfantasmaenelsistema.com</span>
          </a>
        </footer>
      </main>

      {/* Menú contextual (clic derecho en el árbol) */}
      <ContextMenu
        device={contextMenu?.device ?? null}
        position={contextMenu?.position ?? null}
        onClose={() => setContextMenu(null)}
        onOpenProperties={(dev) => openDeviceProperties(dev)}
        onUpdateDriver={(dev) => openDeviceProperties(dev, 'driver', true)}
        onToggleDisable={handleToggleDisable}
        onUninstall={handleUninstallDevice}
        onScanHardware={handleScanHardwareChanges}
      />

      {/* Modal de Propiedades del dispositivo */}
      <DevicePropertiesModal
        device={propertiesDevice}
        deviceIconClass={propertiesDevice ? getDeviceIcon(propertiesDevice) : ''}
        initialTab={propertiesState.initialTab}
        openUpdateImmediately={propertiesState.openUpdateImmediately}
        onClose={() =>
          setPropertiesState({ deviceId: null, initialTab: 'general', openUpdateImmediately: false })
        }
        onRevertDriver={handleRevertDriver}
        onInstallDriver={handleInstallDriver}
        onToggleDisable={handleToggleDisable}
        onUninstallDevice={handleUninstallDevice}
      />

      {/* Modal educativo de Ayuda y Acerca de */}
      <HelpModal mode={helpModalMode} onClose={() => setHelpModalMode(null)} />
    </div>
  );
}
