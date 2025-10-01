import React from "react";
import { Paper, Typography, useTheme } from "@mui/material";
import "./Calendar.css"; // For styling

const Calendar = ({ transactions, year, month }) => {
  const theme = useTheme();
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getStartDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDayOfMonth(year, month);

  // Map transactions by day and sum amounts
  const transactionMap = {};
  transactions.forEach((t) => {
    const date = new Date(t.date);
    if (date.getMonth() === month && date.getFullYear() === year) {
      if (!transactionMap[date.getDate()]) transactionMap[date.getDate()] = 0;
      transactionMap[date.getDate()] += t.amount;
    }
  });

  const calendarDays = [];

  // Empty days before the first day of month
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const totalAmount = transactionMap[day] || 0;
    const dayDate = new Date(year, month, day);
    const hasTransactions = totalAmount !== 0;

    let dayClass = "calendar-day";
    
    // Weekends
    if (dayDate.getDay() === 0 || dayDate.getDay() === 6) {
      dayClass += " weekend";
    } else {
      dayClass += " weekday";
    }

    // Today
    if (
      dayDate.getDate() === today.getDate() &&
      dayDate.getMonth() === today.getMonth() &&
      dayDate.getFullYear() === today.getFullYear()
    ) {
      dayClass += " today";
    }

    // Has transactions
    if (hasTransactions) {
      dayClass += " has-transactions";
    }

    calendarDays.push(
      <div key={day} className={dayClass}>
        <div className="day-number">{day.toString().padStart(2, "0")}</div>
        {totalAmount !== 0 && (
          <div
            className={`amount ${totalAmount > 0 ? 'positive' : 'negative'}`}
            style={{ 
              color: totalAmount > 0 
                ? theme.palette.success.main 
                : theme.palette.error.main 
            }}
          >
            ${Math.abs(totalAmount).toFixed(2)}
          </div>
        )}
      </div>
    );
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div style={{ 
      background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`, 
      color: theme.palette.text.primary, 
      borderRadius: 16, 
      padding: 20,
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <Paper 
        elevation={0} 
        sx={{ 
          width: '100%', 
          height: '100%', 
          p: 3,
          background: 'transparent',
          boxShadow: 'none'
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            marginBottom: 3
          }}
        >
          📅 {monthNames[month]} {year}
        </Typography>
        
        <div className="calendar-container">
          <div className="calendar-header">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="calendar-weekday">{d}</div>
            ))}
          </div>
          <div className="calendar-grid">{calendarDays}</div>
        </div>
      </Paper>
    </div>
  );
};

export { Calendar as default };