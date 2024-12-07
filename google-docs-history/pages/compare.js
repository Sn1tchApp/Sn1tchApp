import React, { useEffect, useState } from "react";

const Compare = () => {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  };

  const fetchRevisionsWithRetry = async (retries = 1, delay = 30000) => {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetchWithTimeout("/api/compare", { method: "GET" }, 30000); // Timeout de 30 segundos
        if (!response.ok) {
          throw new Error(`Erro ao buscar revisões: ${response.statusText}`);
        }
        
        const data = await response.json();

        // Verificar se a resposta contém as revisões e a estrutura esperada
        if (!Array.isArray(data)) {
          throw new Error("Formato de dados inválido: Esperado um array de revisões.");
        }

        setRevisions(data);
        return; // Se a requisição for bem-sucedida, sai da função
      } catch (err) {
        lastError = err;
        if (i < retries - 1) {
          console.log(`Tentando novamente... (${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay)); // Espera antes de tentar novamente
        }
      }
    }
    throw lastError; // Lança o último erro após as tentativas
  };

  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchRevisionsWithRetry(); // Chama a função com a lógica de retentativa
      } catch (err) {
        setError(`Erro ao buscar revisões: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRevisions();
  }, []);

  if (loading) {
    return <p>Carregando revisões...</p>;
  }

  if (error) {
    return <p className="text-red-500">Erro: {error}</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Comparação de Revisões</h1>
      {revisions.length === 0 ? (
        <p>Nenhuma revisão encontrada.</p>
      ) : (
        revisions.map((rev, index) => (
          <div
            key={index}
            className="border border-gray-300 p-4 mb-4 rounded-lg"
          >
            <h3 className="text-lg font-semibold">
              Revisão {rev.revision}
            </h3>
            <p>
              <strong>Data:</strong>{" "}
              {rev.modifiedTime ? new Date(rev.modifiedTime).toLocaleString() : "Data não disponível"}
            </p>
            <div className="mt-2">
              {/* Verifique se 'rev.diff' é um array e tem conteúdo */}
              {Array.isArray(rev.diff) && rev.diff.length > 0 ? (
                rev.diff.map(([type, text], idx) => (
                  <span
                    key={idx}
                    className={
                      type === -1
                        ? "text-red-500"
                        : type === 1
                        ? "text-green-500"
                        : "text-gray-800"
                    }
                  >
                    {text}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">Nenhuma diferença encontrada.</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Compare;