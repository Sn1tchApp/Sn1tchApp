import { useEffect, useState } from "react";

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
    <div>
      <h1>Histórico de Versões</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {revisions.map((rev) => (
          <li key={rev.id}>
            <strong>Versão {rev.id}</strong> - Modificada em:{" "}
            {new Date(rev.modifiedTime).toLocaleString()}<br />
            <strong>Autor:</strong> {rev.author}<br />
            <strong>Descrição:</strong> {rev.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
