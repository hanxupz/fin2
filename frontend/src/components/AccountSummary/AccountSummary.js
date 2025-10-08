import React from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  useTheme, 
  Paper,
  Box,
  Avatar,
  alpha 
} from "@mui/material";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import { surfaceBoxSx } from '../../theme/primitives';

const AccountSummary = React.memo(({ transactions, controlDate, credits = [], paymentsByCredit = {} }) => {
  const theme = useTheme();

  // Memoize filtered transactions calculation
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(
      (t) =>
        t.control_date &&
        new Date(t.control_date).toDateString() === new Date(controlDate).toDateString()
    );
  }, [transactions, controlDate]);

  // Helper for translucent surface tone
  const softBg = (color) => `linear-gradient(135deg, ${alpha(color, 0.14)}, ${alpha(color, 0.04)})`;

  const accountConfigs = [
    { name: 'Corrente', icon: AccountBalanceWalletIcon, color: theme.palette.charts.category[0] },
    { name: 'Poupança', icon: SavingsIcon, color: theme.palette.charts.category[2] },
    { name: 'Investimento', icon: TrendingUpIcon, color: theme.palette.charts.category[4] },
    { name: 'All', icon: AccountBalanceIcon, color: theme.palette.charts.category[6] },
  ];

  const totals = { Corrente: 0, Poupança: 0, Investimento: 0, All: 0 };
  filteredTransactions.forEach((t) => {
    if (t.account === 'Corrente') totals.Corrente += t.amount;
    else if (t.account === 'Poupança Física' || t.account === 'Poupança Objectivo') totals.Poupança += t.amount;
    else if (t.account === 'Investimento') totals.Investimento += t.amount;
    totals.All += t.amount;
  });

  // Compute remaining credit (sum of (total_amount - paid) for credits with a total_amount)
  let remainingCredit = 0;
  credits.forEach(c => {
    if (c.total_amount !== null && c.total_amount !== undefined) {
      const payments = paymentsByCredit[c.id] || [];
      const paid = payments.reduce((s, p) => s + (p.value || 0), 0);
      const rem = c.total_amount - paid;
      remainingCredit += rem; // allow negative if overpaid
    }
  });

  const formatter = new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const netAfterCredit = totals.All - remainingCredit;

  const extendedConfigs = [
    ...accountConfigs,
    { name: 'Remaining Credit', icon: CreditScoreIcon, color: theme.palette.charts.category[8], isRemaining: true },
    { name: 'Net After Credit', icon: AccountBalanceIcon, color: theme.palette.charts.category[11] || theme.palette.success.main, isNetAfter: true }
  ];

  return (
    <Paper elevation={3} sx={(t)=>({ ...surfaceBoxSx(t), p: 3, background: t.palette.background.paper })}>
      <Grid container spacing={2}>
        {extendedConfigs.map((config) => {
          let amount;
            if (config.isRemaining) {
              amount = -remainingCredit; // show as negative liability
            } else if (config.isNetAfter) {
              amount = netAfterCredit;
            } else {
              amount = totals[config.name];
            }
          const positive = config.isRemaining ? false : amount >= 0;
          return (
            <Grid item xs={12} sm={6} md={4} key={config.name}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  borderColor: alpha(config.color, 0.3),
                  background: softBg(config.color),
                  backdropFilter: 'blur(4px)',
                  transition: 'transform .25s ease, box-shadow .25s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[6] },
                }}
              >
                <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Avatar
                      variant="rounded"
                      sx={{
                        bgcolor: alpha(config.color, 0.15),
                        color: config.color,
                        width: 48,
                        height: 48,
                        border: `1px solid ${alpha(config.color, 0.4)}`,
                        fontSize: 26,
                      }}
                    >
                      <config.icon fontSize="inherit" />
                    </Avatar>
                    <Box sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: alpha(config.color, 0.6)
                    }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, letterSpacing: '.5px', color: theme.palette.text.secondary }}>
                    {config.name}
                  </Typography>
                  <Typography variant="h6"
                    sx={{
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: .5,
                      color: config.isRemaining ? theme.palette.error.main : (positive ? theme.palette.success.main : theme.palette.error.main)
                    }}>
                    {formatter.format(amount)}€
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
});

AccountSummary.displayName = 'AccountSummary';

export default AccountSummary;
