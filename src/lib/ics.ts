export const generateAndDownloadICS = (
  leadName: string,
  phone: string,
  service: string,
  dateStr: string, // формат YYYY-MM-DD
  timeStr: string, // формат HH:mm
) => {
  const [year, month, day] = dateStr.split('-');
  const [hour, minute] = timeStr.split(':');

  // Формат DTSTART: YYYYMMDDTHHMMSS
  const startDate = `${year}${month}${day}T${hour}${minute}00`;

  // Добавляем 1 час для времени окончания процедуры
  const endDateObj = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour) + 1,
    Number(minute),
  );
  const endYear = endDateObj.getFullYear();
  const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0');
  const endDay = String(endDateObj.getDate()).padStart(2, '0');
  const endHour = String(endDateObj.getHours()).padStart(2, '0');
  const endMinute = String(endDateObj.getMinutes()).padStart(2, '0');

  const endDate = `${endYear}${endMonth}${endDay}T${endHour}${endMinute}00`;

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VelvetSkin CRM//UA
BEGIN:VEVENT
SUMMARY:Запис: ${leadName}
DESCRIPTION:Тел: ${phone}\\nПослуга: ${service}
DTSTART:${startDate}
DTEND:${endDate}
END:VEVENT
END:VCALENDAR`.replace(/\n/g, '\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `${leadName.replace(/\s+/g, '_')}_appointment.ics`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
