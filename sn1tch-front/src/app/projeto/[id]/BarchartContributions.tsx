"use client";
import "chart.js/auto";
import { Bar } from "react-chartjs-2";

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

const BarchartContributions = ({
  userSummary,
}: {
  userSummary?: {
    userEmail: string;
    userSummary: string;
    contributionCounts: { type: string; count: number }[];
  }[];
}) => {
  if (!userSummary) {
    return null;
  }

  const labels = userSummary.map((item) => item.userEmail);

  // considerando a estrutura de dados de userSummary
  // escreva um código que permita que o bar apresente a quantidade de contribuições de cada tipo por usuário

  const data = {
    labels: labels,
    datasets: Object.keys(COLORS).map((key) => ({
      label: key,
      data: userSummary.map(
        (item) =>
          item.contributionCounts.find((c) => c.type === key)?.count || 0
      ),
      backgroundColor: COLORS[key as keyof typeof COLORS],
    })),
  };

  return <Bar data={data} />;
};

export default BarchartContributions;
