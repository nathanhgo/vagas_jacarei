"use client";

import { useState } from "react";
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
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import MenuIcon from "@mui/icons-material/Menu";
import WorkIcon from "@mui/icons-material/Work";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { createCompany } from "@/lib/api";

export default function EmpresaPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [complement, setComplement] = useState("");
  const [cep, setCep] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [alternativeEmail, setAlternativeEmail] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const isValidPhone = (value: string) => {
    if (!value) return true;
    return /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(value.trim());
  };

  const isValidCep = (value: string) => {
    if (!value) return true;
    return /^\d{5}-?\d{3}$/.test(value.trim());
  };

  const isValidCnpj = (value: string) => {
    return /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(value.trim());
  };

  const validate = () => {
    if (!name.trim() || !email.trim() || !cnpj.trim()) {
      setError("Preencha o nome da empresa, e-mail e CNPJ.");
      return false;
    }

    if (!isValidCnpj(cnpj)) {
      setError("CNPJ inválido. Use 00.000.000/0000-00 ou 00000000000000.");
      return false;
    }

    if (!isValidPhone(phone)) {
      setError("Telefone inválido. Use DDD + número, por exemplo (11) 91234-5678.");
      return false;
    }

    if (!isValidCep(cep)) {
      setError("CEP inválido. Use 12345-678 ou 12345678.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim(),
        cnpj: cnpj.trim(),
        address: address.trim() || undefined,
        complement: complement.trim() || undefined,
        cep: cep.trim() || undefined,
        neighborhood: neighborhood.trim() || undefined,
        alternative_email: alternativeEmail.trim() || undefined,
        description: description.trim() || undefined,
      } as any;

      await createCompany(payload);
      setSuccessOpen(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erro ao criar vaga. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, #FAF6F0 0%, #FFFFFF 100%)", color: "text.primary" }}>
      <Box component="header" sx={{ borderBottom: "1px solid rgba(227, 207, 192, 0.4)", background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100, py: 2 }}>
        <Container maxWidth="md" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, px: 2 }}>
          <IconButton
            onClick={() => router.push("/vagas")}
            sx={{ border: "1px solid rgba(227, 207, 192, 0.6)", borderRadius: 3, background: "#FFFFFF", color: "text.primary", "&:hover": { background: "#FAF6F0" } }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar variant="rounded" sx={{ width: 32, height: 32, borderRadius: 1.5, background: "rgba(227, 207, 192, 0.06)", border: "1px solid rgba(227, 207, 192, 0.4)", color: "#4A85B6" }}>
              <LocationCityIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography variant="body1" color="text.primary" sx={{ fontWeight: 700 }}>Empresa</Typography>
          </Box>

          <IconButton sx={{ border: "1px solid rgba(227, 207, 192, 0.6)", borderRadius: 3, background: "#FFFFFF", color: "text.primary", "&:hover": { background: "#FAF6F0" } }}>
            <MenuIcon />
          </IconButton>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ flex: 1, py: 6, px: 2 }}>
        <Card elevation={0} sx={{ background: "#FFFFFF", border: "1px solid rgba(227, 207, 192, 0.4)", borderRadius: 4, p: { xs: 3, md: 4 } }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>Cadastrar Empresa</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Preencha as informações abaixo para cadastrar uma nova empresa.</Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Nome da Empresa" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
            <TextField label="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} fullWidth required />

            <TextField label="E-mail de Contato" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
            <TextField label="E-mail Alternativo (opcional)" type="email" value={alternativeEmail} onChange={(e) => setAlternativeEmail(e.target.value)} fullWidth />

            <TextField label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />

            <TextField label="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth />
            <TextField label="Complemento" value={complement} onChange={(e) => setComplement(e.target.value)} fullWidth />

            <TextField label="CEP" value={cep} onChange={(e) => setCep(e.target.value)} fullWidth />
            <TextField label="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} fullWidth />

            <TextField label="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={6} />

            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <Button variant="contained" color="primary" type="submit" disabled={loading} sx={{ textTransform: "none", fontWeight: 700 }} startIcon={<LocationCityIcon />}>
                {loading ? "Enviando..." : "Cadastrar Empresa"}
              </Button>
              <Button variant="outlined" onClick={() => router.push("/vagas")} sx={{ textTransform: "none" }}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </Card>
      </Container>

      <Snackbar
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          sx={{ width: "100%" }}
          action={
            <Button color="inherit" size="small" onClick={() => setSuccessOpen(false)}>
              OK
            </Button>
          }
        >
          Empresa registrada com sucesso, entraremos em contato com você para alinharmos as vagas a serem registradas!
        </Alert>
      </Snackbar>
    </Box>
  );
}