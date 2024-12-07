const { google } = require('googleapis');
const axios = require('axios');

// Autenticação para o Google Drive
const driveAuth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: "sn1tchapp",
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY, // Corrigido para formatar corretamente a chave privada
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
  },
  scopes: ["https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/drive.metadata.readonly"],
});

// Inicializando o cliente Google Drive
const drive = google.drive({ version: 'v3', auth: driveAuth });

// Função para verificar a existência do arquivo
async function verifyDocumentExistence(documentId) {
  try {
    const file = await drive.files.get({
      fileId: documentId,
      supportsAllDrives: true,
    });
    console.log("Arquivo encontrado:", file.data);
  } catch (error) {
    console.error("Erro ao verificar arquivo:", error.response);
  }
}

// Função para listar as revisões de um documento
async function getRevisions(documentId) {
  try {
    console.log("Verificando se o documento existe...");
    await verifyDocumentExistence(documentId); // Verifica se o arquivo existe

    // Solicitação para listar as revisões
    const revisionsResponse = await drive.revisions.list({
      fileId: documentId,
      pageSize: 10, // Atualizado para "pageSize", conforme a nova API
      supportsAllDrives: true,
    });

    if (revisionsResponse.data && revisionsResponse.data.revisions) {
      console.log("Revisões encontradas:", revisionsResponse.data.revisions);
      return revisionsResponse.data.revisions;
    } else {
      console.warn("Nenhuma revisão encontrada para o documento:", documentId);
      return [];
    }
  } catch (error) {
    // Tratamento de erros detalhado
    if (error.response) {
      console.error(`Erro ao obter revisões para o documento ID: ${documentId}`);
      console.error("Detalhes do erro:", error.response.data);
      console.error("Código de erro:", error.response.status);
    } else {
      console.error("Erro inesperado:", error.message);
    }
    return [];
  }
}

// Função para exportar o conteúdo de uma revisão para texto via URL com token Bearer
async function exportRevisionToTextViaURL(documentId, revisionId) {
  try {
    console.log(`Obtendo URL para exportar revisão ${revisionId}...`);

    // URL de exportação conforme o formato que você indicou
    const exportUrl = `https://docs.google.com/feeds/download/documents/export/Export?id=${documentId}&revision=${revisionId}&exportFormat=txt`;

    // Obter o token Bearer do driveAuth
    const authClient = await driveAuth.getClient();
    const token = await authClient.getAccessToken();

    // Configuração do cabeçalho com o token Bearer
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Requisição HTTP direta para o link de exportação com token Bearer no cabeçalho
    const response = await axios.get(exportUrl, { headers });

    // Verificar se a resposta tem conteúdo
    if (!response.data || response.data.trim().length === 0) {
      console.warn(`A revisão ${revisionId} não contém texto ou falhou ao exportar.`);
      return null;
    }

    return response.data.trim(); // Retornar o texto limpo de espaços extras
  } catch (error) {
    console.error(`Erro ao exportar revisão ${revisionId} via URL com token Bearer:`, error.message);
    return null;
  }
}

// Função para comparar duas versões de texto e exibir as mudanças de forma semelhante ao comando `diff` do Linux
function compareVersions(version1Content, version2Content) {
  const Diff = require('diff');

  // Quebrar o conteúdo das revisões em linhas
  const version1Lines = version1Content.split('\n');
  const version2Lines = version2Content.split('\n');

  // Usar diffLines para comparar linha por linha
  const diff = Diff.diffLines(version1Content, version2Content);

  // A função diffLines retorna um array com objetos que indicam se a linha foi adicionada ou removida
  let changes = [];

  // Iterar sobre as diferenças e formatar as saídas como no diff do Linux
  diff.forEach((part) => {
    if (part.added) {
      changes.push(`+ ${part.value}`);
    } else if (part.removed) {
      changes.push(`- ${part.value}`);
    }
  });

  // Se não houver diferenças, retornar uma mensagem de "nenhuma diferença encontrada"
  return changes.length > 0 ? changes.join('\n') : 'Nenhuma diferença encontrada.';
}

// Função principal para obter e comparar revisões
async function displayVersionHistory(documentId) {
  try {
    const revisions = await getRevisions(documentId);
    if (revisions.length === 0) {
      console.log(`Não foi possível obter revisões para o documento ID: ${documentId}`);
      return;
    }

    console.log("Revisões encontradas:", revisions);

    // Baixar e comparar as revisões
    for (let i = 0; i < revisions.length - 1; i++) {
      const revision1 = revisions[i];
      const revision2 = revisions[i + 1];

      console.log(`Comparando revisões: ${revision1.id} e ${revision2.id}`);

      const revision1Content = await exportRevisionToTextViaURL(documentId, revision1.id);
      const revision2Content = await exportRevisionToTextViaURL(documentId, revision2.id);

      console.log("Revisão 1:\n", revision1Content, "\n");
      console.log("Revisão 2:\n", revision2Content, "\n");

      if (revision1Content && revision2Content) {
        // Comparar conteúdo das revisões
        const diff = compareVersions(revision1Content, revision2Content);
        if (diff) {
          console.log("Diferenças encontradas:\n", diff);
        } else {
          console.log("Nenhuma diferença encontrada entre as revisões.");
        }
      } else {
        console.log("Erro ao obter conteúdo das revisões.");
      }
    }
  } catch (error) {
    console.error("Erro ao exibir o histórico de versões:", error);
  }
}

// ID do documento
const documentId = process.env.DOCUMENT_ID;  // Adicione o ID do seu documento aqui

console.log("ID do documento:", documentId);

// Chamar a função principal
displayVersionHistory(documentId);