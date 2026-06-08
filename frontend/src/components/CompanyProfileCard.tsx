"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { type Company } from "@/lib/api";

interface CompanyProfileCardProps {
  company: Company;
}

export default function CompanyProfileCard({ company }: CompanyProfileCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        background: "#FFFFFF",
        border: "1px solid rgba(227, 207, 192, 0.4)",
        borderRadius: 4,
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          variant="rounded"
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2.5,
            background: "linear-gradient(135deg, #8FBAE3 0%, #F1A990 100%)",
            color: "#FFFFFF",
          }}
        >
          <LocationCityIcon sx={{ fontSize: 30 }} />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "#2A3543",
              lineHeight: 1.2,
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {company.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            CNPJ: {company.cnpj}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          borderTop: "1px solid rgba(227, 207, 192, 0.3)",
          pt: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <EmailIcon sx={{ color: "#4A85B6", fontSize: 20 }} />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>
              E-mail de Contato
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {company.email}
            </Typography>
          </Box>
        </Box>

        {company.phone && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PhoneIcon sx={{ color: "#E0876A", fontSize: 20 }} />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>
                Telefone
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {company.phone}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Box sx={{ mt: "auto", pt: 2 }}>
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ borderRadius: 2.5 }}>
          Empresa registrada e ativa.
        </Alert>
      </Box>
    </Card>
  );
}
