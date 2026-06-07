"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import { applyToJob, type Job } from "@/lib/api";
import { formatPhone } from "@/utils/formatters";

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
  job: Job;
}

export default function ApplyModal({ open, onClose, job }: ApplyModalProps) {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext && ["pdf", "doc", "docx"].includes(ext)) {
        setResumeFile(file);
        setFieldErrors((prev) => ({ ...prev, resume: [] }));
      } else {
        setResumeFile(null);
        setFieldErrors((prev) => ({
          ...prev,
          resume: ["Apenas arquivos PDF, DOC e DOCX são permitidos."],
        }));
      }
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setFullName("");
    setEmail("");
    setPhone("");
    setResumeFile(null);
    setSuccess(false);
    setFormError(null);
    setFieldErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const errors: Record<string, string[]> = {};
    if (!fullName.trim()) errors.full_name = ["O nome completo é obrigatório."];
    if (!email.trim()) {
      errors.email = ["O e-mail é obrigatório."];
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = ["E-mail inválido."];
    }
    if (!phone.trim()) {
      errors.phone = ["O telefone é obrigatório."];
    } else if (phone.replace(/\D/g, "").length < 10) {
      errors.phone = ["Telefone deve conter DDD e número válido."];
    }
    if (!resumeFile) errors.resume = ["O currículo é obrigatório."];

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    try {
      await applyToJob(job.id, formData);
      setSuccess(true);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "";
      try {
        const errJson = JSON.parse(errMsg);
        if (errJson && typeof errJson === "object") {
          setFieldErrors(errJson as Record<string, string[]>);
          setFormError("Por favor, corrija os erros no formulário.");
        } else {
          setFormError("Erro ao enviar candidatura. Tente novamente.");
        }
      } catch {
        setFormError(
          errMsg || "Erro ao conectar-se ao servidor. Tente novamente mais tarde."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            background: "#FFFFFF",
            border: "1px solid rgba(227, 207, 192, 0.4)",
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.08)",
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
          pb: 1,
          borderBottom: "1px solid rgba(227, 207, 192, 0.2)",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#2A3543" }}>
            Candidatura Rápida
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            Vaga: {job.title} - {job.company}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={submitting}
          sx={{
            border: "1px solid rgba(227, 207, 192, 0.4)",
            borderRadius: 2.5,
            color: "text.secondary",
            "&:hover": { background: "#FAF6F0" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {success ? (
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 6,
            px: 3,
            textAlign: "center",
          }}
        >
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: "success.light",
              color: "success.main",
              mb: 3,
              boxShadow: "0 8px 24px rgba(46, 125, 50, 0.15)",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#2E7D32" }}>
            Candidatura Enviada!
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 360, lineHeight: 1.6 }}>
            Seu currículo foi enviado com sucesso para o RH da empresa. Fique atento ao seu e-mail e telefone para futuros contatos.
          </Typography>
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
              color: "#ffffff",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2.5,
              px: 5,
              py: 1.25,
              boxShadow: "0 8px 24px rgba(74, 133, 182, 0.2)",
              "&:hover": {
                background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
                boxShadow: "0 12px 32px rgba(74, 133, 182, 0.3)",
              },
            }}
          >
            Fechar Janela
          </Button>
        </DialogContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ py: 3, px: 3 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
                {formError}
              </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Nome Completo"
                placeholder="Digite seu nome completo"
                fullWidth
                required
                disabled={submitting}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.full_name) {
                    setFieldErrors((prev) => ({ ...prev, full_name: [] }));
                  }
                }}
                error={!!fieldErrors.full_name?.length}
                helperText={fieldErrors.full_name?.[0]}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                  },
                }}
              />

              <TextField
                label="E-mail"
                type="email"
                placeholder="seu.email@exemplo.com"
                fullWidth
                required
                disabled={submitting}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: [] }));
                  }
                }}
                error={!!fieldErrors.email?.length}
                helperText={fieldErrors.email?.[0]}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                  },
                }}
              />

              <TextField
                label="Telefone / WhatsApp"
                placeholder="(12) 99999-9999"
                fullWidth
                required
                disabled={submitting}
                value={phone}
                onChange={(e) => {
                  handlePhoneChange(e);
                  if (fieldErrors.phone) {
                    setFieldErrors((prev) => ({ ...prev, phone: [] }));
                  }
                }}
                error={!!fieldErrors.phone?.length}
                helperText={fieldErrors.phone?.[0]}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                  },
                }}
              />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
                  Currículo (Apenas PDF, DOC ou DOCX) *
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                  disabled={submitting}
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    py: 3,
                    border: "2px dashed",
                    borderColor: !!fieldErrors.resume?.length ? "error.main" : "rgba(227, 207, 192, 0.6)",
                    borderRadius: 3,
                    textTransform: "none",
                    color: "text.primary",
                    background: "#FAF6F0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    "&:hover": {
                      borderColor: "primary.main",
                      background: "#FFF8F2",
                    },
                  }}
                >
                  {resumeFile ? "Alterar arquivo selecionado" : "Selecionar arquivo de currículo"}
                  <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                </Button>

                {resumeFile ? (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1.5,
                      fontWeight: 600,
                      color: "success.main",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    ✓ {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    Nenhum arquivo selecionado. O arquivo deve ter no máximo 10MB.
                  </Typography>
                )}

                {!!fieldErrors.resume?.length && (
                  <Typography variant="caption" color="error.main" sx={{ display: "block", mt: 1, fontWeight: 500 }}>
                    {fieldErrors.resume[0]}
                  </Typography>
                )}
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={submitting}
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
              variant="contained"
              type="submit"
              disabled={submitting}
              sx={{
                background: "linear-gradient(135deg, #4A85B6 0%, #2A3543 100%)",
                color: "#ffffff",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2.5,
                px: 4,
                py: 1,
                boxShadow: "0 8px 20px rgba(74, 133, 182, 0.15)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4A85B6 0%, #2A3543 100%)",
                  boxShadow: "0 12px 28px rgba(74, 133, 182, 0.25)",
                },
              }}
            >
              {submitting ? "Enviando..." : "Confirmar Candidatura"}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
}
