/**
 * Mock data helpers for integration testing.
 */

export const MOCK_JOBS = [
  {
    id: 1,
    title: "Desenvolvedor Full Stack Django/Next.js",
    description: "Vaga para desenvolvedor full stack experiente.",
    company: "Empresa Tecnologia Jacareí",
    location: "Jacareí - SP",
    neighborhood: "Centro",
    salary: "R$ 8.000,00",
    external_link: null,
    is_active: true,
    created_at: "2026-06-23T12:00:00Z",
    status: "active",
    type_of_contract: "CLT",
    ref_email: "vagas@techjacarei.com.br",
    quantity: 1,
    views_count: 10,
    clicks_count: 5,
    candidacies_count: 2,
    source: "local",
  },
  {
    id: 2,
    title: "Estagiário de Front-end",
    description: "Oportunidade para estudantes na área de front-end com Next.js.",
    company: "Agência Digital Vale",
    location: "Jacareí - SP",
    neighborhood: "Villa Branca",
    salary: "R$ 1.500,00",
    external_link: null,
    is_active: true,
    created_at: "2026-06-23T14:30:00Z",
    status: "active",
    type_of_contract: "Estágio",
    ref_email: "rh@agenciavale.com.br",
    quantity: 2,
    views_count: 20,
    clicks_count: 12,
    candidacies_count: 4,
    source: "local",
  }
];

export const MOCK_COMPANY = {
  id: 101,
  name: "Empresa Tecnologia Jacareí",
  cnpj: "12.345.678/0001-99",
  email: "contato@techjacarei.com.br",
  phone: "(12) 99999-9999",
  address: "Rua das Flores",
  number: "123",
  neighborhood: "Centro",
  cep: "12300-000",
  description: "Líder em inovação tecnológica na região de Jacareí."
};

export const MOCK_CANDIDACIES = [
  {
    id: 10,
    job: 1,
    full_name: "João Silva da Costa",
    email: "joao.silva@email.com",
    phone: "(12) 98888-8888",
    resume: "http://localhost:8000/media/resumes/joao_resume.pdf",
    created_at: "2026-06-23T15:00:00Z"
  },
  {
    id: 11,
    job: 1,
    full_name: "Maria Oliveira Santos",
    email: "maria.oliveira@email.com",
    phone: "(12) 97777-7777",
    resume: "http://localhost:8000/media/resumes/maria_resume.pdf",
    created_at: "2026-06-23T16:15:00Z"
  }
];
