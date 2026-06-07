"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";

import LocationCityIcon from "@mui/icons-material/LocationCity";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BusinessIcon from "@mui/icons-material/Business";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

import { createCompany, loginCompany } from "@/lib/api";
import { formatCnpj, formatPhone, formatCep } from "@/utils/formatters";
import { isValidCnpj, isValidPhone, isValidCep } from "@/utils/validators";

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

export default function EmpresaLoginPage() {
  const router = useRouter();

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loginCnpj, setLoginCnpj] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regCnpj, setRegCnpj] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [regComplement, setRegComplement] = useState("");
  const [regCep, setRegCep] = useState("");
  const [regNeighborhood, setRegNeighborhood] = useState("");
  const [regAlternativeEmail, setRegAlternativeEmail] = useState("");
  const [regDescription, setRegDescription] = useState("");

  useEffect(() => {
    if (localStorage.getItem("companyToken")) {
      router.replace("/empresa/minhas-vagas");
      return;
    }
    setMounted(true);
  }, [router]);


  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newCep = formatCep(e.target.value);
    setRegCep(newCep);
    if (newCep.length === 9) {
      const cleanCep = newCep.replace(/\D/g, "");
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          if (data.logradouro) setRegAddress(data.logradouro);
          if (data.bairro) setRegNeighborhood(data.bairro);
        }
      } catch (err) {
        console.error("Erro ao buscar CEP", err);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginCnpj.trim() || !loginEmail.trim() || !loginPassword.trim()) {
      setError("Preencha o CNPJ, E-mail e Senha.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginCompany(loginCnpj.trim(), loginEmail.trim(), loginPassword.trim());
      localStorage.setItem("companyToken", data.token);
      localStorage.setItem("companyData", JSON.stringify(data.company));
      router.push("/empresa/minhas-vagas");
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "";
      setError(errMsg || "CNPJ, E-mail ou Senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regCnpj.trim() || !regPassword.trim()) {
      setError("Preencha o nome da empresa, e-mail, CNPJ e senha.");
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

    if (regPassword !== regConfirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    if (regPhone && !isValidPhone(regPhone)) {
      setError("Telefone inválido. Exemplo: (12) 99999-9999.");
      return;
    }

    if (regCep && !isValidCep(regCep)) {
      setError("CEP inválido. Exemplo: 12345-678.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: regName.trim(),
        phone: regPhone.trim() || undefined,
        email: regEmail.trim(),
        cnpj: regCnpj.trim(),
        password: regPassword.trim(),
        address: regAddress.trim() || undefined,
        number: regNumber.trim() || undefined,
        complement: regComplement.trim() || undefined,
        cep: regCep.trim() || undefined,
        neighborhood: regNeighborhood.trim() || undefined,
        alternative_email: regAlternativeEmail.trim() || undefined,
        description: regDescription.trim() || undefined,
      };

      const company = await createCompany(payload);
      localStorage.setItem("companyToken", regCnpj.trim());
      localStorage.setItem("companyData", JSON.stringify(company));
      router.push("/empresa/minhas-vagas");
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "";
      setError(errMsg || "Erro ao cadastrar empresa. CNPJ ou e-mail pode já existir.");
    } finally {
      setLoading(false);
    }
  };

  const gradientBtn = {
    background: "linear-gradient(135deg, #4A85B6 0%, #E0876A 100%)",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "1rem",
    textTransform: "none" as const,
    borderRadius: 3,
    py: 1.75,
    letterSpacing: 0.3,
    boxShadow: "0 8px 24px rgba(74, 133, 182, 0.25)",
    transition: "all 0.25s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #3A75A6 0%, #D0765A 100%)",
      boxShadow: "0 12px 32px rgba(74, 133, 182, 0.4)",
      transform: "translateY(-1px)",
    },
  };

  if (!mounted) {
    return null;
  }

  return (

    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(160deg, #EEF4FB 0%, #FAF6F0 50%, #FFF8F4 100%)",
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          borderBottom: "1px solid rgba(227, 207, 192, 0.4)",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(16px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          py: 1.5,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2 }}
        >
          <IconButton
            onClick={() => router.push("/vagas")}
            sx={{
              border: "1px solid rgba(227, 207, 192, 0.6)",
              borderRadius: 2.5,
              background: "#FFFFFF",
              color: "text.primary",
              "&:hover": { background: "#FAF6F0", borderColor: "#4A85B6" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
              }}
            >
              <BusinessIcon sx={{ fontSize: 18, color: "#fff" }} />
            </Avatar>
            <Typography variant="body1" sx={{ fontWeight: 800, color: "#2A3543", letterSpacing: -0.2 }}>
              Portal da Empresa
            </Typography>
          </Box>

          <Box sx={{ width: 40 }} />
        </Container>
      </Box>

      {/* Hero section */}
      <Box
        sx={{
          pt: { xs: 5, md: 7 },
          pb: { xs: 2, md: 3 },
          textAlign: "center",
          px: 2,
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: 4,
            background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
            boxShadow: "0 12px 36px rgba(74,133,182,0.2)",
            mb: 3,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 34, color: "#fff" }} />
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            letterSpacing: -1,
            fontSize: { xs: "1.9rem", md: "2.6rem" },
            background: "linear-gradient(135deg, #2A3543 30%, #4A85B6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          {authMode === "login" ? "Acesse sua conta" : "Cadastre sua empresa"}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480, mx: "auto" }}>
          {authMode === "login"
            ? "Entre com CNPJ, e-mail e senha para gerenciar suas vagas no PAT Jacareí."
            : "Registre sua empresa gratuitamente e publique vagas para candidatos da região."}
        </Typography>
      </Box>

      {/* Form card */}
      <Container maxWidth="sm" sx={{ flex: 1, py: 3, px: 2 }}>

        {/* Tab switcher */}
        <Box
          sx={{
            display: "flex",
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(227, 207, 192, 0.5)",
            borderRadius: 3,
            p: 0.5,
            mb: 3,
          }}
        >
          {(["login", "register"] as const).map((mode) => (
            <Button
              key={mode}
              onClick={() => { setAuthMode(mode); setError(null); }}
              fullWidth
              sx={{
                borderRadius: 2.5,
                py: 1.2,
                fontWeight: authMode === mode ? 800 : 500,
                fontSize: "0.95rem",
                textTransform: "none",
                transition: "all 0.2s ease",
                background: authMode === mode
                  ? "linear-gradient(135deg, #4A85B6 0%, #E0876A 100%)"
                  : "transparent",
                color: authMode === mode ? "#fff" : "text.secondary",
                boxShadow: authMode === mode ? "0 4px 12px rgba(74,133,182,0.25)" : "none",
                "&:hover": {
                  background: authMode === mode
                    ? "linear-gradient(135deg, #4A85B6 0%, #E0876A 100%)"
                    : "rgba(227,207,192,0.2)",
                },
              }}
            >
              {mode === "login" ? "Entrar" : "Criar Conta"}
            </Button>
          ))}
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
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2.5,
                border: "1px solid rgba(250,82,82,0.2)",
                background: "rgba(250,82,82,0.05)",
              }}
            >
              {error}
            </Alert>
          )}

          {/* LOGIN FORM */}
          {authMode === "login" ? (
            <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                id="login-cnpj"
                label="CNPJ"
                value={loginCnpj}
                onChange={(e) => setLoginCnpj(formatCnpj(e.target.value))}
                placeholder="00.000.000/0000-00"
                fullWidth
                required
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeOutlinedIcon sx={{ color: "#8FBAE3", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={inputSx}
              />

              <TextField
                id="login-email"
                label="E-mail"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="empresa@contato.com"
                fullWidth
                required
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationCityIcon sx={{ color: "#8FBAE3", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={inputSx}
              />

              <TextField
                id="login-password"
                label="Senha"
                type={showPassword ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                fullWidth
                required
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: "#8FBAE3", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={inputSx}
              />

              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                fullWidth
                sx={gradientBtn}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Entrar no Painel"}
              </Button>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", mt: 0.5 }}
              >
                Não tem conta?{" "}
                <Box
                  component="span"
                  onClick={() => { setAuthMode("register"); setError(null); }}
                  sx={{ color: "#4A85B6", fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Cadastre sua empresa
                </Box>
              </Typography>
            </Box>
          ) : (
            /* REGISTER FORM */
            <Box component="form" onSubmit={handleRegister} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#2A3543", mb: -0.5 }}>
                Dados da Empresa
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="reg-name"
                    label="Nome da Empresa"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    fullWidth
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="reg-cnpj"
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="reg-email"
                    label="E-mail"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="contato@empresa.com"
                    fullWidth
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="reg-phone"
                    label="Telefone"
                    value={regPhone}
                    onChange={(e) => setRegPhone(formatPhone(e.target.value))}
                    placeholder="(12) 99999-9999"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputSx}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 0.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#2A3543", mb: 1.5 }}>
                  Senha de Acesso
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="reg-password"
                      label="Senha"
                      type={showPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
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
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="reg-confirm-password"
                      label="Confirmar Senha"
                      type={showConfirmPassword ? "text" : "password"}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      fullWidth
                      required
                      error={regConfirmPassword.length > 0 && regPassword !== regConfirmPassword}
                      helperText={regConfirmPassword.length > 0 && regPassword !== regConfirmPassword ? "Senhas não conferem" : ""}
                      slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowConfirmPassword((v) => !v)} edge="end" size="small">
                                {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mt: 0.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#2A3543", mb: 1.5 }}>
                  Endereço <Typography component="span" variant="caption" color="text.secondary">(opcional)</Typography>
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      id="reg-cep"
                      label="CEP"
                      value={regCep}
                      onChange={handleCepChange}
                      placeholder="12345-678"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <TextField
                      id="reg-address"
                      label="Endereço"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="Rua, Avenida..."
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                      id="reg-number"
                      label="Número"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="Ex: 123"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="reg-neighborhood"
                      label="Bairro"
                      value={regNeighborhood}
                      onChange={(e) => setRegNeighborhood(e.target.value)}
                      placeholder="Ex: Centro"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="reg-complement"
                      label="Complemento"
                      value={regComplement}
                      onChange={(e) => setRegComplement(e.target.value)}
                      placeholder="Ex: Bloco A, Sala 4"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="reg-alt-email"
                      label="E-mail Alternativo"
                      type="email"
                      value={regAlternativeEmail}
                      onChange={(e) => setRegAlternativeEmail(e.target.value)}
                      placeholder="rh@empresa.com"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      id="reg-description"
                      label="Descrição da Empresa"
                      value={regDescription}
                      onChange={(e) => setRegDescription(e.target.value)}
                      placeholder="Fale um pouco sobre o segmento da empresa..."
                      fullWidth
                      multiline
                      rows={3}
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                fullWidth
                sx={{ ...gradientBtn, mt: 0.5 }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Cadastrar Empresa"}
              </Button>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", mt: 0.5 }}
              >
                Já tem conta?{" "}
                <Box
                  component="span"
                  onClick={() => { setAuthMode("login"); setError(null); }}
                  sx={{ color: "#4A85B6", fontWeight: 700, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Fazer login
                </Box>
              </Typography>
            </Box>
          )}
        </Card>

        {/* Footer note */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", textAlign: "center", mt: 3, mb: 4, opacity: 0.7 }}
        >
          PAT Jacareí · Posto de Atendimento ao Trabalhador
        </Typography>
      </Container>
    </Box>
  );
}