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

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WorkIcon from "@mui/icons-material/Work";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { fetchJobById, type Job } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailsPage({ params }: PageProps) {
  const router = useRouter();
  
  // Unwrapping params using React.use() as required in Next.js 15
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.id;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

          {/* Menu button */}
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
    </Box>
  );
}
