"use client";
import "chart.js/auto";
import { Doughnut } from "react-chartjs-2";

const COLORS = {
  Documentação: "#4CAF50",
  Frontend: "#FF9800",
  Backend: "#2196F3",
  "Infraestrutura e DevOps": "#F44336",
  "Gerenciamento do Projeto": "#9C27B0",
  "Testes e Qualidade": "#FFC107",
  "Pesquisa e Desenvolvimento": "#00BCD4",
  "Integração e Comunicação": "#795548",
};

const DognutContributions = ({
  userSummary,
}: {
  userSummary?: {
    userEmail: string;
    userSummary: string;
    contributionCounts: { type: string; count: number }[];
  };
}) => {
  if (!userSummary) {
    return null;
  }

  const labels = userSummary.contributionCounts.map((item) => item.type);

  const colors = labels.map((label) => COLORS[label as keyof typeof COLORS]);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Tipos de contribuições",
        data: userSummary.contributionCounts.map((item) => item.count),
        backgroundColor: colors,
        hoverOffset: 4,
      },
    ],
  };

  return <Doughnut data={data} />;
};

export default DognutContributions;
