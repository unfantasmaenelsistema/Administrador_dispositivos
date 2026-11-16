import { useState } from 'react';
import { HELPDESK_TICKETS, type HardwareDevice } from '../data/devices';

interface HelpDeskPanelProps {
  devices: HardwareDevice[];
  onClose: () => void;
  onResetLab: () => void;
  onExportReport: () => void;
  onFocusDevice: (deviceId: string) => void;
}

export function HelpDeskPanel({
  devices,
  onClose,
  onResetLab,
  onExportReport,
  onFocusDevice,
}: HelpDeskPanelProps) {
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});
  const completedCount = HELPDESK_TICKETS.filter((ticket) => ticket.isCompleted(devices)).length;
  const allCompleted = completedCount === HELPDESK_TICKETS.length;

  const toggleHint = (ticketId: string) => {
    setOpenHints((prev) => ({ ...prev, [ticketId]: !prev[ticketId] }));
  };

  return (
    <aside
      aria-label="HelpDesk Tickets"
      className="w-full lg:w-[348px] xl:w-[368px] shrink-0 max-h-[46%] lg:max-h-none bg-[#f8fafc] border-t lg:border-t-0 lg:border-l border-[#e5e5e5] flex flex-col min-h-0 overflow-hidden"
    >
      {/* Cabecera del panel lateral */}
      <div className="px-3.5 py-2.5 bg-white border-b border-[#e5e5e5] flex items-center justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-ticket text-[13px] text-[#0067c0]" aria-hidden="true" />
            <h2 className="text-[13px] font-semibold text-[#1a1a1a] truncate">
              HelpDesk Tickets
            </h2>
          </div>
          <p className="text-[11.5px] text-[#52525b] mt-0.5 tabular-nums">
            GhostAcademy · {completedCount}/{HELPDESK_TICKETS.length} completados
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Ocultar panel HelpDesk Tickets"
          title="Ocultar panel"
          className="w-7 h-7 flex items-center justify-center rounded-[4px] text-[#52525b] hover:bg-[#e5e5e5] hover:text-[#1a1a1a] transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
        >
          <i className="fa-solid fa-xmark text-[12px]" aria-hidden="true" />
        </button>
      </div>

      {/* Lista de misiones */}
      <div className="flex-1 overflow-y-auto win11-scrollbar p-3 space-y-2.5 min-h-0">
        {allCompleted && (
          <div
            role="status"
            className="border border-[#86efac] bg-[#f0fdf4] rounded-[6px] p-3 flex items-start gap-2.5 text-[12px] text-[#166534]"
          >
            <i className="fa-solid fa-circle-check text-[14px] text-[#16a34a] mt-0.5 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold">Todos los tickets completados</p>
              <p className="text-[11.5px] text-[#15803d] mt-0.5 leading-snug">
                Has diagnosticado y resuelto correctamente las incidencias de hardware asignadas.
              </p>
            </div>
          </div>
        )}

        {HELPDESK_TICKETS.map((ticket) => {
          const completed = ticket.isCompleted(devices);
          const targetExists = devices.some((d) => d.id === ticket.targetDeviceId);
          const hintOpen = !!openHints[ticket.id];

          return (
            <article
              key={ticket.id}
              className={`rounded-[6px] border p-3 transition-colors duration-150 ${
                completed
                  ? 'bg-[#f0fdf4] border-[#86efac]'
                  : 'bg-white border-[#e2e8f0]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[11.5px]">
                <span className="font-semibold text-[#334155]">{ticket.code}</span>
                <span
                  className={`inline-flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 ${
                    completed ? 'text-[#15803d]' : 'text-[#64748b]'
                  }`}
                >
                  <i
                    className={`fa-solid ${
                      completed ? 'fa-circle-check text-[#16a34a]' : 'fa-clock text-[#94a3b8]'
                    } text-[11px]`}
                    aria-hidden="true"
                  />
                  <span>{completed ? 'Completado' : 'Pendiente'}</span>
                </span>
              </div>

              <h3
                className={`text-[12.5px] font-semibold mt-1.5 leading-snug break-words ${
                  completed ? 'text-[#14532d]' : 'text-[#1a1a1a]'
                }`}
              >
                {ticket.title}
              </h3>

              <p
                className={`text-[11.5px] mt-1 leading-relaxed break-words ${
                  completed ? 'text-[#166534]' : 'text-[#52525b]'
                }`}
              >
                {ticket.objective}
              </p>

              {!completed && (
                <>
                  {hintOpen && (
                    <div className="mt-2 p-2 rounded-[4px] bg-[#eff6ff] border border-[#bfdbfe] text-[11px] text-[#1e3a8a] leading-snug break-words">
                      {ticket.hint}
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-[#f1f5f9] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleHint(ticket.id)}
                      className="text-[11.5px] text-[#475569] hover:text-[#1a1a1a] hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0] rounded-[2px]"
                    >
                      {hintOpen ? 'Ocultar pista' : 'Ver pista'}
                    </button>

                    {targetExists && (
                      <button
                        type="button"
                        onClick={() => onFocusDevice(ticket.targetDeviceId)}
                        className="text-[11.5px] font-medium text-[#0067c0] hover:text-[#004578] hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0] rounded-[2px]"
                      >
                        Seleccionar dispositivo
                      </button>
                    )}
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>

      {/* Pie del panel */}
      <div className="px-3.5 py-2.5 bg-white border-t border-[#e5e5e5] flex items-center justify-between gap-2 shrink-0">
        <button
          type="button"
          onClick={onExportReport}
          className="px-2.5 py-1 text-[11.5px] font-medium text-[#1a1a1a] bg-[#fdfdfd] border border-[#cbd5e1] rounded-[4px] hover:bg-[#e5f1fb] hover:border-[#0078d4] transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
        >
          <i className="fa-solid fa-download text-[10px] text-[#0067c0]" aria-hidden="true" />
          <span>Exportar informe</span>
        </button>

        <button
          type="button"
          onClick={onResetLab}
          className="px-2.5 py-1 text-[11.5px] font-medium text-[#1a1a1a] bg-[#fdfdfd] border border-[#cbd5e1] rounded-[4px] hover:bg-[#e5f1fb] hover:border-[#0078d4] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0067c0]"
        >
          Reiniciar práctica
        </button>
      </div>
    </aside>
  );
}
