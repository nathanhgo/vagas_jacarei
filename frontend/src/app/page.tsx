import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import WorkIcon from "@mui/icons-material/Work";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PingStatus from "@/components/PingStatus";

export default function Home() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        // Animated gradient background
        background: "radial-gradient(ellipse at 20% 50%, rgba(79, 142, 247, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(34, 211, 160, 0.06) 0%, transparent 50%), #0D1117",
      }}
    >
      {/* Decorative background dots */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", py: 8, position: "relative" }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={8}>
          {/* Logo mark */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: 4,
              background: "linear-gradient(135deg, #4F8EF7 0%, #22D3A0 100%)",
              mb: 3,
              boxShadow: "0 0 40px rgba(79, 142, 247, 0.3)",
            }}
          >
            <WorkIcon sx={{ fontSize: 40, color: "white" }} />
          </Box>

          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
            <LocationCityIcon sx={{ color: "text.secondary", fontSize: 18 }} />
            <Chip label="Jacareí - SP" size="small" variant="outlined" sx={{ fontWeight: 500 }} />
          </Box>

          <Typography
            variant="h2"
            component="h1"
            fontWeight={800}
            sx={{
              fontSize: { xs: "2rem", md: "3.5rem" },
              lineHeight: 1.1,
              mb: 2,
              background: "linear-gradient(135deg, #E6EDF3 30%, #8B949E 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Plataforma de Vagas
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            fontWeight={400}
            sx={{ maxWidth: 540, mx: "auto", lineHeight: 1.6 }}
          >
            Conectando talentos e empresas em{" "}
            <Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
              Jacareí
            </Box>
            .
          </Typography>
        </Box>

        {/* API Status Section */}
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <Box textAlign="center">
            <Typography variant="overline" color="text.secondary" letterSpacing={2}>
              Verificação de Conectividade
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Comunicação entre frontend e backend Django
            </Typography>
          </Box>
          <PingStatus />
        </Box>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ py: 3, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Plataforma de Vagas de Emprego — Jacareí, SP · Projeto de Extensão Universitária
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
