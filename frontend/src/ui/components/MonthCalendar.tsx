// frontend/src/ui/components/MonthCalendar.tsx
// Calendário mensal genérico (segunda a domingo, pt-BR). Mobile-first: no
// celular cada dia mostra só pontos e a lista do dia selecionado aparece
// abaixo da grade; a partir de `sm` os eventos aparecem dentro das células.
import React, { useMemo, useState } from "react";
import clsx from "clsx";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export type CalendarEventTone = "brand" | "danger" | "success" | "muted";

export type CalendarEvent = {
  id: string;
  date: Date;
  title: string;
  /** Linha secundária exibida na lista do dia (ex.: horário, cidade). */
  subtitle?: string;
  tone?: CalendarEventTone;
};

const TONE_CHIP: Record<CalendarEventTone, string> = {
  brand: "bg-brand-100 text-brand-800",
  danger: "bg-red-100 text-red-800",
  success: "bg-green-100 text-green-800",
  muted: "bg-gray-100 text-gray-700",
};

const TONE_DOT: Record<CalendarEventTone, string> = {
  brand: "bg-brand-600",
  danger: "bg-danger-500",
  success: "bg-success-500",
  muted: "bg-muted-500",
};

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MAX_CHIPS = 2;

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const MonthCalendar: React.FC<{
  month: Date;
  onMonthChange: (month: Date) => void;
  events: CalendarEvent[];
  onEventClick?: (id: string) => void;
}> = ({ month, onMonthChange, events, onEventClick }) => {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState<Date>(
    isSameMonth(today, month) ? today : startOfMonth(month),
  );

  const days = useMemo(() => {
    const first = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const last = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const out: Date[] = [];
    for (let d = first; d <= last; d = addDays(d, 1)) out.push(d);
    return out;
  }, [month]);

  const eventsOn = (day: Date) =>
    events
      .filter((e) => isSameDay(e.date, day))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

  const goTo = (next: Date) => {
    onMonthChange(next);
    setSelectedDay(isSameMonth(today, next) ? today : startOfMonth(next));
  };

  const selectedEvents = eventsOn(selectedDay);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-card">
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-gray-200">
        <button
          type="button"
          aria-label="Mês anterior"
          onClick={() => goTo(subMonths(month, 1))}
          className="px-3 py-1.5 rounded hover:bg-gray-100 text-lg leading-none"
        >
          ‹
        </button>
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-base sm:text-lg">
            {capitalize(format(month, "MMMM 'de' yyyy", { locale: ptBR }))}
          </h2>
          {!isSameMonth(today, month) && (
            <button
              type="button"
              onClick={() => goTo(today)}
              className="text-xs text-brand-600 hover:underline"
            >
              Hoje
            </button>
          )}
        </div>
        <button
          type="button"
          aria-label="Próximo mês"
          onClick={() => goTo(addMonths(month, 1))}
          className="px-3 py-1.5 rounded hover:bg-gray-100 text-lg leading-none"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 border-b border-gray-200">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = eventsOn(day);
          const inMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDay);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => setSelectedDay(day)}
              aria-label={format(day, "d 'de' MMMM", { locale: ptBR })}
              aria-pressed={isSelected}
              className={clsx(
                "min-h-[52px] sm:min-h-[96px] border-b border-r border-gray-100 p-1 sm:p-1.5 text-left align-top flex flex-col",
                !inMonth && "bg-gray-50 text-gray-400",
                isSelected && "ring-2 ring-inset ring-brand-500",
              )}
            >
              <span
                className={clsx(
                  "text-xs sm:text-sm w-6 h-6 flex items-center justify-center rounded-full self-center sm:self-start",
                  isToday && "bg-brand-600 text-white font-semibold",
                )}
              >
                {format(day, "d")}
              </span>

              {/* Celular: só pontos */}
              {dayEvents.length > 0 && (
                <span className="flex sm:hidden justify-center gap-0.5 mt-1 flex-wrap">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className={clsx(
                        "w-1.5 h-1.5 rounded-full",
                        TONE_DOT[e.tone ?? "brand"],
                      )}
                    />
                  ))}
                </span>
              )}

              {/* sm+: títulos */}
              <span className="hidden sm:flex flex-col gap-0.5 mt-1 w-full">
                {dayEvents.slice(0, MAX_CHIPS).map((e) => (
                  <span
                    key={e.id}
                    title={e.title}
                    onClick={(ev) => {
                      if (!onEventClick) return;
                      ev.stopPropagation();
                      onEventClick(e.id);
                    }}
                    className={clsx(
                      "truncate rounded px-1 py-0.5 text-[11px] leading-tight",
                      TONE_CHIP[e.tone ?? "brand"],
                      onEventClick && "hover:brightness-95 cursor-pointer",
                    )}
                  >
                    {e.title}
                  </span>
                ))}
                {dayEvents.length > MAX_CHIPS && (
                  <span className="text-[11px] text-gray-500 px-1">
                    +{dayEvents.length - MAX_CHIPS} mais
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-3 sm:px-4 py-3 border-t border-gray-200">
        <div className="text-sm font-medium mb-2">
          {capitalize(
            format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR }),
          )}
        </div>
        {selectedEvents.length === 0 ? (
          <div className="text-sm text-gray-500">Nada agendado neste dia.</div>
        ) : (
          <ul className="space-y-2">
            {selectedEvents.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  disabled={!onEventClick}
                  onClick={() => onEventClick?.(e.id)}
                  className={clsx(
                    "w-full text-left rounded-md px-3 py-2 text-sm",
                    TONE_CHIP[e.tone ?? "brand"],
                    onEventClick && "hover:brightness-95",
                  )}
                >
                  <div className="font-medium">{e.title}</div>
                  {e.subtitle && (
                    <div className="text-xs opacity-80 mt-0.5">
                      {e.subtitle}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
