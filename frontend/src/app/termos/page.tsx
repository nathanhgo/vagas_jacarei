import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";

export default function TermosPage() {
  return (
    <Box sx={{ minHeight: "100vh", background: "#FAF6F0", py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h3" sx={{ fontWeight: 800, color: "#2A3543", mb: 4, letterSpacing: -0.5 }}>
          Termos de Uso
        </Typography>

        <Card elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: "1px solid rgba(227, 207, 192, 0.4)" }}>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
            Ao acessar e utilizar a Plataforma Emprega Jacareí, você concorda com os presentes Termos de Uso. Esta plataforma é um Projeto de Extensão focado no fomento à empregabilidade local.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 4 }}>1. Propósito da Plataforma</Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
            A plataforma atua como um intermediário gratuito entre empresas locais de Jacareí-SP e candidatos a vagas de emprego. Não garantimos a contratação de candidatos ou a veracidade completa de vagas fornecidas por provedores externos (ex: Adzuna).
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 4 }}>2. Responsabilidade das Empresas</Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
            As empresas cadastradas são inteiramente responsáveis pela legalidade e precisão das vagas publicadas. É proibida a publicação de vagas falsas, cobrança de taxas de candidatos, ou publicação de conteúdos discriminatórios. Reservamo-nos o direito de suspender CNPJs infratores.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 4 }}>3. Plataforma de Código Aberto</Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
            O código-fonte desta plataforma é aberto (Open Source). No entanto, as marcas, logotipos e bancos de dados referentes a usuários constituem propriedade protegida.
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}
