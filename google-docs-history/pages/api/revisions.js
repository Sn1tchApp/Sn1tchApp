import { google } from "googleapis";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Only GET requests are allowed" });
    return;
  }

  try {
    // Configure o cliente de autenticação
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), process.env.SERVICE_ACCOUNT_KEY),
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Obtenha o histórico de versões
    const documentId = process.env.DOCUMENT_ID;
    const response = await drive.revisions.list({
      fileId: documentId,
    });

    // Formatar as revisões para incluir o autor e a descrição
    const revisionsWithAuthorsAndDescriptions = response.data.revisions.map((rev) => ({
      ...rev,
      author: rev.lastModifyingUser
        ? `${rev.lastModifyingUser.displayName} (${rev.lastModifyingUser.emailAddress})`
        : "Autor desconhecido",
      description: rev.description || "Sem descrição fornecida",
    }));

    res.status(200).json(revisionsWithAuthorsAndDescriptions);
  } catch (error) {
    console.error("Erro ao buscar revisões:", error);
    res.status(500).json({ error: "Erro ao buscar revisões" });
  }
}