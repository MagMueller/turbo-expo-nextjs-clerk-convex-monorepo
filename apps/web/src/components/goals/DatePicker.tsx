import React, { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, onClose }) => {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(value ? new Date(value) : undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleDaySelect = (day: Date | undefined) => {
    setSelectedDay(day);
    if (day) {
      onChange(day.toISOString().split('T')[0]);
    }
  };

  return (
    <div ref={wrapperRef} className="bg-white p-4 rounded-lg shadow-lg">
      <DayPicker
        mode="single"
        selected={selectedDay}
        onSelect={handleDaySelect}
        footer={selectedDay && <p>You selected {selectedDay.toDateString()}</p>}
      />
    </div>
  );
};

export default DatePicker;
