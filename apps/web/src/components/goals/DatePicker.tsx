import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(value ? new Date(value) : undefined);

  const handleDaySelect = (day: Date | undefined) => {
    setSelectedDay(day);
    if (day) {
      onChange(day.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
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
