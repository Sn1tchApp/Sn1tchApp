import { useEffect, useState } from "react";
import styles from "../styles/Revisions.module.css";

export default function Home() {
  const [revisions, setRevisions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        const response = await fetch("/api/revisions");
        if (!response.ok) {
          throw new Error("Erro ao buscar revisões");
        }
        const data = await response.json();
        setRevisions(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRevisions();
  }, []);

  return (
    <div className={styles.container}>
      <a href="/" className={styles.backButtonTop}>
        Voltar para o Home
      </a> <br/><br/><br/><br/>
      <h1>Revisões do Documento</h1>
      <div className={styles.revisionsContainer}>
        {revisions.map((revision, index) => (
          <div key={index} className={styles.revisionBox}>
            <h2>Versão {revision.version}</h2>
            <p><strong>Autor:</strong> {revision.author}</p>
            <p><strong>Email:</strong> {revision.email}</p>
            <p><strong>Descrição:</strong> {revision.description || "Descrição não disponível"}</p>
            <p><strong>Última Modificação:</strong>{" "}
              {new Date(revision.modifiedTime).toLocaleString("pt-BR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
