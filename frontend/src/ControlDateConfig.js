import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Typography,
  TextField,
  Button
} from "@mui/material";

function ControlDateConfig({
  configYear, setConfigYear,
  configMonth, setConfigMonth,
  configControlDate,
  updateControlDateConfig
}) {
  const theme = useTheme();

  return (
    <div style={{ background: theme.palette.background.paper, color: theme.palette.text.primary, borderRadius: 8, padding: 16 }}>
      <Paper style={{ padding: "1rem" }}>
        <Typography variant="h6" gutterBottom>
          Control Date Configuration
        </Typography>

        <TextField
          fullWidth
          type="number"
          label="Year"
          value={configYear}
          onChange={(e) => setConfigYear(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          type="number"
          label="Month"
          value={configMonth}
          onChange={(e) => setConfigMonth(e.target.value)}
          margin="normal"
        />

        <Button
          variant="contained"
          color="secondary"
          fullWidth
          style={{ marginTop: "1rem" }}
          onClick={updateControlDateConfig}
        >
          Save Control Date
        </Button>

        {configControlDate && (
          <Typography style={{ marginTop: "1rem" }}>
            Current Control Date: {configControlDate}
          </Typography>
        )}
      </Paper>
    </div>
  );
}

export default ControlDateConfig;
