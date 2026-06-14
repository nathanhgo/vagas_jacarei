"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import BusinessIcon from "@mui/icons-material/Business";

import { createCompany } from "@/lib/api";
import { formatCnpj, formatPhone } from "@/utils/formatters";
import { isValidCnpj, isValidPhone } from "@/utils/validators";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    background: "#FAFAFA",
    "& fieldset": { borderColor: "rgba(227, 207, 192, 0.6)" },
    "&:hover fieldset": { borderColor: "#8FBAE3" },
    "&.Mui-focused fieldset": { borderColor: "#4A85B6" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#4A85B6" },
};

export default function CompletarCadastroPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regCnpj, setRegCnpj] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  useEffect(() => {
    const pendingData = localStorage.getItem("pendingGoogleUser");
    if (!pendingData) {
      router.replace("/empresa");
      return;
    }

    try {
      const user = JSON.parse(pendingData);
      setRegName(user.name || "");
      setRegEmail(user.email || "");
    } catch {
      router.replace("/empresa");
    }

    setMounted(true);
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regCnpj.trim() || !regPassword.trim()) {
      setError("Preencha o CNPJ e a senha para continuar.");
      return;
    }

    if (!isValidCnpj(regCnpj)) {
      setError("CNPJ inválido. Use o formato 00.000.000/0000-00.");
      return;
    }

    if (regPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (regPhone && !isValidPhone(regPhone)) {
      setError("Telefone inválido. Exemplo: (12) 99999-9999.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: regName.trim(),
        email: regEmail.trim(),
        cnpj: regCnpj.trim(),
        password: regPassword.trim(),
        phone: regPhone.trim() || undefined,
      };

      const company = await createCompany(payload as any);
      localStorage.setItem("companyToken", regCnpj.trim());
      localStorage.setItem("companyData", JSON.stringify(company));
      localStorage.removeItem("pendingGoogleUser");
      router.push("/empresa/minhas-vagas");
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "";
      setError(errMsg || "Erro ao cadastrar empresa. CNPJ pode já existir.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #EEF4FB 0%, #FAF6F0 50%, #FFF8F4 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 4,
              background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
              boxShadow: "0 12px 36px rgba(74,133,182,0.2)",
              mb: 2,
            }}
          >
            <BusinessIcon sx={{ fontSize: 32, color: "#fff" }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              letterSpacing: -0.5,
              color: "#2A3543",
            }}
          >
            Falta Pouco!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Precisamos apenas de mais algumas informações para criar a sua conta empresarial.
          </Typography>
        </Box>

        <Card
          elevation={0}
          sx={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(227, 207, 192, 0.4)",
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            backdropFilter: "blur(8px)",
            boxShadow: "0 8px 40px rgba(74,133,182,0.06)",
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleRegister} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Nome da Empresa"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={inputSx}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="E-mail"
                  value={regEmail}
                  disabled
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={inputSx}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="CNPJ"
                  value={regCnpj}
                  onChange={(e) => setRegCnpj(formatCnpj(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={inputSx}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Telefone (opcional)"
                  value={regPhone}
                  onChange={(e) => setRegPhone(formatPhone(e.target.value))}
                  placeholder="(12) 99999-9999"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={inputSx}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Defina uma senha para logins futuros"
                  fullWidth
                  required
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={inputSx}
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              fullWidth
              sx={{
                background: "linear-gradient(135deg, #4A85B6 0%, #E0876A 100%)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                borderRadius: 3,
                py: 1.75,
                mt: 1,
                boxShadow: "0 8px 24px rgba(74, 133, 182, 0.25)",
                "&:hover": {
                  background: "linear-gradient(135deg, #3A75A6 0%, #D0765A 100%)",
                  boxShadow: "0 12px 32px rgba(74, 133, 182, 0.4)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Finalizar Cadastro"}
            </Button>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
