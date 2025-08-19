import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import api from "../api/client";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/api/auth/register", {
        email,
        password,
        role,
      });
      dispatch(loginSuccess({ token: data.token, role: data.role }));
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed");
    }
  };

  return (
    <Box maxWidth={420} mx="auto">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>
          Register
        </Typography>
        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <TextField
              select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="client">Client</MenuItem>
              <MenuItem value="vendor">Vendor</MenuItem>
            </TextField>
            {error && <Typography color="error">{error}</Typography>}
            <Button type="submit" variant="contained">
              Create Account
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
