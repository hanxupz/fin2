import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Fab,
  Dialog,
  DialogContent,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css';
import { fabSx } from './theme/primitives';

// Refactored imports
import { AppProvider, useAppContext } from './context/AppContext';
import { LayoutProvider, useLayout } from './context/LayoutContext';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { CATEGORIES, ACCOUNTS, DEFAULT_CATEGORY, DEFAULT_ACCOUNT } from './constants';
import { getControlDateAccountBarData } from './utils/charts';
import { getDesignTokens } from './utils/theme';
import apiService from './services/api';

// Component imports
import AccountSummary from "./components/AccountSummary/AccountSummary";
import TransactionForm from "./components/TransactionForm/TransactionForm";
import ControlDateConfig from "./components/ControlDateConfig/ControlDateConfig";
import Filters from "./components/Filters/Filters";
import TransactionList from "./components/TransactionList/TransactionList";
import Calendar from "./components/Calendar/Calendar";
import TransactionsByTypeGraph from "./components/TransactionsByTypeGraph/TransactionsByTypeGraph";
import TransactionsByTypeGraphAll from "./components/TransactionsByTypeGraphAll/TransactionsByTypeGraphAll";
import AccountSumChart from "./components/AccountSumChart/AccountSumChart";
import ControlDateAccountBarChart from "./components/ControlDateAccountBarChart/ControlDateAccountBarChart";
import Login from "./components/Login";
import AnimatedBackground from './components/AnimatedBackground';
import { Box as MuiBox } from '@mui/material';
import CreditForm from './components/Credits/CreditForm';
import CreditPaymentForm from './components/Credits/CreditPaymentForm';
import CreditsAccordion from './components/Credits/CreditsAccordion';
import { BudgetPreferences } from './components/BudgetPreferences';
import BudgetPreferenceForm from './components/BudgetPreferences/BudgetPreferenceForm';
import { LayoutManager } from './components/LayoutManager';
import { LayoutSection, LayoutComponent } from './components/LayoutManager/LayoutComponents';
import { useCredits } from './hooks/useCredits';
import { useBudgetPreferences } from './hooks/useBudgetPreferences';
import { usePerformanceOptimizations } from './hooks/usePerformanceOptimizations';

// Helper: format a Date as YYYY-MM-DD in LOCAL time (avoids UTC shift when using toISOString)
const formatLocalDate = (d) => {
  if (!d) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AppContent = () => {
  const { state: appState, actions: appActions } = useAppContext();
  const { layout, updateLayout, getVisibleComponents, isComponentVisible } = useLayout();
  const { token, isAuthenticated, login, logout } = useAuth();
  const { transactions, createTransaction, updateTransaction, deleteTransaction } = useTransactions(token);
  const { credits, paymentsByCredit, fetchPayments, createCredit, updateCredit, deleteCredit, createPayment, updatePayment, deletePayment } = useCredits(token);
  const { budgetPreferences, budgetSummary, createBudgetPreference, updateBudgetPreference, deleteBudgetPreference } = useBudgetPreferences(token);

  // Local state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(null);
  const [controlDate, setControlDate] = useState(null);
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [account, setAccount] = useState(DEFAULT_ACCOUNT);
  const [editingId, setEditingId] = useState(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState(null);
  const [filterDateTo, setFilterDateTo] = useState(null);
  const [filterControlDate, setFilterControlDate] = useState(null);

  // Config
  const [configYear, setConfigYear] = useState("");
  const [configMonth, setConfigMonth] = useState("");
  const [configControlDate, setConfigControlDate] = useState("");

  // Dialog states
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [controlDateDialogOpen, setControlDateDialogOpen] = useState(false);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [budgetPreferenceDialogOpen, setBudgetPreferenceDialogOpen] = useState(false);
  const [layoutManagerOpen, setLayoutManagerOpen] = useState(false);

  // Credit form state
  const [creditName, setCreditName] = useState("");
  const [creditMonthlyValue, setCreditMonthlyValue] = useState("");
  const [creditPaymentDay, setCreditPaymentDay] = useState("");
  const [creditTotalAmount, setCreditTotalAmount] = useState("");
  const [editingCreditId, setEditingCreditId] = useState(null);

  // Payment form state
  const [paymentValue, setPaymentValue] = useState("");
  const [paymentDate, setPaymentDate] = useState(null);
  const [paymentType, setPaymentType] = useState("scheduled");
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [activePaymentCreditId, setActivePaymentCreditId] = useState(null);

  // Budget preference form state
  const [budgetPreferenceName, setBudgetPreferenceName] = useState("");
  const [budgetPreferencePercentage, setBudgetPreferencePercentage] = useState("");
  const [budgetPreferenceCategories, setBudgetPreferenceCategories] = useState([]);
  const [editingBudgetPreferenceId, setEditingBudgetPreferenceId] = useState(null);

  // Theme and responsive
  const theme = React.useMemo(() => createTheme(getDesignTokens(appState.theme)), [appState.theme]);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Fetch control date config
  const fetchControlDateConfig = async () => {
    try {
      const data = await apiService.getControlDate(token);
      setConfigYear(data.year.toString());
      setConfigMonth(data.month.toString());
      setConfigControlDate(data.control_date);
    } catch (err) {
      console.error("Failed to fetch control date config:", err);
    }
  };

  // Submit transaction
  const submitTransaction = async () => {
    try {
      const transactionData = {
        description,
        amount: parseFloat(amount),
        date: optimizedFormatLocalDate(date),
        control_date: optimizedFormatLocalDate(controlDate),
        category,
        account
      };

      if (editingId) {
        await updateTransaction(editingId, transactionData);
        setEditingId(null);
      } else {
        await createTransaction(transactionData);
      }

      // Reset form
      setDescription("");
      setAmount("");
      setDate(null);
      setControlDate(null);
      setCategory(DEFAULT_CATEGORY);
      setAccount(DEFAULT_ACCOUNT);
      setTransactionDialogOpen(false);
    } catch (err) {
      console.error("Failed to submit transaction:", err);
    }
  };

  // Submit control date config
  const submitControlDateConfig = async () => {
    try {
      const parsedYear = parseInt(configYear, 10);
      const parsedMonth = parseInt(configMonth, 10);

      // Basic front-end validation
      if (isNaN(parsedYear) || parsedYear < 1970 || parsedYear > 2100) {
        console.error("Invalid year supplied");
        return;
      }
      if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        console.error("Invalid month supplied");
        return;
      }

      // Do NOT send control_date so backend validator sets default (1st of month) each time
      const config = { year: parsedYear, month: parsedMonth };

      await apiService.setControlDate(config, token);
      setControlDateDialogOpen(false);
      fetchControlDateConfig();
    } catch (err) {
      console.error("Failed to set control date:", err);
    }
  };

  // Edit transaction
  const editTransaction = (t) => {
    setEditingId(t.id);
    setDescription(t.description);
    setAmount(t.amount);
    setDate(t.date ? new Date(t.date) : null);
    setControlDate(t.control_date ? new Date(t.control_date) : null);
    setCategory(t.category || DEFAULT_CATEGORY);
    setAccount(t.account || DEFAULT_ACCOUNT);
    setTransactionDialogOpen(true);
  };

  // Clone transaction
  const cloneTransaction = (t) => {
    setEditingId(null); // No ID = new transaction
    setDescription(t.description);
    setAmount(t.amount);
    setDate(t.date ? new Date(t.date) : null);
    setControlDate(t.control_date ? new Date(t.control_date) : null);
    setCategory(t.category || DEFAULT_CATEGORY);
    setAccount(t.account || DEFAULT_ACCOUNT);
    setTransactionDialogOpen(true);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Handle theme toggle
  const handleToggleTheme = () => {
    appActions.setTheme(appState.theme === 'dark' ? 'light' : 'dark');
  };

  // Credit handlers
  const openCreateCredit = () => {
    setEditingCreditId(null);
    setCreditName("");
    setCreditMonthlyValue("");
    setCreditPaymentDay("");
    setCreditTotalAmount("");
    setCreditDialogOpen(true);
  };

  const submitCredit = async () => {
    const payload = {
      name: creditName,
      monthly_value: parseFloat(creditMonthlyValue),
      payment_day: parseInt(creditPaymentDay, 10),
      total_amount: creditTotalAmount ? parseFloat(creditTotalAmount) : null
    };
    try {
      if (editingCreditId) {
        await updateCredit(editingCreditId, payload);
      } else {
        await createCredit(payload);
      }
      setCreditDialogOpen(false);
    } catch (e) { console.error(e); }
  };

  const editCredit = (credit) => {
    setEditingCreditId(credit.id);
    setCreditName(credit.name);
    setCreditMonthlyValue(credit.monthly_value);
    setCreditPaymentDay(credit.payment_day);
    setCreditTotalAmount(credit.total_amount || "");
    setCreditDialogOpen(true);
  };

  const removeCredit = async (id) => {
    try { await deleteCredit(id); } catch (e) { console.error(e);} }

  // Payment handlers
  const addPayment = (credit) => {
    setActivePaymentCreditId(credit.id);
    setEditingPaymentId(null);
    setPaymentValue(credit.monthly_value); // default to monthly value
    setPaymentDate(new Date());
    setPaymentType('scheduled');
    setPaymentDialogOpen(true);
  };

  const editPayment = (credit, payment) => {
    setActivePaymentCreditId(credit.id);
    setEditingPaymentId(payment.id);
    setPaymentValue(payment.value);
    setPaymentDate(new Date(payment.date));
    setPaymentType(payment.type);
    setPaymentDialogOpen(true);
  };

  const submitPayment = async () => {
    const payloadBase = {
      value: parseFloat(paymentValue),
      date: paymentDate ? paymentDate.toISOString().split('T')[0] : null,
      type: paymentType
    };
    try {
      if (editingPaymentId) {
        await updatePayment(editingPaymentId, payloadBase);
      } else {
        await createPayment({ ...payloadBase, credit_id: activePaymentCreditId });
      }
      setPaymentDialogOpen(false);
    } catch (e) { console.error(e); }
  };

  const removePayment = async (paymentId, creditId) => {
    try { await deletePayment(paymentId, creditId); } catch (e) { console.error(e);} };

  // Budget preference handlers
  const openCreateBudgetPreference = () => {
    setEditingBudgetPreferenceId(null);
    setBudgetPreferenceName("");
    setBudgetPreferencePercentage("");
    setBudgetPreferenceCategories([]);
    setBudgetPreferenceDialogOpen(true);
  };

  const submitBudgetPreference = async (formData) => {
    // The form passes the data directly, so use that instead of state variables
    const payload = formData || {
      name: budgetPreferenceName.trim(),
      percentage: parseFloat(budgetPreferencePercentage),
      categories: budgetPreferenceCategories
    };

    // Validation
    if (!payload.name || !payload.name.trim()) {
      console.error('Budget preference name is required');
      alert('Please enter a budget preference name');
      return;
    }

    if (isNaN(payload.percentage) || payload.percentage <= 0 || payload.percentage > 100) {
      console.error('Invalid percentage:', payload.percentage);
      alert('Please enter a valid percentage between 0.01 and 100');
      return;
    }

    if (!payload.categories || payload.categories.length === 0) {
      console.error('At least one category is required');
      alert('Please select at least one category');
      return;
    }

    try {
      if (editingBudgetPreferenceId) {
        await updateBudgetPreference(editingBudgetPreferenceId, payload);
      } else {
        await createBudgetPreference(payload);
      }
      setBudgetPreferenceDialogOpen(false);
      // Reset form state
      setBudgetPreferenceName("");
      setBudgetPreferencePercentage("");
      setBudgetPreferenceCategories([]);
      setEditingBudgetPreferenceId(null);
    } catch (e) { 
      console.error('Budget preference submission error:', e);
      if (e.response?.data?.detail) {
        console.error('Server error details:', e.response.data.detail);
        alert(`Error: ${JSON.stringify(e.response.data.detail)}`);
      }
    }
  };

  const editBudgetPreference = (budgetPreference) => {
    setEditingBudgetPreferenceId(budgetPreference.id);
    setBudgetPreferenceName(budgetPreference.name);
    setBudgetPreferencePercentage(budgetPreference.percentage.toString());
    setBudgetPreferenceCategories(budgetPreference.categories || []);
    setBudgetPreferenceDialogOpen(true);
  };

  const removeBudgetPreference = async (id) => {
    try {
      await deleteBudgetPreference(id);
    } catch (e) {
      console.error('Error deleting budget preference:', e);
      throw e; // Re-throw so the component can handle the error
    }
  };

  // Get all assigned categories for validation
  const assignedCategories = React.useMemo(() => {
    const allCategories = [];
    budgetPreferences.forEach(bp => {
      if (bp.categories) {
        allCategories.push(...bp.categories);
      }
    });
    return allCategories;
  }, [budgetPreferences]);

  // Load config on mount
  useEffect(() => {
    if (token) {
      fetchControlDateConfig();
    }
  }, [token]);

  // Use performance optimizations hook for expensive calculations
  const {
    filteredTransactions,
    allTransactionsFiltered,
    transactionStats,
    formatLocalDate: optimizedFormatLocalDate
  } = usePerformanceOptimizations({
    transactions,
    filterCategory,
    filterAccount,
    filterDateFrom,
    filterDateTo,
    filterControlDate,
    configControlDate,
  });

  // Generate category colors for current theme
  const categoryColors = React.useMemo(() => {
    const palette = theme.palette.charts.category;
    return CATEGORIES.reduce((acc, cat, idx) => ({ ...acc, [cat]: palette[idx % palette.length] }), {});
  }, [theme]);

  // Helper function to render components based on their ID
  const renderComponent = (item, index) => {
    switch (item.componentId) {
      case 'accountSummary':
        return (
          <LayoutComponent
            key={item.componentId}
            componentId="accountSummary"
            isVisible={item.isVisible}
            title="Account Overview"
            description="Your financial snapshot for the current control period"
            requiresControlDate={true}
            controlDate={configControlDate}
          >
            <AccountSummary 
              transactions={transactions} 
              controlDate={configControlDate ? new Date(configControlDate) : null} 
              credits={credits}
              paymentsByCredit={paymentsByCredit}
            />
          </LayoutComponent>
        );
      case 'calendar':
        return (
          <LayoutComponent
            key={item.componentId}
            componentId="calendar"
            isVisible={item.isVisible}
            title="Transactions Calendar"
            description="Visual representation of your spending patterns and trends"
          >
            <Calendar
              transactions={filteredTransactions}
              year={new Date(filterControlDate ? filterControlDate : configControlDate).getFullYear()}
              month={new Date(filterControlDate ? filterControlDate : configControlDate).getMonth()}
            />
          </LayoutComponent>
        );
      case 'budgetPreferences':
        return (
          <LayoutComponent
            key={item.componentId}
            componentId="budgetPreferences"
            isVisible={item.isVisible}
            title="Budget Preferences"
            description="Allocate your spending across different categories to create a comprehensive budget plan"
            showFab={true}
            onFabClick={openCreateBudgetPreference}
          >
            <BudgetPreferences 
              budgetPreferences={budgetPreferences}
              budgetSummary={budgetSummary}
              loading={false}
              error={null}
              onEdit={editBudgetPreference}
              onDelete={removeBudgetPreference}
              transactions={transactions}
              controlDate={configControlDate}
            />
          </LayoutComponent>
        );
      case 'financialInsights':
        return (
          <LayoutComponent
            key={item.componentId}
            componentId="financialInsights"
            isVisible={item.isVisible}
            title="Financial Insights"
            description="Visual representation of your spending patterns and trends"
            requiresControlDate={true}
            controlDate={configControlDate}
          >
            <Box sx={{ mb: 2 }}>
              <TransactionsByTypeGraph
                transactions={filteredTransactions}
                categoryColors={categoryColors}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <TransactionsByTypeGraphAll
                transactions={filteredTransactions}
                categoryColors={categoryColors}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <AccountSumChart 
                transactions={filteredTransactions} 
                controlDate={configControlDate ? new Date(configControlDate) : null} 
              />
            </Box>
            {getControlDateAccountBarData(allTransactionsFiltered) && (
              <Box>
                <ControlDateAccountBarChart data={getControlDateAccountBarData(allTransactionsFiltered)} />
              </Box>
            )}
          </LayoutComponent>
        );
      case 'credits':
        return (
          <LayoutComponent
            key={item.componentId}
            componentId="credits"
            isVisible={item.isVisible}
            title="Credits"
            description="Manage your credits and track payments"
            showFab={true}
            onFabClick={openCreateCredit}
          >
            <CreditsAccordion
              credits={credits}
              paymentsByCredit={paymentsByCredit}
              onEditCredit={editCredit}
              onDeleteCredit={removeCredit}
              onAddPayment={addPayment}
              onEditPayment={editPayment}
              onDeletePayment={removePayment}
            />
          </LayoutComponent>
        );
      case 'filters':
        return (
          <LayoutComponent
            key={item.componentId}
            componentId="filters"
            isVisible={item.isVisible}
            title="Refine Your View"
            description="Filter transactions by category, account, or date range"
          >
            <Filters
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              filterAccount={filterAccount}
              setFilterAccount={setFilterAccount}
              filterDateFrom={filterDateFrom}
              setFilterDateFrom={setFilterDateFrom}
              filterDateTo={filterDateTo}
              setFilterDateTo={setFilterDateTo}
              filterControlDate={filterControlDate}
              setFilterControlDate={setFilterControlDate}
              categories={CATEGORIES}
              accounts={ACCOUNTS}
            />
          </LayoutComponent>
        );
      case 'transactionList':
        return (
          <LayoutComponent
            key={item.componentId}
            componentId="transactionList"
            isVisible={item.isVisible}
            title="Transaction History"
            description="Complete record of activity"
            showFab={true}
            onFabClick={() => setTransactionDialogOpen(true)}
          >
            <TransactionList
              filteredTransactions={filteredTransactions}
              editTransaction={editTransaction}
              cloneTransaction={cloneTransaction}
              deleteTransaction={deleteTransaction}
            />
          </LayoutComponent>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AnimatedBackground />
        <MuiBox component="main" sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, pt: { xs: 6, md: 8 }, pb: 6 }}>
          {/* Main Section */}
          <LayoutSection
            sectionId="main"
            components={getVisibleComponents('main')}
            sx={{ mb: 3 }}
          >
            {getVisibleComponents('main').map((item, index) => 
              renderComponent(item, index)
            )}
          </LayoutSection>

          {/* Two-column grid: Left (2/3) and Right (1/3) */}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Left Panel */}
            <Grid item xs={12} md={8}>
              <LayoutSection
                sectionId="left"
                components={getVisibleComponents('left')}
              >
                {getVisibleComponents('left').map((item, index) => 
                  renderComponent(item, index)
                )}
              </LayoutSection>
            </Grid>
            
            {/* Right Panel */}
            <Grid item xs={12} md={4}>
              <LayoutSection
                sectionId="right"
                components={getVisibleComponents('right')}
              >
                {getVisibleComponents('right').map((item, index) => 
                  renderComponent(item, index)
                )}
              </LayoutSection>
            </Grid>
          </Grid>

          {/* Floating Action Buttons */}
          <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Fab aria-label="add transaction" onClick={() => setTransactionDialogOpen(true)} sx={fabSx(theme)} size="medium">
              <AddIcon />
            </Fab>
            <Fab aria-label="configure control date" onClick={() => setControlDateDialogOpen(true)} sx={fabSx(theme)} size="medium">
              <SettingsIcon />
            </Fab>
            <Fab aria-label="manage layout" onClick={() => setLayoutManagerOpen(true)} sx={fabSx(theme)} size="medium">
              <ViewQuiltIcon />
            </Fab>
            <Fab aria-label="toggle theme" onClick={handleToggleTheme} sx={fabSx(theme)} size="medium">
              {appState.theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </Fab>
            <Fab aria-label="logout" onClick={handleLogout} size="medium" sx={(t) => ({ ...fabSx(t), background: t.palette.gradients.danger })}>
              <span style={{ fontSize: '1.2rem' }}>→</span>
            </Fab>
          </Box>

          {/* Transaction Dialog */}
          <Dialog
            open={transactionDialogOpen}
            onClose={() => { setTransactionDialogOpen(false); setEditingId(null); }}
            fullWidth
            maxWidth="sm"
          >
            <DialogContent sx={{ pb: 3 }}>
              <TransactionForm
                description={description}
                setDescription={setDescription}
                amount={amount}
                setAmount={setAmount}
                date={date}
                setDate={setDate}
                controlDate={controlDate}
                setControlDate={setControlDate}
                category={category}
                setCategory={setCategory}
                account={account}
                setAccount={setAccount}
                addOrUpdateTransaction={submitTransaction}
                editingId={editingId}
                categories={CATEGORIES}
                accounts={ACCOUNTS}
                configControlDate={configControlDate}
              />
            </DialogContent>
          </Dialog>

          {/* Control Date Config Dialog */}
          <Dialog
            open={controlDateDialogOpen}
            onClose={() => setControlDateDialogOpen(false)}
            fullWidth
            maxWidth="xs"
          >
            <DialogContent sx={{ pb: 3 }}>
              <ControlDateConfig
                configYear={configYear}
                setConfigYear={setConfigYear}
                configMonth={configMonth}
                setConfigMonth={setConfigMonth}
                configControlDate={configControlDate}
                updateControlDateConfig={submitControlDateConfig}
              />
            </DialogContent>
          </Dialog>

          {/* Credit Dialog */}
          <Dialog
            open={creditDialogOpen}
            onClose={() => setCreditDialogOpen(false)}
            fullWidth maxWidth="sm"
          >
            <DialogContent sx={{ pb:3 }}>
              <CreditForm
                name={creditName}
                setName={setCreditName}
                monthlyValue={creditMonthlyValue}
                setMonthlyValue={setCreditMonthlyValue}
                paymentDay={creditPaymentDay}
                setPaymentDay={setCreditPaymentDay}
                totalAmount={creditTotalAmount}
                setTotalAmount={setCreditTotalAmount}
                onSubmit={submitCredit}
                editingId={editingCreditId}
              />
            </DialogContent>
          </Dialog>

          {/* Credit Payment Dialog */}
          <Dialog
            open={paymentDialogOpen}
            onClose={() => setPaymentDialogOpen(false)}
            fullWidth maxWidth="xs"
          >
            <DialogContent sx={{ pb:3 }}>
              <CreditPaymentForm
                value={paymentValue}
                setValue={setPaymentValue}
                date={paymentDate}
                setDate={setPaymentDate}
                type={paymentType}
                setType={setPaymentType}
                onSubmit={submitPayment}
                editingPaymentId={editingPaymentId}
              />
            </DialogContent>
          </Dialog>

          {/* Budget Preference Dialog */}
          <Dialog
            open={budgetPreferenceDialogOpen}
            onClose={() => setBudgetPreferenceDialogOpen(false)}
            fullWidth maxWidth="sm"
          >
            <DialogContent sx={{ pb:3 }}>
              <BudgetPreferenceForm
                name={budgetPreferenceName}
                setName={setBudgetPreferenceName}
                percentage={budgetPreferencePercentage}
                setPercentage={setBudgetPreferencePercentage}
                categories={budgetPreferenceCategories}
                setCategories={setBudgetPreferenceCategories}
                onSubmit={submitBudgetPreference}
                onReset={() => {
                  setBudgetPreferenceName("");
                  setBudgetPreferencePercentage("");
                  setBudgetPreferenceCategories([]);
                }}
                editingId={editingBudgetPreferenceId}
                budgetSummary={budgetSummary}
                assignedCategories={assignedCategories}
                transactions={transactions}
                controlDate={configControlDate}
              />
            </DialogContent>
          </Dialog>

          {/* Layout Manager Dialog */}
          <LayoutManager
            open={layoutManagerOpen}
            onClose={() => setLayoutManagerOpen(false)}
            layout={layout}
            onUpdateLayout={updateLayout}
          />
        </MuiBox>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <AppProvider>
      <LayoutProvider>
        <AppContent />
      </LayoutProvider>
    </AppProvider>
  );
};

export default App;