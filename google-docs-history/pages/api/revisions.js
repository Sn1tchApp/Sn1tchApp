import { google } from "googleapis";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Only GET requests are allowed" });
    return;
  }

  try {
    console.log("API Drive Activity sendo chamada");

    // Configurar autenticação
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), process.env.SERVICE_ACCOUNT_KEY),
      scopes: ["https://www.googleapis.com/auth/drive.activity.readonly"],
    });

    const driveActivity = google.driveactivity({ version: "v2", auth });

    // ID do documento
    const documentId = process.env.DOCUMENT_ID;

    // Obter atividades relacionadas ao documento
    const activityResponse = await driveActivity.activity.query({
      requestBody: {
        itemName: `items/${documentId}`,
        pageSize: 10, // Limite de 10 atividades recentes
      },
    });

    console.log("Drive Activity Response:", activityResponse.data);

    const activities = activityResponse.data.activities || [];

    // Formatando os dados para exibição
    const formattedActivities = activities.map((activity, index) => {
      // Extrair o autor (actor)
      const actor = activity.actors?.[0]?.user?.knownUser;
      let author = "Autor desconhecido";
      let email = "Email desconhecido";

      if (actor) {
        author = actor.personName || "Nome desconhecido"; // Nome do autor
        email = actor.email || "Email desconhecido"; // Email do autor
      }

      // Extrair a descrição
      const actionDetail = activity.primaryActionDetail;
      let description = "Descrição não disponível";

      if (actionDetail?.edit) {
        description = "Edição realizada";
      } else if (actionDetail?.comment) {
        description = "Comentário adicionado";
      } else if (actionDetail?.create) {
        description = "Documento criado";
      }

      return {
        version: `Revisão ${index + 1}`, // Exemplo para identificar a "versão"
        modifiedTime: activity.timestamp || "Data não disponível",
        author,
        email,
        description,
      };
    });

    res.status(200).json(formattedActivities);
  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
    res.status(500).json({ error: "Erro ao buscar atividades" });
  }
}