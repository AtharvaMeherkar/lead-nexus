import {
  Box,
  Button,
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      dispatch(loginSuccess({ token: data.token, role: data.role }));
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed");
    }
  };

  return (
    <Box maxWidth={420} mx="auto">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>
          Login
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
            {error && <Typography color="error">{error}</Typography>}
            <Button type="submit" variant="contained">
              Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
