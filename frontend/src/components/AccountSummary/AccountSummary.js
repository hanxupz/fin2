import React from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  useTheme, 
  Paper,
  Avatar,
  alpha 
} from "@mui/material";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const AccountSummary = ({ transactions, controlDate }) => {
  const theme = useTheme();

  const filteredTransactions = transactions.filter(
    (t) =>
      t.control_date &&
      new Date(t.control_date).toDateString() ===
        new Date(controlDate).toDateString()
  );

  // Display names and configurations for cards
  const accountConfigs = [
    {
      name: "Corrente",
      icon: AccountBalanceWalletIcon,
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.primary.main, 0.4)})`
    },
    {
      name: "Poupança",
      icon: SavingsIcon,
      color: theme.palette.secondary.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.4)})`
    },
    {
      name: "Investimento",
      icon: TrendingUpIcon,
      color: theme.palette.success?.main || '#4caf50',
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.success?.main || '#4caf50', 0.8)}, ${alpha(theme.palette.success?.main || '#4caf50', 0.4)})`
    },
    {
      name: "All",
      icon: AccountBalanceIcon,
      color: theme.palette.info?.main || '#2196f3',
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.info?.main || '#2196f3', 0.8)}, ${alpha(theme.palette.info?.main || '#2196f3', 0.4)})`
    }
  ];

  // Totals initialization
  const totals = {
    Corrente: 0,
    Poupança: 0,
    Investimento: 0,
    All: 0,
  };

  filteredTransactions.forEach((t) => {
    if (t.account === "Corrente") {
      totals.Corrente += t.amount;
    } else if (t.account === "Poupança Física" || t.account === "Poupança Objectivo") {
      totals.Poupança += t.amount;
    } else if (t.account === "Investimento") {
      totals.Investimento += t.amount;
    }
    totals.All += t.amount;
  });

  return (
    <div style={{ background: theme.palette.background.paper, color: theme.palette.text.primary, borderRadius: 8, padding: 16 }}>
      <Paper elevation={3} sx={{ width: '100%', height: 400, p: 2 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 3, 
            fontWeight: 600,
            color: theme.palette.text.primary,
            textAlign: 'center',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Account Summary
        </Typography>
        
        <Grid container spacing={3}>
          {accountConfigs.map((config) => {
            const amount = totals[config.name];
            const isPositive = amount >= 0;
            
            return (
              <Grid item xs={12} sm={6} md={3} key={config.name}>
                <Card
                  sx={{
                    background: config.gradient,
                    borderRadius: 3,
                    boxShadow: theme.shadows[4],
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                    border: `1px solid ${alpha(config.color, 0.2)}`,
                    overflow: 'visible',
                    position: 'relative',
                  }}
                >
                  <CardContent sx={{ p: 3, pb: '24px !important' }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 2 
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: alpha('#fff', 0.9),
                          color: config.color,
                          width: 48,
                          height: 48,
                          boxShadow: theme.shadows[3],
                        }}
                      >
                        <config.icon sx={{ fontSize: 28 }} />
                      </Avatar>
                      
                      <Box
                        sx={{
                          backgroundColor: alpha('#fff', 0.15),
                          borderRadius: '50%',
                          width: 12,
                          height: 12,
                          opacity: 0.6,
                        }}
                      />
                    </Box>
                    
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        color: '#fff',
                        fontWeight: 500,
                        mb: 1,
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                    >
                      {config.name}
                    </Typography>
                    
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: '#fff',
                        fontWeight: 700,
                        textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      {isPositive ? '+' : ''}{amount.toFixed(2)}€
                    </Typography>
                    
                    {/* Decorative element */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: alpha('#fff', 0.1),
                        border: `2px solid ${alpha('#fff', 0.2)}`,
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </div>
  );
};

export default AccountSummary;
