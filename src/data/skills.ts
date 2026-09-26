export interface Skill {
  id: string
  index: string
  title: string
  claim: string
  description: string
  tags: string[]
  accent: string
  /** Video time (seconds) where this chapter starts fading in. */
  start: number
  /** Video time (seconds) where this chapter starts fading out. */
  end: number
}

// Background.mp4 runs 16.2s. Each chapter owns a slice of that timeline,
// so the copy appears exactly in step with the flythrough.
export const VIDEO_DURATION = 16.2

export const SKILLS: Skill[] = [
  {
    id: "landing",
    index: "01",
    title: "Landing pages",
    claim: "Sitios que convierten.",
    description:
      "Diseño y desarrollo páginas de aterrizaje rápidas, responsive y pensadas para una sola cosa: que el visitante actúe. Carga instantánea, jerarquía clara y medición desde el primer día.",
    tags: ["React", "Next.js", "Tailwind", "SEO", "Core Web Vitals"],
    accent: "#4fd1ff",
    start: 0.6,
    end: 3.4,
  },
  {
    id: "automatizaciones",
    index: "02",
    title: "Automatizaciones",
    claim: "Flujos que trabajan solos.",
    description:
      "Conecto tus herramientas y elimino el trabajo manual: integraciones entre APIs, tareas programadas, sincronización de datos y avisos que llegan cuando importan.",
    tags: ["APIs", "Webhooks", "n8n", "Cron", "Integraciones"],
    accent: "#7c9cff",
    start: 3.4,
    end: 6.2,
  },
  {
    id: "agentes",
    index: "03",
    title: "Agentes",
    claim: "Asistentes que razonan y ejecutan.",
    description:
      "Construyo agentes de IA conectados a tus datos y herramientas reales. Atienden, consultan, deciden y ejecutan acciones dentro de tus sistemas, no en una ventana aparte.",
    tags: ["LLMs", "MCP", "RAG", "Tooling", "Orquestación"],
    accent: "#b388ff",
    start: 6.2,
    end: 9.0,
  },
  {
    id: "base-de-datos",
    index: "04",
    title: "Base de datos",
    claim: "La memoria de tu negocio.",
    description:
      "Modelado, consultas y rendimiento. Diseño esquemas que crecen sin romperse y garantizo que la información sea consistente, consultable y segura.",
    tags: ["PostgreSQL", "SQL", "Modelado", "Índices", "Optimización"],
    accent: "#4ff0b7",
    start: 9.0,
    end: 11.8,
  },
  {
    id: "electronica",
    index: "05",
    title: "Reparación de circuitos electrónicos",
    claim: "Hardware que vuelve a vivir.",
    description:
      "Diagnóstico y reparación a nivel de componente: placas madre, fuentes y equipos que otros dan por perdidos. Soldadura de precisión, medición y puesta a prueba real.",
    tags: ["Diagnóstico", "Soldadura SMD", "Microelectrónica", "Multímetro"],
    accent: "#ffb454",
    start: 11.8,
    end: 14.6,
  },
]

/** Video time where the closing tagline appears (after the last chapter). */
export const CLOSING_START = 14.8
