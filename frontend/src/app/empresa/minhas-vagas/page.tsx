"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
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

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MouseIcon from "@mui/icons-material/Mouse";
import SendIcon from "@mui/icons-material/Send";

import { fetchMyJobs, updateJob, type Company, type Job } from "@/lib/api";
import CompanyProfileCard from "@/components/CompanyProfileCard";
import CompanyJobDialog from "@/components/CompanyJobDialog";

export default function MinhasVagasPage() {
  const router = useRouter();

  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

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
            setCompanyData(JSON.parse(dataStr));
            setIsLoggedIn(true);
          } catch (err) {
            console.error("Error parsing stored company data", err);
            localStorage.removeItem("companyToken");
            localStorage.removeItem("companyData");
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
    router.push("/empresa");
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

  const handleFinalizeJob = async (jobId: number) => {
    if (confirm("Tem certeza que deseja finalizar esta vaga? Os candidatos não poderão mais se inscrever.")) {
      try {
        await updateJob(jobId, { is_active: false, status: "finalized" });
        setSuccessMsg("Vaga finalizada com sucesso!");
        loadJobs();
      } catch (err: unknown) {
        console.error(err);
        setError("Não foi possível finalizar a vaga.");
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
              {companyData.name}
            </Typography>
          </Box>

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
        </Container>
      </Box>

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
                  borderBottom: "2px solid rgba(227, 207, 192, 0.2)",
                  pb: 2,
                }}
              >
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "#2A3543", letterSpacing: -0.5 }}>
                    Minhas vagas
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Gerencie, acompanhe métricas de acesso e confira candidaturas.
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

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

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
                    <LocationCityIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Nenhuma vaga publicada
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
                    Comece cadastrando uma vaga de emprego para a sua empresa na plataforma.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {myJobs.map((job) => {
                    const isPublished = job.status === "published";
                    const isEval = job.status === "evaluation";
                    const isFinalized = job.status === "finalized" || !job.is_active;

                    const formattedDate = new Date(job.created_at).toLocaleDateString("pt-BR");
                    const formattedLocation = job.neighborhood ? `${formattedDate} | ${job.neighborhood}` : `${formattedDate} | Jacareí (Geral)`;

                    return (
                      <Paper
                        key={job.id}
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3.5,
                          background: "#FAF6F0",
                          border: "1px solid rgba(227, 207, 192, 0.4)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "stretch",
                          flexDirection: { xs: "column", sm: "row" },
                          gap: 3,
                          transition: "transform 0.2s, box-shadow 0.2s",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 20px rgba(227, 207, 192, 0.3)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, minWidth: 0 }}>
                          <Box>
                            <Typography
                              variant="h6"
                              onClick={() => router.push(`/empresa/vagas/${job.id}`)}
                              sx={{
                                fontWeight: 800,
                                color: "#2A3543",
                                cursor: "pointer",
                                textDecoration: "none",
                                display: "inline-block",
                                "&:hover": {
                                  color: "#4A85B6",
                                  textDecoration: "underline",
                                },
                              }}
                            >
                              {job.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, fontWeight: 500 }}>
                              {formattedLocation}
                            </Typography>
                          </Box>

                          <Grid container spacing={2} sx={{ mt: 2.5 }}>
                            <Grid size={{ xs: 4 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                                <VisibilityIcon sx={{ fontSize: 16, color: "#8FBAE3" }} />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  Visualizações
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: "#2A3543", ml: 2.5 }}>
                                {job.views_count ?? 0}
                              </Typography>
                            </Grid>

                            <Grid size={{ xs: 4 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                                <MouseIcon sx={{ fontSize: 16, color: "#F1A990" }} />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  Cliques
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: "#2A3543", ml: 2.5 }}>
                                {job.clicks_count ?? 0}
                              </Typography>
                            </Grid>

                            <Grid size={{ xs: 4 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                                <SendIcon sx={{ fontSize: 14, color: "#4A85B6" }} />
                                <Typography variant="caption" sx={{ fontWeight: 600, ml: 0.5 }}>
                                  Envios
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: "#2A3543", ml: 2.5 }}>
                                {job.candidacies_count ?? 0}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: { xs: "stretch", sm: "flex-end" },
                            minWidth: { xs: "100%", sm: 140 },
                            gap: 1.5,
                          }}
                        >
                          <Box>
                            {isPublished && (
                              <Chip label="Publicada" color="success" size="small" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                            )}
                            {isEval && (
                              <Chip label="Em Avaliação" color="warning" size="small" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                            )}
                            {isFinalized && (
                              <Chip label="Finalizada" size="small" sx={{ fontWeight: 700, borderRadius: 1.5, bgcolor: "rgba(0,0,0,0.08)" }} />
                            )}
                          </Box>

                          <Box sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              disabled={isFinalized}
                              onClick={() => handleOpenEditJob(job)}
                              sx={{
                                border: "1px solid rgba(227, 207, 192, 0.8)",
                                color: "#4A85B6",
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 700,
                                "&:hover": {
                                  borderColor: "#4a85b6",
                                  background: "#ffffff",
                                },
                              }}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<CancelIcon />}
                              disabled={isFinalized}
                              onClick={() => handleFinalizeJob(job.id)}
                              sx={{
                                border: "1px solid rgba(250, 82, 82, 0.4)",
                                color: "#FA5252",
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 700,
                                "&:hover": {
                                  borderColor: "#FA5252",
                                  background: "rgba(250, 82, 82, 0.05)",
                                },
                              }}
                            >
                              Finalizar
                            </Button>
                          </Box>
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
