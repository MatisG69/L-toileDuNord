import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "./button"

export interface CalendarProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  className?: string;
}

export function Calendar({ value, onChange, minDate, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    value ? new Date(value.getFullYear(), value.getMonth(), 1) : new Date()
  );

  const today = new Date();
  const selectedDate = value ? new Date(value) : null;
  const minDateObj = minDate || new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const minDateOnly = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate());
    return dateOnly < minDateOnly;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDateDisabled(newDate) && onChange) {
      onChange(newDate);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days: (number | null)[] = [];

  // Ajouter les jours vides du début
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Ajouter les jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className={cn("p-3 bg-white rounded-lg border border-gray-200 shadow-md max-w-xs", className)}>
      {/* Header avec navigation */}
      <div className="flex items-center justify-between mb-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="h-6 w-6 rounded-md hover:bg-[#604e42]/10"
        >
          <ChevronLeft className="h-3 w-3 text-[#604e42]" />
        </Button>
        
        <div className="text-center">
          <h3 className="text-sm font-bold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
        </div>
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="h-6 w-6 rounded-md hover:bg-[#604e42]/10"
        >
          <ChevronRight className="h-3 w-3 text-[#604e42]" />
        </Button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-semibold text-gray-600 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const disabled = isDateDisabled(date);
          const selected = isDateSelected(date);
          const isTodayDate = isToday(date);

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={disabled}
              className={cn(
                "aspect-square rounded-md text-xs font-semibold transition-all duration-200",
                "hover:scale-105 hover:shadow-sm",
                disabled && "opacity-30 cursor-not-allowed text-gray-400",
                !disabled && !selected && "hover:bg-[#604e42]/10 text-gray-700",
                selected && "bg-[#604e42] text-white shadow-md scale-105",
                isTodayDate && !selected && "ring-1 ring-[#604e42] ring-offset-1"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

