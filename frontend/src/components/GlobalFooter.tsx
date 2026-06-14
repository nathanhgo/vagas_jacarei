"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function GlobalFooter() {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        borderTop: "1px solid rgba(227, 207, 192, 0.4)",
        background: "rgba(250, 246, 240, 0.9)",
        mt: "auto",
      }}
    >
      <Container maxWidth="lg" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", fontWeight: 500 }}>
          Plataforma de Vagas de Emprego — Jacareí, SP
        </Typography>

        <Box sx={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/privacidade" color="inherit" underline="hover" variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
            Política de Privacidade (LGPD)
          </Link>
          <Link href="/termos" color="inherit" underline="hover" variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
            Termos de Uso
          </Link>
          <Link
            href="https://github.com/nathanhgo/vagas_jacarei"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
            underline="hover"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 600, color: "text.secondary" }}
            variant="caption"
          >
            <GitHubIcon sx={{ fontSize: 16 }} />
            Código Aberto
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
