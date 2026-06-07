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
import Snackbar from "@mui/material/Snackbar";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";

import MenuIcon from "@mui/icons-material/Menu";
import WorkIcon from "@mui/icons-material/Work";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import { 
  createCompany, 
  loginCompany, 
  fetchMyJobs, 
  deleteJob, 
  type Company, 
  type Job 
} from "@/lib/api";

import { formatCnpj, formatPhone, formatCep } from "@/utils/formatters";
import { isValidCnpj, isValidPhone, isValidCep } from "@/utils/validators";
import CompanyProfileCard from "@/components/CompanyProfileCard";
import CompanyJobDialog from "@/components/CompanyJobDialog";

export default function EmpresaPage() {
  const router = useRouter();

  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [companyData, setCompanyData] = useState<Company | null>(null);

  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regCnpj, setRegCnpj] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [regComplement, setRegComplement] = useState("");
  const [regCep, setRegCep] = useState("");
  const [regNeighborhood, setRegNeighborhood] = useState("");
  const [regAlternativeEmail, setRegAlternativeEmail] = useState("");
  const [regDescription, setRegDescription] = useState("");

  const [loginCnpj, setLoginCnpj] = useState("");
  const [loginEmail, setLoginEmail] = useState("");

  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [openJobDialog, setOpenJobDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  useEffect(() => {
    let active = true;
    const checkAuth = async () => {
      await Promise.resolve();
      if (!active) return;
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("companyToken");
        const dataStr = localStorage.getItem("companyData");
        if (token && dataStr) {
          try {
            const company = JSON.parse(dataStr);
            setCompanyData(company);
            setIsLoggedIn(true);
          } catch (err) {
            console.error("Error parsing stored company data", err);
            localStorage.removeItem("companyToken");
            localStorage.removeItem("companyData");
          }
        }
      }
    };
    checkAuth();
    return () => {
      active = false;
    };
  }, []);

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const jobs = await fetchMyJobs();
      setMyJobs(jobs);
    } catch (err: unknown) {
      console.error(err);
      setError("Não foi possível carregar as vagas da empresa.");
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchJobsAsync = async () => {
      await Promise.resolve();
      if (active && isLoggedIn) {
        loadJobs();
      }
    };
    fetchJobsAsync();
    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("companyToken");
    localStorage.removeItem("companyData");
    setIsLoggedIn(false);
    setCompanyData(null);
    setMyJobs([]);
    setSuccessMsg("Sessão encerrada com sucesso.");
  };

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
    if (!loginCnpj.trim() || !loginEmail.trim()) {
      setError("Preencha o CNPJ e o E-mail de cadastro.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginCompany(loginCnpj.trim(), loginEmail.trim());
      localStorage.setItem("companyToken", data.token);
      localStorage.setItem("companyData", JSON.stringify(data.company));
      setCompanyData(data.company);
      setIsLoggedIn(true);
      setSuccessMsg(`Login efetuado! Bem-vindo, ${data.company.name}.`);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "";
      setError(errMsg || "CNPJ ou E-mail incorretos, ou empresa não cadastrada.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regCnpj.trim()) {
      setError("Preencha o nome da empresa, e-mail e CNPJ.");
      return;
    }

    if (!isValidCnpj(regCnpj)) {
      setError("CNPJ inválido. Use o formato 00.000.000/0000-00.");
      return;
    }

    if (!isValidPhone(regPhone)) {
      setError("Telefone inválido. Exemplo: (12) 99999-9999.");
      return;
    }

    if (!isValidCep(regCep)) {
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
        address: regAddress.trim() || undefined,
        number: regNumber.trim() || undefined,
        complement: regComplement.trim() || undefined,
        cep: regCep.trim() || undefined,
        neighborhood: regNeighborhood.trim() || undefined,
        alternative_email: regAlternativeEmail.trim() || undefined,
        description: regDescription.trim() || undefined,
      };

      const company = await createCompany(payload);
      localStorage.setItem("companyToken", company.cnpj || regCnpj.trim());
      localStorage.setItem("companyData", JSON.stringify(company));
      setCompanyData(company);
      setIsLoggedIn(true);
      setSuccessMsg(`Empresa cadastrada e autenticada! Bem-vindo, ${company.name}.`);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "";
      setError(errMsg || "Erro ao cadastrar empresa. CNPJ ou e-mail pode já existir.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewJob = () => {
    setEditingJob(null);
    setOpenJobDialog(true);
  };

  const handleOpenEditJob = (job: Job) => {
    setEditingJob(job);
    setOpenJobDialog(true);
  };

  const handleSaveSuccess = (msg: string) => {
    setSuccessMsg(msg);
    loadJobs();
  };

  const handleJobDelete = async (jobId: number) => {
    if (confirm("Tem certeza que deseja excluir esta vaga? Esta ação fará com que ela desapareça do mural de vagas.")) {
      try {
        await deleteJob(jobId);
        setSuccessMsg("Vaga excluída com sucesso!");
        loadJobs();
      } catch (err: unknown) {
        console.error(err);
        setError("Não foi possível excluir a vaga.");
      }
    }
  };

  const renderDashboard = () => {
    if (!companyData) return null;

    return (
      <Container maxWidth="lg" sx={{ flex: 1, py: 6, px: 2 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <CompanyProfileCard company={companyData} />
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              elevation={0}
              sx={{
                background: "#FFFFFF",
                border: "1px solid rgba(227, 207, 192, 0.4)",
                borderRadius: 4,
                p: { xs: 3, md: 4 },
                minHeight: 400,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 2,
                  mb: 4,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#2A3543" }}>
                    Minhas Vagas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Publique e edite vagas da sua empresa no portal Jacareí Emprega.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenNewJob}
                  sx={{
                    background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                    color: "#ffffff",
                    fontWeight: 700,
                    textTransform: "none",
                    borderRadius: 2.5,
                    px: 3,
                    py: 1,
                    boxShadow: "0 8px 24px rgba(74, 133, 182, 0.2)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                      boxShadow: "0 12px 32px rgba(74, 133, 182, 0.3)",
                    },
                  }}
                >
                  Publicar Nova Vaga
                </Button>
              </Box>

              {loadingJobs ? (
                <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <CircularProgress color="primary" />
                </Box>
              ) : myJobs.length === 0 ? (
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    py: 6,
                    px: 3,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: "rgba(227, 207, 192, 0.15)",
                      color: "#4A85B6",
                      mb: 2,
                    }}
                  >
                    <WorkIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Nenhuma vaga publicada
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: 3 }}>
                    Você ainda não cadastrou nenhuma oportunidade de emprego para esta empresa. Comece agora!
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  {myJobs.map((job) => {
                    const isPublished = job.status === "published";
                    const isEval = job.status === "evaluation";
                    
                    return (
                      <Paper
                        key={job.id}
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          background: "#FAF6F0",
                          border: "1px solid rgba(227, 207, 192, 0.4)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: { xs: "wrap", sm: "nowrap" },
                          gap: 2,
                        }}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1, flexWrap: "wrap" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#2A3543" }}>
                              {job.title}
                            </Typography>
                            {isPublished && (
                              <Chip label="Publicado" size="small" color="success" sx={{ fontWeight: 700, height: 20, fontSize: "0.75rem" }} />
                            )}
                            {isEval && (
                              <Chip label="Em Avaliação" size="small" color="warning" sx={{ fontWeight: 700, height: 20, fontSize: "0.75rem" }} />
                            )}
                            {job.status === "inactive" && (
                              <Chip label="Pausado" size="small" variant="outlined" sx={{ fontWeight: 700, height: 20, fontSize: "0.75rem" }} />
                            )}
                          </Box>

                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, color: "text.secondary" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <LocationOnIcon sx={{ fontSize: 16, color: "#E0876A" }} />
                              <Typography variant="caption">{job.neighborhood || "Jacareí (Geral)"}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <AttachMoneyIcon sx={{ fontSize: 16, color: "#FAB005" }} />
                              <Typography variant="caption">
                                {job.salary ? `R$ ${Number(job.salary).toLocaleString("pt-BR")}` : "A Combinar"}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <CalendarMonthIcon sx={{ fontSize: 16, color: "#4A85B6" }} />
                              <Typography variant="caption">
                                {new Date(job.created_at).toLocaleDateString("pt-BR")}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1, alignSelf: { xs: "flex-end", sm: "center" } }}>
                          <IconButton
                            onClick={() => handleOpenEditJob(job)}
                            sx={{
                              border: "1px solid rgba(227, 207, 192, 0.6)",
                              borderRadius: 2,
                              background: "#FFFFFF",
                              color: "#4A85B6",
                              "&:hover": { background: "#FAF6F0" },
                            }}
                            title="Editar Vaga"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleJobDelete(job.id)}
                            sx={{
                              border: "1px solid rgba(227, 207, 192, 0.6)",
                              borderRadius: 2,
                              background: "#FFFFFF",
                              color: "#FA5252",
                              "&:hover": { background: "rgba(250, 82, 82, 0.05)" },
                            }}
                            title="Excluir Vaga"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  };

  const renderAuthForms = () => {
    return (
      <Container maxWidth="md" sx={{ flex: 1, py: 6, px: 2 }}>
        <Card
          elevation={0}
          sx={{
            background: "#FFFFFF",
            border: "1px solid rgba(227, 207, 192, 0.4)",
            borderRadius: 4,
            p: { xs: 3, md: 4 },
          }}
        >
          <Box sx={{ display: "flex", borderBottom: "1px solid rgba(227, 207, 192, 0.4)", mb: 4 }}>
            <Button
              onClick={() => {
                setAuthMode("login");
                setError(null);
              }}
              sx={{
                flex: 1,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: authMode === "login" ? 800 : 500,
                color: authMode === "login" ? "#4A85B6" : "text.secondary",
                borderBottom: authMode === "login" ? "3px solid #4A85B6" : "none",
                borderRadius: 0,
                textTransform: "none",
              }}
            >
              Acessar Painel
            </Button>
            <Button
              onClick={() => {
                setAuthMode("register");
                setError(null);
              }}
              sx={{
                flex: 1,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: authMode === "register" ? 800 : 500,
                color: authMode === "register" ? "#4A85B6" : "text.secondary",
                borderBottom: authMode === "register" ? "3px solid #4A85B6" : "none",
                borderRadius: 0,
                textTransform: "none",
              }}
            >
              Cadastrar Empresa
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
              {error}
            </Alert>
          )}

          {authMode === "login" ? (
            <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#2A3543" }}>
                Identificação da Empresa
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Insira o CNPJ e o E-mail cadastrados para gerenciar as vagas da sua empresa.
              </Typography>

              <TextField
                label="CNPJ"
                value={loginCnpj}
                onChange={(e) => setLoginCnpj(formatCnpj(e.target.value))}
                placeholder="00.000.000/0000-00"
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              />

              <TextField
                label="E-mail de Cadastro"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="empresa@contato.com"
                fullWidth
                required
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              />

              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                  color: "#ffffff",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2.5,
                  py: 1.5,
                  boxShadow: "0 8px 24px rgba(74, 133, 182, 0.2)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                    boxShadow: "0 12px 32px rgba(74, 133, 182, 0.3)",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Entrar no Painel"}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleRegister} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#2A3543" }}>
                Nova Conta de Empresa
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Preencha o formulário abaixo para registrar sua empresa no Posto de Atendimento ao Trabalhador de Jacareí.
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Nome da Empresa"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    fullWidth
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="CNPJ"
                    value={regCnpj}
                    onChange={(e) => setRegCnpj(formatCnpj(e.target.value))}
                    placeholder="00.000.000/0000-00"
                    fullWidth
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="E-mail principal"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="contato@empresa.com"
                    fullWidth
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="E-mail Alternativo (Opcional)"
                    type="email"
                    value={regAlternativeEmail}
                    onChange={(e) => setRegAlternativeEmail(e.target.value)}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Telefone Comercial"
                    value={regPhone}
                    onChange={(e) => setRegPhone(formatPhone(e.target.value))}
                    placeholder="(12) 3951-0000"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="CEP"
                    value={regCep}
                    onChange={handleCepChange}
                    placeholder="12300-000"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField
                    label="Endereço / Logradouro"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Número"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Bairro"
                    value={regNeighborhood}
                    onChange={(e) => setRegNeighborhood(e.target.value)}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Complemento"
                    value={regComplement}
                    onChange={(e) => setRegComplement(e.target.value)}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Descrição da Empresa (Valores, Atuação)"
                    value={regDescription}
                    onChange={(e) => setRegDescription(e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  mt: 2,
                  background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                  color: "#ffffff",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2.5,
                  py: 1.5,
                  boxShadow: "0 8px 24px rgba(74, 133, 182, 0.2)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                    boxShadow: "0 12px 32px rgba(74, 133, 182, 0.3)",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Cadastrar Empresa"}
              </Button>
            </Box>
          )}
        </Card>
      </Container>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #FAF6F0 0%, #FFFFFF 100%)",
        color: "text.primary",
      }}
    >
      <Box
        component="header"
        sx={{
          borderBottom: "1px solid rgba(227, 207, 192, 0.4)",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          py: 2,
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 2,
          }}
        >
          <IconButton
            onClick={() => router.push("/vagas")}
            sx={{
              border: "1px solid rgba(227, 207, 192, 0.6)",
              borderRadius: 3,
              background: "#FFFFFF",
              color: "text.primary",
              "&:hover": { background: "#FAF6F0" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                background: "rgba(227, 207, 192, 0.06)",
                border: "1px solid rgba(227, 207, 192, 0.4)",
                color: "#4A85B6",
              }}
            >
              <LocationCityIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography variant="body1" color="text.primary" sx={{ fontWeight: 700 }}>
              Portal da Empresa
            </Typography>
          </Box>

          {isLoggedIn ? (
            <IconButton
              onClick={handleLogout}
              sx={{
                border: "1px solid rgba(250, 82, 82, 0.4)",
                borderRadius: 3,
                background: "#FFFFFF",
                color: "#FA5252",
                "&:hover": { background: "rgba(250, 82, 82, 0.05)" },
              }}
              title="Sair do Painel"
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          ) : (
            <IconButton
              sx={{
                border: "1px solid rgba(227, 207, 192, 0.6)",
                borderRadius: 3,
                background: "#FFFFFF",
                color: "text.primary",
                "&:hover": { background: "#FAF6F0" },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Container>
      </Box>

      {isLoggedIn ? renderDashboard() : renderAuthForms()}

      <CompanyJobDialog
        open={openJobDialog}
        onClose={() => setOpenJobDialog(false)}
        job={editingJob}
        onSaveSuccess={handleSaveSuccess}
      />

      <Snackbar
        open={successMsg !== null}
        autoHideDuration={6000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%", borderRadius: 2.5 }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}