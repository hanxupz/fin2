// Calendar.js
import React from "react";
import "./Calendar.css"; // Optional: For styling

const Calendar = ({ transactions, year, month }) => {
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getStartDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDayOfMonth(year, month);

  const transactionMap = {};
  transactions.forEach((t) => {
    const date = new Date(t.date);
    if (date.getMonth() === month && date.getFullYear() === year) {
      if (!transactionMap[date.getDate()]) transactionMap[date.getDate()] = [];
      transactionMap[date.getDate()].push(t.amount);
    }
  });

  const calendarDays = [];

  for (let i = 0; i < startDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const amounts = transactionMap[day] || [];
    calendarDays.push(
      <div key={day} className="calendar-day">
        <div className="day-number">{day.toString().padStart(2, "0")}</div>
        {amounts.map((amt, idx) => (
          <div key={idx} className={`amount ${amt < 0 ? "negative" : "positive"}`}>
            {amt.toFixed(2)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
      </div>
      <div className="calendar-grid">{calendarDays}</div>
    </div>
  );
};

export default Calendar;
