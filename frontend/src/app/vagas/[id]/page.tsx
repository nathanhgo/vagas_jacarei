"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";

import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WorkIcon from "@mui/icons-material/Work";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";

import { fetchJobById, applyToJob, type Job } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

export default function JobDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCompanyLoggedIn, setIsCompanyLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;
    const checkToken = async () => {
      await Promise.resolve();
      if (active && typeof window !== "undefined") {
        const token = localStorage.getItem("companyToken");
        setIsCompanyLoggedIn(!!token);
      }
    };
    checkToken();
    return () => {
      active = false;
    };
  }, []);
  
  // Unwrapping params using React.use() as required in Next.js 15
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Candidacy States
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext && ["pdf", "doc", "docx"].includes(ext)) {
        setResumeFile(file);
        setFieldErrors(prev => ({ ...prev, resume: [] }));
      } else {
        setResumeFile(null);
        setFieldErrors(prev => ({ ...prev, resume: ["Apenas arquivos PDF, DOC e DOCX são permitidos."] }));
      }
    }
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setOpenModal(false);
    setFullName("");
    setEmail("");
    setPhone("");
    setResumeFile(null);
    setSuccess(false);
    setFormError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const errors: Record<string, string[]> = {};
    if (!fullName.trim()) errors.full_name = ["O nome completo é obrigatório."];
    if (!email.trim()) {
      errors.email = ["O e-mail é obrigatório."];
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = ["E-mail inválido."];
    }
    if (!phone.trim()) {
      errors.phone = ["O telefone é obrigatório."];
    } else if (phone.replace(/\D/g, "").length < 10) {
      errors.phone = ["Telefone deve conter DDD e número válido."];
    }
    if (!resumeFile) errors.resume = ["O currículo é obrigatório."];

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    try {
      await applyToJob(jobId, formData);
      setSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "";
      try {
        const errJson = JSON.parse(errMsg);
        if (errJson && typeof errJson === "object") {
          setFieldErrors(errJson as Record<string, string[]>);
          setFormError("Por favor, corrija os erros no formulário.");
        } else {
          setFormError("Erro ao enviar candidatura. Tente novamente.");
        }
      } catch {
        setFormError(
          errMsg || "Erro ao conectar-se ao servidor. Tente novamente mais tarde."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    let active = true;
    async function loadJobDetails() {
      await Promise.resolve();
      if (!active) return;
      
      setLoading(true);
      setError(null);
      try {
        const data = await fetchJobById(jobId);
        if (active) {
          setJob(data);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError("Não foi possível carregar os detalhes desta vaga. Ela pode ter sido removida ou o servidor está offline.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadJobDetails();
    return () => {
      active = false;
    };
  }, [jobId]);



  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#FAF6F0",
          color: "text.primary",
        }}
      >
        <CircularProgress size={44} thickness={4} sx={{ color: "#4A85B6" }} />
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#FAF6F0",
          color: "text.primary",
          p: 3,
        }}
      >
        <Card
          elevation={0}
          sx={{
            background: "rgba(250, 82, 82, 0.05)",
            border: "1px solid rgba(250, 82, 82, 0.2)",
            borderRadius: 4,
            p: 4,
            textAlign: "center",
            maxWidth: 480,
            width: "100%",
          }}
        >
          <Typography variant="h6" color="error.main" sx={{ fontWeight: 700, mb: 2 }}>
            Erro ao Carregar Vaga
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {error || "Vaga não encontrada."}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/vagas")}
            sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700 }}
          >
            Voltar para o Início
          </Button>
        </Card>
      </Box>
    );
  }

  const tags = [
    { label: "Bairro", value: job.neighborhood || "Não Informado", icon: <LocationCityIcon sx={{ color: "#E0876A" }} /> },
    { label: "Salário", value: job.salary ? `R$ ${Number(job.salary).toLocaleString("pt-BR")}` : "A Combinar", icon: <AttachMoneyIcon sx={{ color: "#FAB005" }} /> },
    { label: "Postado em", value: new Date(job.created_at).toLocaleDateString("pt-BR"), icon: <CalendarMonthIcon sx={{ color: "#FA5252" }} /> },
  ];

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
      {/* 🚀 Header: Back Button, Logo - Company Name, Menu */}
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
          maxWidth="md"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 2,
          }}
        >
          {/* Back button */}
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

          {/* Centered Company Logo & Name */}
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
              {job.company}
            </Typography>
          </Box>

          {/* Direct Link to Company Area */}
          <Button
            variant="outlined"
            onClick={() => router.push("/empresa")}
            startIcon={<LocationCityIcon />}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              borderColor: "rgba(227, 207, 192, 0.8)",
              color: "text.primary",
              "&:hover": {
                borderColor: "#4A85B6",
                background: "#FAF6F0",
              },
              display: { xs: "none", md: "inline-flex" }
            }}
          >
            {isCompanyLoggedIn ? "Painel da Empresa" : "Área da Empresa"}
          </Button>

          {/* Menu button */}
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
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
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              onClick={() => {
                router.push("/empresa");
                setAnchorEl(null);
              }}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              {isCompanyLoggedIn ? "Painel da Empresa" : "Área da Empresa"}
            </MenuItem>
          </Menu>
        </Container>
      </Box>

      {/* 🚀 Details Content */}
      <Container maxWidth="md" sx={{ flex: 1, py: 5, px: 2 }}>
        {/* Top Card: Cargo & Grid of 6 Tags */}
        <Card
          elevation={0}
          sx={{
            background: "#FFFFFF",
            border: "1px solid rgba(227, 207, 192, 0.4)",
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            mb: 4,
            textAlign: "center",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(74, 133, 182, 0.15)",
              }}
            >
              <WorkIcon sx={{ color: "#ffffff", fontSize: 28 }} />
            </Box>
          </Box>

          <Typography
            variant="h3"
            sx={{
              mb: 4,
              fontWeight: 800,
              letterSpacing: -0.5,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
              background: "linear-gradient(135deg, #2A3543 40%, #6C7D93 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {job.title}
          </Typography>

          <Grid container spacing={2}>
            {tags.map((tag, idx) => (
              <Grid size={{ xs: 6, sm: 3 }} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    background: "#FAF6F0",
                    border: "1px solid rgba(227, 207, 192, 0.4)",
                    borderRadius: 3,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    textAlign: "left",
                    transition: "border-color 0.2s",
                    "&:hover": {
                      borderColor: "rgba(227, 207, 192, 0.8)",
                    },
                  }}
                >
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      background: "rgba(227, 207, 192, 0.06)",
                      border: "1px solid rgba(227, 207, 192, 0.4)",
                    }}
                  >
                    {tag.icon}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.2 }}>
                      {tag.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        mt: 0.1,
                      }}
                    >
                      {tag.value}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Card>

        {/* Description Section */}
        <Card
          elevation={0}
          sx={{
            background: "#FFFFFF",
            border: "1px solid rgba(227, 207, 192, 0.4)",
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            mb: 4,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2.5,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 1,
              fontSize: "0.9rem",
              color: "primary.main",
            }}
          >
            Descrição da Vaga
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              lineHeight: 1.8,
              fontSize: "0.95rem",
              whiteSpace: "pre-line",
              p: { xs: 1, sm: 2 },
            }}
          >
            {job.description}
          </Typography>
        </Card>

        {/* Bottom Applying Section (Massive Button matching the wireframe) */}
        <Box sx={{ mb: 6 }}>
          {job.external_link ? (
            <Button
              variant="contained"
              fullWidth
              size="large"
              href={job.external_link}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewIcon />}
              sx={{
                background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "1.1rem",
                textTransform: "none",
                borderRadius: 4,
                py: 2,
                boxShadow: "0 8px 24px rgba(74, 133, 182, 0.25)",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                  boxShadow: "0 12px 32px rgba(74, 133, 182, 0.35)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Candidatar-se à Vaga
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => setOpenModal(true)}
              sx={{
                background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "1.1rem",
                textTransform: "none",
                borderRadius: 4,
                py: 2,
                boxShadow: "0 8px 24px rgba(74, 133, 182, 0.25)",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                  boxShadow: "0 12px 32px rgba(74, 133, 182, 0.35)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Candidatar-se à Vaga
            </Button>
          )}
        </Box>
      </Container>

      {/* 📋 Modal de Candidatura Rápida */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        scroll="paper"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              background: "#FFFFFF",
              border: "1px solid rgba(227, 207, 192, 0.4)",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.08)",
              p: { xs: 1, sm: 2 },
            },
          }
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
            borderBottom: "1px solid rgba(227, 207, 192, 0.2)",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#2A3543" }}>
              Candidatura Rápida
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Vaga: {job.title} - {job.company}
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseModal}
            disabled={submitting}
            sx={{
              border: "1px solid rgba(227, 207, 192, 0.4)",
              borderRadius: 2.5,
              color: "text.secondary",
              "&:hover": { background: "#FAF6F0" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {success ? (
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
              px: 3,
              textAlign: "center",
            }}
          >
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: "success.light",
                color: "success.main",
                mb: 3,
                boxShadow: "0 8px 24px rgba(46, 125, 50, 0.15)",
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 48 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#2E7D32" }}>
              Candidatura Enviada!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 360, lineHeight: 1.6 }}>
              Seu currículo foi enviado com sucesso para o RH da empresa. Fique atento ao seu e-mail e telefone para futuros contatos.
            </Typography>
            <Button
              variant="contained"
              onClick={handleCloseModal}
              sx={{
                background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                color: "#ffffff",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2.5,
                px: 5,
                py: 1.25,
                boxShadow: "0 8px 24px rgba(74, 133, 182, 0.2)",
                "&:hover": {
                  background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                  boxShadow: "0 12px 32px rgba(74, 133, 182, 0.3)",
                },
              }}
            >
              Fechar Janela
            </Button>
          </DialogContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ py: 3, px: 3 }}>
              {formError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
                  {formError}
                </Alert>
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <TextField
                  label="Nome Completo"
                  placeholder="Digite seu nome completo"
                  fullWidth
                  required
                  disabled={submitting}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.full_name) {
                      setFieldErrors(prev => ({ ...prev, full_name: [] }));
                    }
                  }}
                  error={!!fieldErrors.full_name?.length}
                  helperText={fieldErrors.full_name?.[0]}
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.5,
                    }
                  }}
                />

                <TextField
                  label="E-mail"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  fullWidth
                  required
                  disabled={submitting}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors(prev => ({ ...prev, email: [] }));
                    }
                  }}
                  error={!!fieldErrors.email?.length}
                  helperText={fieldErrors.email?.[0]}
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.5,
                    }
                  }}
                />

                <TextField
                  label="Telefone / WhatsApp"
                  placeholder="(12) 99999-9999"
                  fullWidth
                  required
                  disabled={submitting}
                  value={phone}
                  onChange={(e) => {
                    handlePhoneChange(e);
                    if (fieldErrors.phone) {
                      setFieldErrors(prev => ({ ...prev, phone: [] }));
                    }
                  }}
                  error={!!fieldErrors.phone?.length}
                  helperText={fieldErrors.phone?.[0]}
                  slotProps={{
                    inputLabel: { shrink: true }
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.5,
                    }
                  }}
                />

                {/* Custom File Upload Box */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
                    Currículo (Apenas PDF, DOC ou DOCX) *
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    disabled={submitting}
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      py: 3,
                      border: "2px dashed",
                      borderColor: !!fieldErrors.resume?.length ? "error.main" : "rgba(227, 207, 192, 0.6)",
                      borderRadius: 3,
                      textTransform: "none",
                      color: "text.primary",
                      background: "#FAF6F0",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      "&:hover": {
                        borderColor: "primary.main",
                        background: "#FFF8F2",
                      },
                    }}
                  >
                    {resumeFile ? "Alterar arquivo selecionado" : "Selecionar arquivo de currículo"}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </Button>

                  {resumeFile ? (
                    <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 600, color: "success.main", display: "flex", alignItems: "center", gap: 0.5 }}>
                      ✓ {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      Nenhum arquivo selecionado. O arquivo deve ter no máximo 10MB.
                    </Typography>
                  )}

                  {!!fieldErrors.resume?.length && (
                    <Typography variant="caption" color="error.main" sx={{ display: "block", mt: 1, fontWeight: 500 }}>
                      {fieldErrors.resume[0]}
                    </Typography>
                  )}
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                disabled={submitting}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  borderColor: "rgba(227, 207, 192, 0.8)",
                  color: "text.secondary",
                  px: 3,
                  py: 1,
                  "&:hover": {
                    borderColor: "rgba(227, 207, 192, 1)",
                    background: "#FAF6F0",
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                  color: "#ffffff",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2.5,
                  px: 4,
                  py: 1,
                  boxShadow: "0 8px 24px rgba(74, 133, 182, 0.2)",
                  flexGrow: { xs: 1, sm: 0 },
                  "&:hover": {
                    background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                    boxShadow: "0 12px 32px rgba(74, 133, 182, 0.3)",
                  },
                }}
              >
                {submitting ? (
                  <CircularProgress size={20} sx={{ color: "#ffffff" }} />
                ) : (
                  "Enviar Candidatura"
                )}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
    </Box>
  );
}
