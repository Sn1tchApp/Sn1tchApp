import React, { useEffect, useState } from "react";
import styles from '../styles/Compare.module.css'; // Adicionando o arquivo de estilos

const Compare = () => {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisons, setComparisons] = useState([]);

  const fetchRevisions = async () => {
    try {
      const response = await fetch("/api/listRevisions");
      if (!response.ok) {
        throw new Error(`Erro ao buscar revisões: ${response.statusText}`);
      }
      const data = await response.json();
      setRevisions(data);
    } catch (err) {
      setError(`Erro ao buscar revisões: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevision = async ( revision ) => {
    try {
      const response = await fetch(`/api/getRevision?revisionId=${revision}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar revisões: ${response.statusText}`);
      }
      const data = await response.json();
      setRevisions(data);
    } catch (err) {
      setError(`Erro ao buscar revisões: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async (rev1, rev2) => {
    try {
      console.log(`Buscando comparação entre ${rev1} e ${rev2}`);
      const response = await fetch(
        `/api/diffRevisions?rev1=${rev1}&rev2=${rev2}`
      );
      if (!response.ok) {
        throw new Error(`Erro ao buscar comparação: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Dados retornados pelo backend:", data);
      return data;
    } catch (err) {
      console.error(err);
      return { differences: "" };
    }
  };

  const generateComparisons = async () => {
    const comparisons = [];
    for (let i = 0; i < revisions.length - 1; i++) {
      const diff = await fetchComparison(revisions[i].id, revisions[i + 1].id);
      comparisons.push({
        rev1: revisions[i],
        rev2: revisions[i + 1],
        diff: diff,
      });
    }
    return comparisons;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await fetchRevisions();
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadComparisons = async () => {
      if (revisions.length > 1) {
        const results = await generateComparisons();
        console.log("Comparisons gerados:", results);
        setComparisons(results);
      }
    };
    loadComparisons();
  }, [revisions]);

  if (loading) {
    return <p>Carregando revisões...</p>;
  }

  if (error) {
    return <p className="text-red-500">Erro: {error}</p>;
  }

  return (
    <div className={styles.container}>
      <a href="/" className={styles.backButtonTop}>
        Voltar para o Home
      </a>
      <br /><br /><br />
      <h1 className={styles.title}>Comparação de Revisões</h1>

      {comparisons.length === 0 ? (
        <p>Nenhuma comparação encontrada.</p>
      ) : (
        comparisons.map((comp, index) => (
          <div key={index} className={styles.revisionBox}>
            <h3 className={styles.revisionTitle}>
              Comparação entre Revisão {comp.rev1.id} e Revisão {comp.rev2.id}
            </h3>
            <p>
              <strong>Data Revisão {comp.rev1.id}:</strong>{" "}
              {new Date(comp.rev1.modifiedTime).toLocaleString("pt-BR")}
            </p>
            <p>
              <strong>Data Revisão {comp.rev2.id}:</strong>{" "}
              {new Date(comp.rev2.modifiedTime).toLocaleString("pt-BR")}
            </p>
            <div className={styles.diffContainer}>
              {comp.diff && comp.diff.differences ? (
                comp.diff.differences.split("\n").map((line, idx) => (
                  <p
                    key={idx}
                    style={{
                      color: line.startsWith("+")
                        ? "green"
                        : line.startsWith("-")
                        ? "red"
                        : "black",
                    }}
                  >
                    {line}
                  </p>
                ))
              ) : (
                <p>Nenhuma diferença encontrada.</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Compare;