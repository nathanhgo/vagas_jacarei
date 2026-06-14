"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";

import { createJob, updateJob, type Job } from "@/lib/api";

interface CompanyJobDialogProps {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  onSaveSuccess: (msg: string) => void;
}

export default function CompanyJobDialog({ open, onClose, job, onSaveSuccess }: CompanyJobDialogProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobContract, setJobContract] = useState("CLT");
  const [jobNeighborhood, setJobNeighborhood] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobRefEmail, setJobRefEmail] = useState("");
  const [jobQuantity, setJobQuantity] = useState("1");
  const [jobSubmitting, setJobSubmitting] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const initForm = async () => {
      await Promise.resolve();
      if (!active) return;
      if (open) {
        if (job) {
          setJobTitle(job.title || "");
          setJobDescription(job.description || "");
          setJobContract(job.type_of_contract || "CLT");
          setJobNeighborhood(job.neighborhood || "");
          setJobSalary(job.salary ? String(job.salary) : "");
          setJobRefEmail(job.ref_email || "");
          setJobQuantity(job.quantity ? String(job.quantity) : "1");
        } else {
          setJobTitle("");
          setJobDescription("");
          setJobContract("CLT");
          setJobNeighborhood("");
          setJobSalary("");
          setJobRefEmail("");
          setJobQuantity("1");
        }
        setJobError(null);
      }
    };
    initForm();
    return () => {
      active = false;
    };
  }, [open, job]);

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobSubmitting(true);
    setJobError(null);

    try {
      const payload = {
        title: jobTitle.trim(),
        description: jobDescription.trim(),
        type_of_contract: jobContract,
        neighborhood: jobNeighborhood.trim() || null,
        salary: jobSalary.trim() ? jobSalary.trim() : null,
        ref_email: jobRefEmail.trim() || null,
        quantity: jobQuantity.trim() ? parseInt(jobQuantity.trim()) : 1,
      };

      if (!job) {
        await createJob(payload);
        onSaveSuccess("Nova vaga criada com sucesso!");
      } else {
        await updateJob(job.id, payload);
        onSaveSuccess("Vaga atualizada com sucesso!");
      }
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "";
      setJobError(errMsg || "Erro ao salvar vaga. Tente novamente.");
    } finally {
      setJobSubmitting(false);
    }
  };

  const dialogTitleText = job ? "Editar Vaga" : "Publicar Nova Vaga";

  return (
    <Dialog
      open={open}
      onClose={() => !jobSubmitting && onClose()}
      maxWidth="md"
      fullWidth
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: { xs: 1, sm: 2 },
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(227, 207, 192, 0.2)",
          pb: 1.5,
        }}
      >
        <Typography variant="h6" component="span" sx={{ fontWeight: 800 }}>
          {dialogTitleText}
        </Typography>
        <IconButton onClick={onClose} disabled={jobSubmitting}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleJobSubmit}>
        <DialogContent sx={{ py: 3, px: 3 }}>
          {jobError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
              {jobError}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Cargo / Título da Vaga"
                placeholder="Ex: Desenvolvedor React, Auxiliar Administrativo"
                fullWidth
                required
                disabled={jobSubmitting}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tipo de Contrato"
                select
                fullWidth
                required
                disabled={jobSubmitting}
                value={jobContract}
                onChange={(e) => setJobContract(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              >
                <MenuItem value="CLT">CLT</MenuItem>
                <MenuItem value="PJ">PJ</MenuItem>
                <MenuItem value="FREELANCE">Freelance</MenuItem>
                <MenuItem value="INTERNSHIP">Estágio</MenuItem>
                <MenuItem value="TEMPORARY">Temporário</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Bairro de Jacareí"
                placeholder="Ex: Villa Branca, Centro, Jardim Sta Maria"
                fullWidth
                disabled={jobSubmitting}
                value={jobNeighborhood}
                onChange={(e) => setJobNeighborhood(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Salário Mensal (R$)"
                type="number"
                placeholder="Ex: 2500"
                fullWidth
                disabled={jobSubmitting}
                value={jobSalary}
                onChange={(e) => setJobSalary(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Quantidade de Vagas"
                type="number"
                placeholder="Ex: 1"
                fullWidth
                disabled={jobSubmitting}
                value={jobQuantity}
                onChange={(e) => setJobQuantity(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="E-mail de Referência do RH"
                type="email"
                placeholder="Deixe em branco para usar o geral da empresa"
                fullWidth
                disabled={jobSubmitting}
                value={jobRefEmail}
                onChange={(e) => setJobRefEmail(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Descrição Completa da Vaga"
                placeholder="Descreva as responsabilidades, requisitos, benefícios e horários da oportunidade de emprego..."
                fullWidth
                required
                multiline
                rows={8}
                disabled={jobSubmitting}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={jobSubmitting}
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
            disabled={jobSubmitting}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
              color: "#ffffff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2.5,
              px: 4,
              py: 1,
              boxShadow: "0 8px 24px rgba(74, 133, 182, 0.2)",
              "&:hover": {
                background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                boxShadow: "0 12px 32px rgba(74, 133, 182, 0.3)",
              },
            }}
          >
            {jobSubmitting ? <CircularProgress size={20} sx={{ color: "#ffffff" }} /> : "Salvar Vaga"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
