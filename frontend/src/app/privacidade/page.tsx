import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";

export default function PrivacidadePage() {
  return (
    <Box sx={{ minHeight: "100vh", background: "#FAF6F0", py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h3" sx={{ fontWeight: 800, color: "#2A3543", mb: 4, letterSpacing: -0.5 }}>
          Política de Privacidade
        </Typography>

        <Card elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: "1px solid rgba(227, 207, 192, 0.4)" }}>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
            Bem-vindo à Plataforma Emprega Jacareí. O seu direito à privacidade e à segurança dos seus dados é a nossa prioridade, em total conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 4 }}>1. Coleta de Dados</Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
            Coletamos dados estritamente necessários para o funcionamento da plataforma.
            <br />- <strong>Candidatos:</strong> Nome, E-mail, Telefone e Currículo. Estes dados são enviados diretamente para a empresa ofertante da vaga.
            <br />- <strong>Empresas:</strong> CNPJ, E-mail Corporativo, Endereço e Dados de Contato para validação da autenticidade da oferta de emprego.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 4 }}>2. Uso dos Dados</Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
            Os dados coletados são utilizados exclusivamente para conectar talentos a oportunidades de emprego na região de Jacareí-SP. Não vendemos, alugamos ou compartilhamos suas informações com terceiros para fins de marketing ou publicidade.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 4 }}>3. Direitos do Titular</Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
            Conforme a LGPD, você tem o direito de:
            <ul>
              <li>Solicitar a exclusão definitiva do seu currículo ou dados cadastrais.</li>
              <li>Saber quais empresas receberam o seu currículo através da nossa plataforma.</li>
              <li>Corrigir informações incorretas.</li>
            </ul>
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}
