"use client";

import { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/InputBase";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Pagination from "@mui/material/Pagination";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import RefreshIcon from "@mui/icons-material/Refresh";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { fetchJobs, type Job } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function VagasPage() {
  const router = useRouter();

  // State variables for CSR
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  // Pagination & Filtering state
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const PAGE_SIZE = 6;

  // Debounce search typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Fetch Jobs from backend API
  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchJobs(page, debouncedSearch, PAGE_SIZE);
      setJobs(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / PAGE_SIZE));
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar as vagas. Certifique-se de que o backend está ativo.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  // Load jobs when dependencies change
  useEffect(() => {
    let active = true;
    const trigger = async () => {
      await Promise.resolve();
      if (active) {
        setMounted(true);
        loadJobs();
      }
    };
    trigger();
    return () => {
      active = false;
    };
  }, [loadJobs]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #FAF6F0 0%, #FFFFFF 100%)",
        color: "text.primary",
        position: "relative",
      }}
    >
      {/* 🚀 Header: Logo, Search, Menu */}
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
            px: { xs: 2, md: 3 },
          }}
        >
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px rgba(74, 133, 182, 0.2)",
              }}
            >
              <WorkIcon sx={{ color: "#ffffff", fontSize: 22 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                display: { xs: "none", sm: "block" },
                background: "linear-gradient(135deg, #2A3543 40%, #6C7D93 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Vagas Jacareí
            </Typography>
          </Box>

          {/* Centered Search Bar */}
          <Box
            sx={{
              flex: 1,
              maxWidth: 540,
              background: "#FFFFFF",
              border: "1px solid rgba(227, 207, 192, 0.6)",
              borderRadius: 3,
              px: 2,
              py: 0.75,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              transition: "all 0.2s ease-in-out",
              "&:focus-within": {
                borderColor: "#4A85B6",
                boxShadow: "0 0 12px rgba(74, 133, 182, 0.15)",
                background: "#FFFFFF",
              },
            }}
          >
            <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
            <TextField
              placeholder="Pesquisar vagas, cargos ou empresas..."
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                color: "text.primary",
                fontSize: "0.95rem",
                "& input::placeholder": { color: "text.secondary", opacity: 0.8 },
              }}
            />
          </Box>

          {/* Menu Button */}
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

      {/* 🚀 Main Vacancies Content */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 5, px: { xs: 2, md: 3 } }}>
        {/* Title and stats */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 0.5 }}>
              Vagas Disponíveis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {loading ? (
                "Carregando vagas..."
              ) : (
                <>
                  <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
                    {totalCount}
                  </Box>{" "}
                  oportunidades encontradas em Jacareí-SP
                </>
              )}
            </Typography>
          </Box>
          <Tooltip title="Atualizar vagas">
            <IconButton
              onClick={loadJobs}
              disabled={mounted ? loading : false}
              sx={{
                border: "1px solid rgba(0, 0, 0, 0.06)",
                borderRadius: 2,
                color: "text.primary",
                "&:hover": { background: "rgba(0,0,0,0.03)" },
              }}
            >
              <RefreshIcon sx={{ animation: (mounted && loading) ? "spin 1.5s linear infinite" : "none", "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } } }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Loading Spinner */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
            <CircularProgress size={44} thickness={4} sx={{ color: "#4A85B6" }} />
          </Box>
        )}

        {/* Error message */}
        {!loading && error && (
          <Card
            elevation={0}
            sx={{
              background: "rgba(250, 82, 82, 0.05)",
              border: "1px solid rgba(250, 82, 82, 0.2)",
              borderRadius: 3,
              p: 4,
              textAlign: "center",
              my: 4,
            }}
          >
            <Typography variant="h6" color="error.main" sx={{ fontWeight: 700, mb: 1 }}>
              Erro na Comunicação
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: "auto", mb: 3 }}>
              {error}
            </Typography>
            <Button variant="contained" color="error" onClick={loadJobs} startIcon={<RefreshIcon />}>
              Tentar Novamente
            </Button>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && jobs.length === 0 && (
          <Card
            elevation={0}
            sx={{
              background: "rgba(0, 0, 0, 0.01)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              borderRadius: 3,
              p: 8,
              textAlign: "center",
              my: 4,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Nenhuma vaga encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: "auto" }}>
              Não encontramos vagas ativas com os filtros escolhidos. Tente pesquisar por outro termo ou limpe os filtros.
            </Typography>
          </Card>
        )}

        {/* Jobs Cards List */}
        {!loading && !error && jobs.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 6 }}>
            {jobs.map((job) => {
              return (
                <Card
                  key={job.id}
                  onClick={() => router.push(`/vagas/${job.id}`)}
                  sx={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(227, 207, 192, 0.4)",
                    borderRadius: 4,
                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    overflow: "hidden",
                    position: "relative",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: "rgba(74, 133, 182, 0.4)",
                      background: "#FFFFFF",
                      boxShadow: "0 12px 28px rgba(227, 207, 192, 0.25), 0 0 20px rgba(74, 133, 182, 0.04)",
                      "& .job-title": { color: "#4A85B6" },
                    },
                  }}
                >
                  {/* Glowing vertical bar on hover */}
                  <Box
                    className="hover-bar"
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: "linear-gradient(to bottom, #8FBAE3, #F1A990)",
                      opacity: 0,
                      transition: "opacity 0.25s ease",
                      ".MuiCard-root:hover &": { opacity: 1 },
                    }}
                  />

                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        justifyContent: "space-between",
                        gap: 2,
                        mb: 2.5,
                      }}
                    >
                      {/* Company Info */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar
                          variant="rounded"
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 2,
                            background: "rgba(227, 207, 192, 0.06)",
                            border: "1px solid rgba(227, 207, 192, 0.4)",
                            color: "#4A85B6",
                          }}
                        >
                          <LocationCityIcon sx={{ fontSize: 24 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Empresa
                          </Typography>
                          <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700, mt: -0.25 }}>
                            {job.company}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Job Title */}
                    <Typography
                      variant="h5"
                      className="job-title"
                      sx={{
                        mb: 2,
                        fontWeight: 800,
                        letterSpacing: -0.3,
                        transition: "color 0.2s ease-in-out",
                        fontSize: { xs: "1.2rem", md: "1.4rem" },
                      }}
                    >
                      {job.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {job.description}
                    </Typography>

                    {/* Metadata Bottom Bar */}
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        pt: 2,
                        borderTop: "1px solid rgba(227, 207, 192, 0.4)",
                      }}
                    >
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <LocationOnIcon sx={{ color: "text.secondary", fontSize: 16 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {job.neighborhood ? `Bairro: ${job.neighborhood}` : "Bairro: Centro"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <AttachMoneyIcon sx={{ color: "text.secondary", fontSize: 16 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {job.salary ? `R$ ${Number(job.salary).toLocaleString("pt-BR")}` : "A Combinar"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <CalendarMonthIcon sx={{ color: "text.secondary", fontSize: 16 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {new Date(job.created_at).toLocaleDateString("pt-BR")}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Action Button */}
                      <Button
                        variant="text"
                        size="small"
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          color: "#4A85B6",
                          "&:hover": { color: "#E0876A" },
                        }}
                      >
                        Ver Detalhes →
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        {/* 🚀 Pagination Component */}
        {!loading && !error && totalCount > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              size="medium"
              siblingCount={1}
              boundaryCount={1}
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "text.secondary",
                  fontWeight: 600,
                  borderRadius: 2,
                  border: "1px solid rgba(227, 207, 192, 0.4)",
                  background: "#FFFFFF",
                  "&:hover": {
                    background: "#FAF6F0",
                    color: "text.primary",
                  },
                  "&.Mui-selected": {
                    background: "linear-gradient(135deg, #4A85B6 0%, #E0876A 100%)",
                    color: "#ffffff",
                    border: "none",
                    boxShadow: "0 0 12px rgba(74, 133, 182, 0.25)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #4A85B6 0%, #E0876A 100%)",
                    },
                  },
                },
              }}
            />
          </Box>
        )}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          borderTop: "1px solid rgba(227, 207, 192, 0.4)",
          background: "rgba(250, 246, 240, 0.9)",
          mt: "auto",
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
            Plataforma de Vagas de Emprego — Jacareí, SP · Projeto de Extensão Universitária
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
