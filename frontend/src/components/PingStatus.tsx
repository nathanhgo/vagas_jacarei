"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import WifiIcon from "@mui/icons-material/Wifi";
import { fetchPing, type PingResponse } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

export default function PingStatus() {
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<PingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkPing = async () => {
    setStatus("loading");
    setError(null);
    try {
      const response = await fetchPing();
      setData(response);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setStatus("error");
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkPing();
  }, []);

  const statusConfig = {
    idle: { color: "default" as const, label: "Aguardando", icon: null },
    loading: { color: "default" as const, label: "Verificando...", icon: null },
    success: { color: "success" as const, label: "Conectado", icon: <CheckCircleIcon fontSize="small" /> },
    error: { color: "error" as const, label: "Erro de Conexão", icon: <ErrorIcon fontSize="small" /> },
  };

  const currentConfig = statusConfig[status];

  return (
    <Card
      elevation={0}
      sx={{
        maxWidth: 480,
        width: "100%",
        position: "relative",
        overflow: "visible",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: -1,
          borderRadius: "inherit",
          padding: "1px",
          background:
            status === "success"
              ? "linear-gradient(135deg, #22D3A0, #4F8EF7)"
              : status === "error"
                ? "linear-gradient(135deg, #F85149, #D29922)"
                : "linear-gradient(135deg, #30363D, #21262D)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: "linear-gradient(135deg, #4F8EF7 0%, #22D3A0 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WifiIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                Status da API
              </Typography>
              <Typography variant="caption" color="text.secondary">
                GET /api/ping/
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              size="small"
              label={currentConfig.label}
              color={currentConfig.color}
              icon={currentConfig.icon ?? undefined}
              sx={{ fontWeight: 600 }}
            />
            <Tooltip title="Verificar novamente">
              <span>
                <IconButton
                  size="small"
                  onClick={checkPing}
                  disabled={status === "loading"}
                  sx={{
                    color: "text.secondary",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  <RefreshIcon
                    fontSize="small"
                    sx={{
                      animation: status === "loading" ? "spin 1s linear infinite" : "none",
                      "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
                    }}
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.06)" }} />

        {/* Content */}
        {status === "loading" && (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={32} thickness={4} />
          </Box>
        )}

        {status === "success" && data && (
          <Box display="flex" flexDirection="column" gap={1.5}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Mensagem
              </Typography>
              <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                {data.message}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">
                {data.status}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Django
              </Typography>
              <Chip label={`v${data.django_version}`} size="small" variant="outlined" sx={{ fontFamily: "monospace", fontSize: "0.7rem" }} />
            </Box>
          </Box>
        )}

        {status === "error" && (
          <Box
            sx={{
              background: "rgba(248, 81, 73, 0.08)",
              border: "1px solid rgba(248, 81, 73, 0.2)",
              borderRadius: 2,
              p: 1.5,
            }}
          >
            <Typography variant="body2" color="error.main" fontFamily="monospace" fontSize="0.8rem">
              {error}
            </Typography>
          </Box>
        )}

        {/* Footer */}
        {lastChecked && (
          <Typography variant="caption" color="text.secondary" display="block" textAlign="right" mt={2}>
            Última verificação: {lastChecked.toLocaleTimeString("pt-BR")}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
