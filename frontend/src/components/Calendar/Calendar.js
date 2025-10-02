import React from "react";
import { Paper, Typography, useTheme, Box } from "@mui/material";
import { surfaceBoxSx } from '../../theme/primitives';

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = ({ transactions, year, month }) => {
  const theme = useTheme();
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getStartDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDayOfMonth(year, month);

  const transactionMap = {};
  transactions.forEach((t) => {
    const date = new Date(t.date);
    if (date.getMonth() === month && date.getFullYear() === year) {
      transactionMap[date.getDate()] = (transactionMap[date.getDate()] || 0) + t.amount;
    }
  });

  const cells = [];
  for (let i = 0; i < startDay; i++) {
    cells.push(<Box key={`empty-${i}`} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const totalAmount = transactionMap[day] || 0;
    const dayDate = new Date(year, month, day);
    const isToday = dayDate.toDateString() === today.toDateString();
    const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
    cells.push(
      <Box
        key={day}
        sx={{
          position: 'relative',
          borderRadius: 2,
          p: 1,
          minHeight: 70,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: isToday ? theme.palette.calendar.todayBg : theme.palette.calendar.dayBg,
          color: isToday ? theme.palette.calendar.todayText : theme.palette.calendar.dayText,
          opacity: isWeekend ? 0.9 : 1,
          boxShadow: isToday ? `0 0 0 2px ${theme.palette.calendar.todayBg}` : 'none',
          transition: 'background-color .2s',
          '&:hover': { backgroundColor: isToday ? theme.palette.calendar.todayBg : theme.palette.action.hover },
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8 }}>
          {day.toString().padStart(2, '0')}
        </Typography>
        {totalAmount !== 0 && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: totalAmount > 0 ? theme.palette.success.main : theme.palette.error.main,
              textAlign: 'right'
            }}
          >
            {totalAmount.toFixed(2)}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={(t)=>({ ...surfaceBoxSx(t), p: 3, background: t.palette.background.paper })}>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 1, 
        mb: 1 }}>
        {weekdayNames.map(d => (
          <Box key={d} sx={{
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 600,
            p: 1,
            borderRadius: 1,
            backgroundColor: theme.palette.calendar.weekdayBg,
            color: theme.palette.calendar.weekdayText,
          }}>{d}</Box>
        ))}
      </Box>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 1 }}>
        {cells}
      </Box>
    </Paper>
  );
};

export default Calendar;
