export type DeviceStatus = 'OK' | 'ERROR' | 'WARNING';

export type DeviceErrorCode = null | 10 | 28 | 43;

export type DeviceCategoryName =
  | 'Adaptadores de pantalla'
  | 'Adaptadores de red'
  | 'Controladoras de sonido, vídeo y juegos'
  | 'Controladoras USB'
  | 'Otros dispositivos'
  | 'Procesadores'
  | 'Unidades de disco';

export interface DriverPackage {
  resolvedName?: string;
  resolvedCategory?: DeviceCategoryName;
  provider: string;
  version: string;
  date: string;
  signer: string;
}

export interface DeviceEventLog {
  timestamp: string;
  title: string;
  detail: string;
}

export interface HardwareDevice {
  id: string;
  name: string;
  category: DeviceCategoryName;
  manufacturer: string;
  location: string;
  status: DeviceStatus;
  errorCode: DeviceErrorCode;
  disabled?: boolean;
  hidden?: boolean;
  hardwareID: string;
  driverProvider: string;
  driverVersion: string;
  driverDate: string;
  driverSigner: string;
  previousDriver?: DriverPackage;
  availableDriverUpdate?: DriverPackage;
  events: DeviceEventLog[];
}

export interface CategoryMeta {
  name: DeviceCategoryName;
  iconClass: string;
  iconColor: string;
}

export interface DeviceTreeGroup extends CategoryMeta {
  id: string;
  devices: HardwareDevice[];
}

export interface HelpDeskTicket {
  id: string;
  code: string;
  title: string;
  userReport: string;
  objective: string;
  hint: string;
  targetDeviceId: string;
  isCompleted: (devices: HardwareDevice[]) => boolean;
}

export const WHQL_SIGNER = 'Microsoft Windows Hardware Compatibility Publisher';

export const ERROR_CODE_MESSAGES: Record<Exclude<DeviceErrorCode, null>, string> = {
  10: 'Este dispositivo no puede iniciar. (Código 10)',
  28: 'Los controladores para este dispositivo no están instalados. (Código 28)',
  43: 'Windows detuvo este dispositivo porque informó de problemas. (Código 43)',
};

export const CATEGORY_METADATA: Record<DeviceCategoryName, CategoryMeta> = {
  'Adaptadores de pantalla': {
    name: 'Adaptadores de pantalla',
    iconClass: 'fa-solid fa-display',
    iconColor: 'text-[#0284c7]',
  },
  'Adaptadores de red': {
    name: 'Adaptadores de red',
    iconClass: 'fa-solid fa-network-wired',
    iconColor: 'text-[#0d9488]',
  },
  'Controladoras de sonido, vídeo y juegos': {
    name: 'Controladoras de sonido, vídeo y juegos',
    iconClass: 'fa-solid fa-volume-high',
    iconColor: 'text-[#4f46e5]',
  },
  'Controladoras USB': {
    name: 'Controladoras USB',
    iconClass: 'fa-brands fa-usb',
    iconColor: 'text-[#475569]',
  },
  'Otros dispositivos': {
    name: 'Otros dispositivos',
    iconClass: 'fa-solid fa-circle-question',
    iconColor: 'text-[#d97706]',
  },
  Procesadores: {
    name: 'Procesadores',
    iconClass: 'fa-solid fa-microchip',
    iconColor: 'text-[#0369a1]',
  },
  'Unidades de disco': {
    name: 'Unidades de disco',
    iconClass: 'fa-solid fa-hard-drive',
    iconColor: 'text-[#334155]',
  },
};

export const HARDWARE_DEVICES: HardwareDevice[] = [
  {
    id: 'gpu-intel-uhd',
    name: 'Intel(R) UHD Graphics 770',
    category: 'Adaptadores de pantalla',
    manufacturer: 'Intel Corporation',
    location: 'Bus PCI 0, dispositivo 2, función 0',
    status: 'OK',
    errorCode: null,
    hardwareID: 'PCI\\VEN_8086&DEV_A780&SUBSYS_86941043&REV_04',
    driverProvider: 'Intel Corporation',
    driverVersion: '31.0.101.5333',
    driverDate: '2024-02-21',
    driverSigner: WHQL_SIGNER,
    events: [
      {
        timestamp: '2024-02-21 10:12:04',
        title: 'Dispositivo configurado (iigd_dch.inf)',
        detail: 'Controlador gráfico integrado inicializado correctamente.',
      },
      {
        timestamp: '2024-02-21 10:12:06',
        title: 'Dispositivo iniciado (igfxn)',
        detail: 'Estado de arranque: 0x0.',
      },
    ],
  },
  {
    id: 'gpu-nvidia-rtx',
    name: 'NVIDIA GeForce RTX 4070',
    category: 'Adaptadores de pantalla',
    manufacturer: 'NVIDIA',
    location: 'Bus PCI 1, dispositivo 0, función 0',
    status: 'ERROR',
    errorCode: 43,
    hardwareID: 'PCI\\VEN_10DE&DEV_2786&SUBSYS_40E41458&REV_A1',
    driverProvider: 'NVIDIA',
    driverVersion: '31.0.15.5186',
    driverDate: '2024-03-12',
    driverSigner: 'NVIDIA Beta Unsigned (Sin verificar)',
    previousDriver: {
      provider: 'NVIDIA',
      version: '31.0.15.4633',
      date: '2023-12-08',
      signer: WHQL_SIGNER,
    },
    availableDriverUpdate: {
      provider: 'NVIDIA',
      version: '31.0.15.5212',
      date: '2024-04-02',
      signer: WHQL_SIGNER,
    },
    events: [
      {
        timestamp: '2023-12-08 18:05:12',
        title: 'Dispositivo iniciado (nvlddmkm)',
        detail: 'Controlador estable v31.0.15.4633 (WHQL) funcionando con normalidad.',
      },
      {
        timestamp: '2024-03-12 09:14:02',
        title: 'Dispositivo instalado (nv_dispi.inf)',
        detail: 'Actualizado a v31.0.15.5186 (firmante no verificado).',
      },
      {
        timestamp: '2024-03-12 09:14:18',
        title: 'El dispositivo tuvo un problema al iniciarse',
        detail: 'Windows detuvo el dispositivo tras informar fallo POST_START (Código 43).',
      },
    ],
  },
  {
    id: 'net-intel-wifi',
    name: 'Intel(R) Wi-Fi 6E AX211 160MHz',
    category: 'Adaptadores de red',
    manufacturer: 'Intel Corporation',
    location: 'Bus PCI 0, dispositivo 20, función 3',
    status: 'ERROR',
    errorCode: 10,
    hardwareID: 'PCI\\VEN_8086&DEV_51F0&SUBSYS_00908086&REV_01',
    driverProvider: 'Intel Corporation',
    driverVersion: '23.40.0.4',
    driverDate: '2024-02-18',
    driverSigner: 'Intel Test Build (Sin firma WHQL)',
    availableDriverUpdate: {
      provider: 'Intel Corporation',
      version: '23.50.0.6',
      date: '2024-04-10',
      signer: WHQL_SIGNER,
    },
    events: [
      {
        timestamp: '2024-02-18 11:30:10',
        title: 'Dispositivo instalado (netwtw10.inf)',
        detail: 'Paquete de controlador v23.40.0.4 cargado sin firma WHQL.',
      },
      {
        timestamp: '2024-11-16 01:48:50',
        title: 'Error al iniciar el dispositivo (Netwtw10)',
        detail: 'El adaptador no respondió al comando de arranque (Código 10 / 0xC0000001).',
      },
    ],
  },
  {
    id: 'net-realtek-gbe',
    name: 'Realtek PCIe 2.5GbE Family Controller',
    category: 'Adaptadores de red',
    manufacturer: 'Realtek',
    location: 'Bus PCI 4, dispositivo 0, función 0',
    status: 'OK',
    errorCode: null,
    hardwareID: 'PCI\\VEN_10EC&DEV_8125&SUBSYS_87D71043&REV_05',
    driverProvider: 'Realtek',
    driverVersion: '1125.16.1123.2023',
    driverDate: '2023-11-23',
    driverSigner: WHQL_SIGNER,
    events: [
      {
        timestamp: '2023-11-23 14:22:19',
        title: 'Dispositivo iniciado (rt640x64)',
        detail: 'Enlace Ethernet 2.5 Gbps operativo.',
      },
    ],
  },
  {
    id: 'net-wan-miniport',
    name: 'WAN Miniport (IP)',
    category: 'Adaptadores de red',
    manufacturer: 'Microsoft',
    location: 'Dispositivo virtual de red',
    status: 'OK',
    errorCode: null,
    hardwareID: 'ms_ndiswanip',
    driverProvider: 'Microsoft',
    driverVersion: '10.0.22621.1',
    driverDate: '2006-06-21',
    driverSigner: WHQL_SIGNER,
    events: [
      {
        timestamp: '2024-01-10 08:00:00',
        title: 'Dispositivo configurado (netrasa.inf)',
        detail: 'Controlador de túnel virtual operativo.',
      },
    ],
  },
  {
    id: 'net-hidden-loopback',
    name: 'Adaptador de bucle invertido Microsoft KM-TEST',
    category: 'Adaptadores de red',
    manufacturer: 'Microsoft',
    location: 'Dispositivo virtual desconectado',
    status: 'OK',
    errorCode: null,
    hidden: true,
    hardwareID: '*MSLOOP',
    driverProvider: 'Microsoft',
    driverVersion: '10.0.22621.1',
    driverDate: '2006-06-21',
    driverSigner: WHQL_SIGNER,
    events: [
      {
        timestamp: '2024-04-02 16:40:12',
        title: 'Dispositivo no conectado actualmente (Phantom)',
        detail: 'Visible únicamente con la opción "Mostrar dispositivos ocultos".',
      },
    ],
  },
  {
    id: 'audio-realtek',
    name: 'Realtek(R) Audio',
    category: 'Controladoras de sonido, vídeo y juegos',
    manufacturer: 'Realtek',
    location: 'Bus de audio de alta definición',
    status: 'OK',
    errorCode: null,
    hardwareID: 'HDAUDIO\\FUNC_01&VEN_10EC&DEV_0897&SUBSYS_104387FB',
    driverProvider: 'Realtek Semiconductor Corp.',
    driverVersion: '6.0.9590.1',
    driverDate: '2023-10-17',
    driverSigner: WHQL_SIGNER,
    events: [
      {
        timestamp: '2023-10-17 12:04:33',
        title: 'Dispositivo iniciado (IntcAzAudAddService)',
        detail: 'Códec de audio de alta definición activo.',
      },
    ],
  },
  {
    id: 'usb-root-hub',
    name: 'Concentrador raíz USB (USB 3.0)',
    category: 'Controladoras USB',
    manufacturer: '(Controladora de host USB estándar)',
    location: 'En Controladora de host extensible Intel(R) USB 3.2',
    status: 'OK',
    errorCode: null,
    hardwareID: 'USB\\ROOT_HUB30&VID8086&PID7A60&REV0011',
    driverProvider: 'Microsoft',
    driverVersion: '10.0.22621.3235',
    driverDate: '2024-02-29',
    driverSigner: WHQL_SIGNER,
    events: [
      {
        timestamp: '2024-02-29 09:00:14',
        title: 'Dispositivo iniciado (USBHUB3)',
        detail: 'Concentrador USB 3.0 operativo.',
      },
    ],
  },
  {
    id: 'usb-intel-xhci',
    name: 'Controladora de host extensible Intel(R) USB 3.2 - 1.20 (Microsoft)',
    category: 'Controladoras USB',
    manufacturer: 'Controladora de host extensible USB genérica',
    location: 'Bus PCI 0, dispositivo 20, función 0',
    status: 'OK',
    errorCode: null,
    hardwareID: 'PCI\\VEN_8086&DEV_7A60&SUBSYS_86941043&REV_11',
    driverProvider: 'Microsoft',
    driverVersion: '10.0.22621.3235',
    driverDate: '2024-02-29',
    driverSigner: WHQL_SIGNER,
    events: [
      {
        timestamp: '2024-02-29 09:00:11',
        title: 'Dispositivo iniciado (USBXHCI)',
        detail: 'Controladora xHCI operativa.',
      },
    ],
  },
  {
    id: 'usb-mass-storage',
    name: 'Dispositivo de almacenamiento masivo USB',
    category: 'Controladoras USB',
    manufacturer: 'Dispositivo de almacenamiento USB compatible',
    location: 'Port_#0004.Hub_#0001',
    status: 'OK',
    errorCode: null,
    hardwareID: 'USB\\VID_0781&PID_5581&REV_0100',
    driverProvider: 'Microsoft',
    driverVersion: '10.0.22621.2506',
    driverDate: '2006-06-21',
    driverSigner: WHQL_SIGNER,
    events: [
      {
        timestamp: '2024-11-15 20:15:02',
        title: 'Dispositivo iniciado (USBSTOR)',
        detail: 'Unidad flash montada correctamente.',
      },
    ],
  },
  {
    id: 'usb-hidden-legacy',
    name: 'SanDisk Cruzer Blade USB (Desconectado)',
    category: 'Controladoras USB',
    manufacturer: 'SanDisk',
    location: 'Port_#0001.Hub_#0002 (No conectado)',
    status: 'OK',
    errorCode: null,
    hidden: true,
    hardwareID: 'USB\\VID_0781&PID_5567&REV_0126',
    driverProvider: 'Microsoft',
    driverVersion: '10.0.22621.2506',
    driverDate: '2006-06-21',
    driverSigner: WHQL_SIGNER,
    events: [
      {
        timestamp: '2024-10-08 17:42:09',
        title: 'Última conexión registrada',
        detail: 'Instancia almacenada en caché Plug & Play (desconectada).',
      },
    ],
  },
  {
    id: 'other-pci-comm',
    name: 'Controladora PCI de comunicaciones simples',
    category: 'Otros dispositivos',
    manufacturer: 'Desconocido',
    location: 'Bus PCI 0, dispositivo 22, función 0',
    status: 'WARNING',
    errorCode: 28,
    hardwareID: 'PCI\\VEN_8086&DEV_7A68&SUBSYS_86941043&REV_11',
    driverProvider: 'Desconocido',
    driverVersion: 'No instalado',
    driverDate: 'No disponible',
    driverSigner: 'Sin firma digital',
    availableDriverUpdate: {
      resolvedName: 'Intel(R) Management Engine Interface #1',
      provider: 'Intel Corporation',
      version: '2345.5.3.0',
      date: '2024-01-19',
      signer: WHQL_SIGNER,
    },
    events: [
      {
        timestamp: '2024-11-16 01:30:00',
        title: 'Dispositivo no configurado (PCI\\VEN_8086&DEV_7A68)',
        detail: 'No se encontraron controladores instalados (Código 28).',
      },
    ],
  },
  {
    id: 'other-unknown-dev',
    name: 'Dispositivo desconocido (Lector RFID)',
    category: 'Otros dispositivos',
    manufacturer: 'Desconocido',
    location: 'Port_#0002.Hub_#0001',
    status: 'WARNING',
    errorCode: 28,
    hardwareID: 'USB\\VID_072F&PID_2200&REV_0100',
    driverProvider: 'Desconocido',
    driverVersion: 'No instalado',
    driverDate: 'No disponible',
    driverSigner: 'Sin firma digital',
    availableDriverUpdate: {
      resolvedName: 'ACS ACR122U Lector RFID/NFC USB',
      resolvedCategory: 'Controladoras USB',
      provider: 'Advanced Card Systems',
      version: '4.2.8.0',
      date: '2024-01-25',
      signer: WHQL_SIGNER,
    },
    events: [
      {
        timestamp: '2024-11-16 02:04:11',
        title: 'Dispositivo conectado (USB\\VID_072F&PID_2200)',
        detail: 'No se encontró ningún controlador compatible (Código 28).',
      },
    ],
  },
  {
    id: 'cpu-i7-0',
    name: '13th Gen Intel(R) Core(TM) i7-13700K',
    category: 'Procesadores',
    manufacturer: 'Intel',
    location: 'Procesador lógico 0',
    status: 'OK',
    errorCode: null,
    hardwareID: 'ACPI\\GenuineIntel_-_Intel64_Family_6_Model_183',
    driverProvider: 'Microsoft',
    driverVersion: '10.0.22621.3007',
    driverDate: '2009-04-21',
    driverSigner: WHQL_SIGNER,
    events: [
      {
        timestamp: '2024-01-10 08:00:00',
        title: 'Dispositivo iniciado (intelppm)',
        detail: 'Gestión de energía de CPU operativa.',
      },
    ],
  },
  {
    id: 'disk-samsung-nvme',
    name: 'Samsung SSD 980 PRO 1TB',
    category: 'Unidades de disco',
    manufacturer: '(Unidades de disco estándar)',
    location: 'Bus 0, destino 0, LUN 0 (NVMe)',
    status: 'OK',
    errorCode: null,
    hardwareID: 'SCSI\\DiskNVMe____Samsung_SSD_980_1B2Q',
    driverProvider: 'Microsoft',
    driverVersion: '10.0.22621.2506',
    driverDate: '2006-06-21',
    driverSigner: WHQL_SIGNER,
    events: [
      {
        timestamp: '2024-01-10 08:00:00',
        title: 'Dispositivo iniciado (disk)',
        detail: 'Unidad NVMe PCIe 4.0 operativa.',
      },
    ],
  },
];

export const HELPDESK_TICKETS: HelpDeskTicket[] = [
  {
    id: 'ticket-1',
    code: 'Ticket 1',
    title: 'Pantalla con baja resolución tras actualización.',
    userReport:
      'El usuario reporta que tras instalar una actualización gráfica la pantalla quedó bloqueada a baja resolución y los monitores externos no responden.',
    objective:
      'Inspeccione la GPU con Código 43 y revierta al controlador anterior verificado.',
    hint: 'Abra Adaptadores de pantalla → doble clic en NVIDIA GeForce RTX 4070 → pestaña Controlador → pulse "Revertir al controlador anterior".',
    targetDeviceId: 'gpu-nvidia-rtx',
    isCompleted: (devices) => {
      const gpu = devices.find((d) => d.id === 'gpu-nvidia-rtx');
      return Boolean(gpu && !gpu.disabled && gpu.status === 'OK' && gpu.errorCode === null);
    },
  },
  {
    id: 'ticket-2',
    code: 'Ticket 2',
    title: 'Dispositivo USB desconocido al conectar lector RFID.',
    userReport:
      'Al conectar el lector de tarjetas RFID en el puesto de recepción aparece con advertencia amarilla y no lee credenciales.',
    objective:
      'Localice el dispositivo con Código 28, copie su identificador en Detalles y actualice el controlador.',
    hint: 'En Otros dispositivos → Dispositivo desconocido (Lector RFID) → Detalles → copie USB\\VID_072F&PID_2200 → Controlador → Actualizar controlador... y búsquelo.',
    targetDeviceId: 'other-unknown-dev',
    isCompleted: (devices) => {
      const rfid = devices.find((d) => d.id === 'other-unknown-dev');
      return Boolean(rfid && !rfid.disabled && rfid.status === 'OK' && rfid.errorCode === null);
    },
  },
  {
    id: 'ticket-3',
    code: 'Ticket 3',
    title: 'Fallo de arranque en tarjeta de red.',
    userReport:
      'El portátil perdió la conectividad Wi-Fi corporativa y el adaptador muestra un error de inicialización.',
    objective:
      'Identifique el adaptador de red con Código 10 y devuélvale la conexión con un controlador firmado (WHQL).',
    hint: 'En Adaptadores de red → Intel(R) Wi-Fi 6E AX211 160MHz → revise la alerta de firma sin verificar y actualice con PCI\\VEN_8086&DEV_51F0, o desinstálelo y pulse "Buscar cambios de hardware". Deshabilitarlo no devuelve la Wi-Fi al usuario.',
    targetDeviceId: 'net-intel-wifi',
    // El usuario necesita la Wi-Fi: deshabilitar el adaptador quita el aviso amarillo, pero no resuelve la incidencia.
    isCompleted: (devices) => {
      const net = devices.find((d) => d.id === 'net-intel-wifi');
      return Boolean(
        net &&
          !net.disabled &&
          net.status === 'OK' &&
          net.errorCode === null &&
          net.driverSigner === WHQL_SIGNER
      );
    },
  },
];

export interface TreeBuildOptions {
  showHidden?: boolean;
  onlyProblems?: boolean;
  searchQuery?: string;
}

/**
 * Construye dinámicamente la estructura jerárquica del árbol de dispositivos
 * aplicando filtros opcionales de dispositivos ocultos, errores y búsqueda.
 */
export function buildDeviceTree(
  devices: HardwareDevice[],
  options: TreeBuildOptions = {}
): DeviceTreeGroup[] {
  const { showHidden = false, onlyProblems = false, searchQuery = '' } = options;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const categoryOrder: DeviceCategoryName[] = [
    'Adaptadores de pantalla',
    'Adaptadores de red',
    'Controladoras de sonido, vídeo y juegos',
    'Controladoras USB',
    'Otros dispositivos',
    'Procesadores',
    'Unidades de disco',
  ];

  const grouped = new Map<DeviceCategoryName, HardwareDevice[]>();
  categoryOrder.forEach((cat) => grouped.set(cat, []));

  for (const device of devices) {
    if (!showHidden && device.hidden) continue;
    if (onlyProblems && (device.disabled || (device.status !== 'ERROR' && device.status !== 'WARNING'))) {
      continue;
    }
    if (normalizedQuery) {
      const matchesName = device.name.toLowerCase().includes(normalizedQuery);
      const matchesId = device.hardwareID.toLowerCase().includes(normalizedQuery);
      const matchesCat = device.category.toLowerCase().includes(normalizedQuery);
      const matchesErr =
        device.errorCode !== null && String(device.errorCode).includes(normalizedQuery);
      if (!matchesName && !matchesId && !matchesCat && !matchesErr) continue;
    }

    const list = grouped.get(device.category);
    if (list) {
      list.push(device);
    } else {
      grouped.set(device.category, [device]);
    }
  }

  const tree: DeviceTreeGroup[] = [];
  for (const [categoryName, items] of grouped.entries()) {
    if (items.length === 0) continue;
    const meta = CATEGORY_METADATA[categoryName];
    tree.push({
      id: `cat-${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: meta.name,
      iconClass: meta.iconClass,
      iconColor: meta.iconColor,
      devices: items,
    });
  }

  return tree;
}

export function getDeviceStatusMessage(device: HardwareDevice): string {
  if (device.disabled) {
    return 'Este dispositivo está deshabilitado.';
  }
  if (device.status === 'OK' || device.errorCode === null) {
    return 'Este dispositivo funciona correctamente.';
  }
  return ERROR_CODE_MESSAGES[device.errorCode];
}

export function isDriverSignatureVerified(device: HardwareDevice): boolean {
  return device.driverSigner === WHQL_SIGNER;
}

export function getShortHardwareId(hardwareID: string): string {
  const match = hardwareID.match(
    /^((?:PCI\\VEN_[^&]+&DEV_[^&]+)|(?:USB\\VID_[^&]+&PID_[^&]+)|(?:ACPI\\VEN_[^&]+&DEV_[^&]+))/i
  );
  return match ? match[1] : hardwareID;
}

export function matchesHardwareIdQuery(device: HardwareDevice, rawQuery: string): boolean {
  const query = rawQuery.trim().toUpperCase();
  if (!query) return false;

  const fullId = device.hardwareID.toUpperCase();
  const shortId = getShortHardwareId(device.hardwareID).toUpperCase();
  const bareVenDev = shortId.replace(/^(?:PCI|USB|ACPI)\\/i, '');

  return query === fullId || query === shortId || query === bareVenDev;
}

export function formatCurrentTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
