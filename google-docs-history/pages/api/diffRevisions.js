    import { google } from "googleapis";
    import Diff from "diff";
    const axios = require('axios');

    const driveAuth = new google.auth.GoogleAuth({
    credentials: {
        type: "service_account",
        project_id: "sn1tchapp",
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth: driveAuth });

    // Função para exportar o conteúdo de uma revisão para texto via URL com token Bearer
    async function exportRevisionToTextViaURL(documentId, revisionId) {
        try {
        console.log(`Obtendo URL para exportar revisão ${revisionId}...`);
    
        // URL de exportação conforme o formato que você indicou
        const exportUrl = `https://docs.google.com/feeds/download/documents/export/Export?id=${documentId}&revision=${revisionId}&exportFormat=txt`;
    
        //console.log(`Exportando revisão ${revisionId} via URL:`, exportUrl);
        // Obter o token Bearer do driveAuth
        const authClient = await driveAuth.getClient();
        const token = await authClient.getAccessToken();
    
        // Configuração do cabeçalho com o token Bearer
        const headers = {
            Authorization: `Bearer ${token}`,
        };
    
        // Requisição HTTP direta para o link de exportação com token Bearer no cabeçalho
        const response = await axios.get(exportUrl, { headers });

        //console.log(`\nResposta da exportação da revisão ${revisionId}:\n`, response.data, '\n---\n');
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
    
        //console.log(`Linhas da revisão 1 (${version1Lines.length}):\n`, version1Lines);
        //console.log(`Linhas da revisão 2 (${version2Lines.length}):\n`, version2Lines);
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

    export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const documentId = process.env.DOCUMENT_ID;

    const { rev1, rev2 } = req.query;

    //console.log("Query recebida:", req.query);
    //console.log("Document ID:", documentId);
    //console.log("Revision ID 1:", rev1);
    //console.log("Revision ID 2:", rev2);

    try {
        const revision1Content = await exportRevisionToTextViaURL(documentId, rev1);
        const revision2Content = await exportRevisionToTextViaURL(documentId, rev2);

        const differences = compareVersions(revision1Content, revision2Content);

        //console.log("\nDiferenças encontradas:\n ", differences, "\n---\n");

        return res.status(200).json({ differences });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    }