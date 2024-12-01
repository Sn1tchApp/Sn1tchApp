import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import styles from "../styles/Charts.module.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Stats = () => {
  const [revisions, setRevisions] = useState([]);
  const [pieData, setPieData] = useState({});
  const [barData, setBarData] = useState({});

  useEffect(() => {
    const fetchRevisions = async () => {
      const response = await fetch("/api/revisions");
      const data = await response.json();
      setRevisions(data);

      // Processar os dados para gráficos
      processPieData(data);
      processBarData(data);
    };

    fetchRevisions();
  }, []);

  const processPieData = (data) => {
    const contributionsByUser = data.reduce((acc, rev) => {
      acc[rev.author] = (acc[rev.author] || 0) + 1;
      return acc;
    }, {});

    setPieData({
      labels: Object.keys(contributionsByUser),
      datasets: [
        {
          label: "Contribuições por Autor",
          data: Object.values(contributionsByUser),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
          ],
        },
      ],
    });
  };

  const processBarData = (data) => {
    const contributionsByMonth = {};
  
    // Agrupar as contribuições por mês e autor
    data.forEach((rev) => {
      const date = new Date(rev.modifiedTime);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!contributionsByMonth[monthYear]) {
        contributionsByMonth[monthYear] = {};
      }
      contributionsByMonth[monthYear][rev.author] =
        (contributionsByMonth[monthYear][rev.author] || 0) + 1;
    });
  
    // Ordenar os meses de forma cronológica
    const months = Object.keys(contributionsByMonth)
      .map((month) => {
        const [monthNum, year] = month.split('/');
        return { monthNum: parseInt(monthNum, 10), year: parseInt(year, 10), original: month };
      })
      .sort((a, b) => {
        if (a.year === b.year) {
          return a.monthNum - b.monthNum; // Ordena por mês, se o ano for o mesmo
        }
        return a.year - b.year; // Ordena por ano
      })
      .map((item) => item.original); // Retorna para o formato original de `MM/YYYY`
  
    // Extrair os autores de forma única
    const authors = Array.from(new Set(data.map((rev) => rev.author)));
  
    // Preparar os datasets para cada autor
    const datasets = authors.map((author) => ({
      label: author,
      data: months.map(
        (month) => contributionsByMonth[month][author] || 0
      ),
      backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    }));
  
    // Atualizar os dados do gráfico de barras
    setBarData({
      labels: months,
      datasets: datasets,
    });
  };

  return (
    <div className={styles.container}>
      <a href="/" className={styles.backButtonTop}>
        Voltar para o Home
      </a>
      <h1>Estatísticas de Contribuições</h1>

      <div className={`${styles.chartContainer} ${styles.pieChart}`}>
        <h2>Gráfico de Pizza - Contribuições por Usuário</h2>
        {pieData.labels ? (
          <Pie data={pieData} />
        ) : (
          <p>Carregando dados do gráfico...</p>
        )}
      </div>

      <div className={styles.chartContainer}>
        <h2>Gráfico de Barra - Contribuições ao Longo do Tempo</h2>
        {barData.labels ? (
          <Bar
            data={barData}
            options={{
              responsive: true,
              scales: {
                x: {
                  title: { display: true, text: "Meses" },
                },
                y: {
                  title: { display: true, text: "Contribuições" },
                  beginAtZero: true,
                },
              },
              plugins: {
                legend: {
                  position: "top",
                },
              },
            }}
          />
        ) : (
          <p>Carregando dados do gráfico...</p>
        )}
      </div>
    </div>
  );
};

export default Stats;