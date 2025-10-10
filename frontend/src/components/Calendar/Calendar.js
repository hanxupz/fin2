import React from "react";
import { Paper, Typography, useTheme, Box } from "@mui/material";
import { surfaceBoxSx } from '../../theme/primitives';

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = React.memo(({ transactions, year, month }) => {
  const theme = useTheme();
  
  // Memoize expensive calculations
  const calendarData = React.useMemo(() => {
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

    return { today, daysInMonth, startDay, transactionMap };
  }, [transactions, year, month]);

  const { today, daysInMonth, startDay, transactionMap } = calendarData;

  const cells = [];
  for (let i = 0; i < startDay; i++) {
    cells.push(
      <Box 
        key={`empty-${i}`} 
        sx={{
          aspectRatio: '1', // Force square cells for empty days
          backgroundColor: theme.palette.calendar.dayBg,
          opacity: 0.5,
          borderRadius: 2
        }}
      />
    );
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
          aspectRatio: '1', // Force square cells
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: isToday ? theme.palette.calendar.todayBg : theme.palette.calendar.dayBg,
          color: isToday ? theme.palette.calendar.todayText : theme.palette.calendar.dayText,
          opacity: isWeekend ? 0.9 : 1,
          boxShadow: isToday ? `0 0 0 2px ${theme.palette.calendar.todayBg}` : 'none',
          transition: 'none', // Disable transitions to prevent layout shifts
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 600, 
            opacity: 0.8,
            height: '20px', // Fixed height for day number
            display: 'block'
          }}
        >
          {day.toString().padStart(2, '0')}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: totalAmount > 0 ? theme.palette.success.main : theme.palette.error.main,
            textAlign: 'right',
            height: '20px', // Fixed height for amount
            visibility: totalAmount !== 0 ? 'visible' : 'hidden', // Keep space even when no amount
            display: 'block'
          }}
        >
          {totalAmount !== 0 ? totalAmount.toFixed(2) : '0.00'}
        </Typography>
      </Box>
    );
  }

  // Calculate aspect ratio for calendar cells (1:1)
  const cellAspectRatio = '100%';

  return (
    <Paper 
      elevation={3} 
      sx={(t)=>({ 
        ...surfaceBoxSx(t), 
        p: 3, 
        background: t.palette.background.paper,
        minHeight: '500px', // Fixed minimum height
        display: 'flex',
        flexDirection: 'column'
      })}
    >
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: 1, 
        mb: 1,
      }}>
        {weekdayNames.map(d => (
          <Box 
            key={d} 
            sx={{
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              p: 1,
              height: 32, // Fixed height for weekday headers
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              backgroundColor: theme.palette.calendar.weekdayBg,
              color: theme.palette.calendar.weekdayText,
            }}
          >
            {d}
          </Box>
        ))}
      </Box>
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: 1,
          flex: 1, // Take remaining space
        }}
      >
        {cells}
      </Box>
    </Paper>
  );
});

Calendar.displayName = 'Calendar';

export default Calendar;
