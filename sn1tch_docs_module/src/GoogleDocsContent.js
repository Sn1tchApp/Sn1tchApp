import React, { useState, useEffect } from 'react';

const GoogleDocsContent = () => {
  const [docContent, setDocContent] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const googleDocId = '1QGdxrfbxO6IQZ9HmqV-BNnBrJcL6XRKVXWHIVCJgfEs'; // Insira o ID do Google Docs

  useEffect(() => {
    // Função para buscar o conteúdo do Google Docs
    const fetchGoogleDocsContent = async () => {
      const url = `https://docs.google.com/document/d/${googleDocId}/export?format=html`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Erro ao buscar conteúdo do Google Docs');
        }
        const content = await response.text();
        setDocContent(content); // Atualiza o estado com o conteúdo do documento
      } catch (error) {
        console.error('Erro:', error);
      }
    };

    // Função para buscar o título do Google Docs
    const fetchGoogleDocsTitle = async () => {
      const url = `https://docs.google.com/document/d/${googleDocId}/edit`;

      try {
        const response = await fetch(url);
        const text = await response.text();
        const titleMatch = text.match(/<title>(.*?)<\/title>/);
        if (titleMatch) {
          setDocTitle(titleMatch[1]); // Atualiza o título do documento
        }
      } catch (error) {
        console.error('Erro ao buscar título:', error);
      }
    };

    // Chama as funções ao carregar o componente
    fetchGoogleDocsContent();
    fetchGoogleDocsTitle();
  }, [googleDocId]);

  return (
    <div>
      <h1>{docTitle}</h1> {/* Exibe o nome do documento */}
      <div dangerouslySetInnerHTML={{ __html: docContent }} /> {/* Exibe o conteúdo formatado */}
    </div>
  );
};

export default GoogleDocsContent;
