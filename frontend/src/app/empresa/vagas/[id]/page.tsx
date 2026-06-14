"use client";

import { useEffect, useState, use, useCallback } from "react";
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
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WorkIcon from "@mui/icons-material/Work";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import PeopleIcon from "@mui/icons-material/People";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import DownloadIcon from "@mui/icons-material/Download";

import { fetchJobById, fetchCandidaciesForJob, updateJob, type Job, type Candidacy, type Company } from "@/lib/api";
import CompanyJobDialog from "@/components/CompanyJobDialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailsManagementPage({ params }: PageProps) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.id;

  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [job, setJob] = useState<Job | null>(null);
  const [loadingJob, setLoadingJob] = useState<boolean>(true);
  const [jobError, setJobError] = useState<string | null>(null);

  const [candidacies, setCandidacies] = useState<Candidacy[]>([]);
  const [loadingCandidacies, setLoadingCandidacies] = useState<boolean>(false);
  const [candidaciesError, setCandidaciesError] = useState<string | null>(null);

  const [openJobDialog, setOpenJobDialog] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
            setCompanyData(JSON.parse(dataStr));
            setIsLoggedIn(true);
          } catch (err) {
            console.error(err);
            router.push("/empresa");
          }
        } else {
          router.push("/empresa");
        }
      }
    };
    checkAuth();
    return () => {
      active = false;
    };
  }, [router]);

  const loadJobData = useCallback(async () => {
    if (!jobId) return;
    setLoadingJob(true);
    setJobError(null);
    try {
      const data = await fetchJobById(jobId);
      setJob(data);
    } catch (err) {
      console.error(err);
      setJobError("Não foi possível carregar as informações desta vaga.");
    } finally {
      setLoadingJob(false);
    }
  }, [jobId]);

  const loadCandidaciesData = useCallback(async () => {
    if (!jobId) return;
    setLoadingCandidacies(true);
    setCandidaciesError(null);
    try {
      const data = await fetchCandidaciesForJob(jobId);
      setCandidacies(data);
    } catch (err) {
      console.error(err);
      setCandidaciesError("Não autorizado ou erro ao carregar candidaturas.");
    } finally {
      setLoadingCandidacies(false);
    }
  }, [jobId]);

  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      await Promise.resolve();
      if (active && isLoggedIn) {
        loadJobData();
        loadCandidaciesData();
      }
    };
    loadAll();
    return () => {
      active = false;
    };
  }, [isLoggedIn, loadJobData, loadCandidaciesData]);

  const handleSaveSuccess = (msg: string) => {
    setSuccessMsg(msg);
    loadJobData();
  };

  const handleFinalizeJob = async () => {
    if (!job) return;
    if (confirm("Tem certeza que deseja finalizar esta vaga? Os candidatos não poderão mais se inscrever.")) {
      try {
        await updateJob(job.id, { is_active: false, status: "finalized" });
        setSuccessMsg("Vaga finalizada com sucesso!");
        loadJobData();
      } catch (err: unknown) {
        console.error(err);
        setJobError("Não foi possível finalizar a vaga.");
      }
    }
  };

  if (!isLoggedIn || !companyData) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#FAF6F0" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (loadingJob) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#FAF6F0" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (jobError || !job) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#FAF6F0", p: 3 }}>
        <Card elevation={0} sx={{ background: "rgba(250, 82, 82, 0.05)", border: "1px solid rgba(250, 82, 82, 0.2)", borderRadius: 4, p: 4, textAlign: "center", maxWidth: 480, width: "100%" }}>
          <Typography variant="h6" color="error.main" sx={{ fontWeight: 700, mb: 2 }}>
            Erro ao Carregar Vaga
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {jobError || "Vaga não encontrada ou acesso não autorizado."}
          </Typography>
          <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => router.push("/empresa/minhas-vagas")} sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700 }}>
            Voltar para Minhas Vagas
          </Button>
        </Card>
      </Box>
    );
  }

  const isFinalized = job.status === "finalized" || !job.is_active;

  const tags = [
    { label: "Contrato", value: job.type_of_contract || "CLT", icon: <WorkIcon sx={{ color: "#4A85B6" }} /> },
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
            onClick={() => router.push("/empresa/minhas-vagas")}
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
              <WorkIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography variant="body1" color="text.primary" sx={{ fontWeight: 700 }}>
              Gerenciar Vaga
            </Typography>
          </Box>

          <Box sx={{ width: 40 }} />
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ flex: 1, py: 5, px: 2 }}>
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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 850, color: "#2A3543", letterSpacing: -0.5 }}>
                {job.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                {job.status === "published" && (
                  <Chip label="Publicada" color="success" size="small" sx={{ fontWeight: 700, borderRadius: 1 }} />
                )}
                {job.status === "evaluation" && (
                  <Chip label="Em Avaliação" color="warning" size="small" sx={{ fontWeight: 700, borderRadius: 1 }} />
                )}
                {isFinalized && (
                  <Chip label="Finalizada" size="small" sx={{ fontWeight: 700, borderRadius: 1, bgcolor: "rgba(0,0,0,0.08)" }} />
                )}
                <Typography variant="caption" color="text.secondary">
                  Quantidade: {job.quantity || 1}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                disabled={isFinalized}
                onClick={() => setOpenJobDialog(true)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  borderColor: "rgba(227, 207, 192, 0.8)",
                  color: "#4A85B6",
                  "&:hover": { borderColor: "#4A85B6", background: "#FAF6F0" },
                }}
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                disabled={isFinalized}
                onClick={handleFinalizeJob}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  borderColor: "rgba(250, 82, 82, 0.4)",
                  color: "#FA5252",
                  "&:hover": { borderColor: "#FA5252", background: "rgba(250, 82, 82, 0.05)" },
                }}
              >
                Finalizar
              </Button>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 4 }}>
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
                  }}
                >
                  <Avatar variant="rounded" sx={{ width: 36, height: 36, borderRadius: 1.5, background: "#FFFFFF", border: "1px solid rgba(227, 207, 192, 0.4)" }}>
                    {tag.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.2 }}>
                      {tag.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {tag.value}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3, borderColor: "rgba(227, 207, 192, 0.3)" }} />

          <Typography variant="h6" sx={{ fontWeight: 800, color: "#2A3543", mb: 1.5 }}>
            Descrição da Vaga
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: "pre-line" }}>
            {job.description}
          </Typography>
        </Card>

        <Card
          elevation={0}
          sx={{
            background: "#FFFFFF",
            border: "1px solid rgba(227, 207, 192, 0.4)",
            borderRadius: 4,
            p: { xs: 3, md: 4 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Avatar sx={{ bgcolor: "rgba(250, 176, 5, 0.1)", color: "#FAB005" }}>
              <PeopleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#2A3543" }}>
                Candidatos Inscritos ({candidacies.length})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pessoas que enviaram currículo para esta oportunidade
              </Typography>
            </Box>
          </Box>

          {loadingCandidacies ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={32} />
            </Box>
          ) : candidaciesError ? (
            <Alert severity="error" sx={{ borderRadius: 2.5 }}>
              {candidaciesError}
            </Alert>
          ) : candidacies.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
              Nenhum candidato inscrito nesta vaga até o momento.
            </Typography>
          ) : (
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
              {candidacies.map((cand, idx) => {
                const initials = cand.full_name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();

                const applicationDate = new Date(cand.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const resumeUrl = cand.resume.startsWith("http")
                  ? cand.resume
                  : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000"}${cand.resume}`;

                return (
                  <Box key={cand.id}>
                    {idx > 0 && <Divider variant="inset" component="li" sx={{ borderColor: "rgba(227, 207, 192, 0.3)" }} />}
                    <ListItem
                      alignItems="flex-start"
                      secondaryAction={
                        <Tooltip title="Baixar Currículo">
                          <Button
                            variant="contained"
                            size="small"
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<DownloadIcon />}
                            sx={{
                              background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                              color: "#ffffff",
                              fontWeight: 700,
                              textTransform: "none",
                              borderRadius: 2,
                              boxShadow: "none",
                              "&:hover": {
                                background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                                boxShadow: "0 4px 12px rgba(74, 133, 182, 0.2)",
                              },
                            }}
                          >
                            Currículo
                          </Button>
                        </Tooltip>
                      }
                      sx={{ py: 1.5, px: 0 }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                            color: "#ffffff",
                            fontWeight: 700,
                          }}
                        >
                          {initials}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#2A3543" }}>
                            {cand.full_name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                                <EmailIcon sx={{ fontSize: 13 }} />
                                <Link
                                  href={`mailto:${cand.email}`}
                                  variant="caption"
                                  color="inherit"
                                  underline="hover"
                                >
                                  {cand.email}
                                </Link>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                                <PhoneIcon sx={{ fontSize: 13 }} />
                                <Typography variant="caption">{cand.phone}</Typography>
                              </Box>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Candidatou-se em: {applicationDate}
                            </Typography>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: "div" } as any}
                      />
                    </ListItem>
                  </Box>
                );
              })}
            </List>
          )}
        </Card>
      </Container>

      <CompanyJobDialog
        open={openJobDialog}
        onClose={() => setOpenJobDialog(false)}
        job={job}
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
