import React, { useEffect, useState } from "react";
import styles from "../styles/TimelineHorizontal.module.css";

const Timeline = () => {
  const [monthlyRevisions, setMonthlyRevisions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        const response = await fetch("/api/revisions");
        if (!response.ok) {
          throw new Error("Erro ao buscar as revisões.");
        }
        const data = await response.json();

        // Agrupar revisões por mês
        const groupedRevisions = data.reduce((acc, rev) => {
          const month = new Date(rev.modifiedTime).toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
          });
          if (!acc[month]) acc[month] = [];
          acc[month].push(rev);
          return acc;
        }, {});

        setMonthlyRevisions(groupedRevisions);
      } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevisions();
  }, []);

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className={styles.container}>
      <a href="/" className={styles.backButtonTop}>
        Voltar para o Home
      </a><br/><br/><br/>
      <h1>Timeline Mensal com Contribuições</h1>
      <div className={styles.timeline}>
        {Object.entries(monthlyRevisions).map(([month, revisions]) => (
          <div key={month} className={styles.timelineItem}>
            <h2 className={styles.month}>{month}</h2>
            <ul className={styles.revisionsList}>
              {revisions.map((rev) => (
                <li key={rev.id} className={styles.revision}>
                  <p>
                    <strong>Autor:</strong> {rev.author}
                  </p>
                  <p>
                    <strong>Descrição:</strong> {rev.description || "Sem descrição"}
                  </p>
                  <p>
                    <strong>Modificado em:</strong>{" "}
                    {new Date(rev.modifiedTime).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;