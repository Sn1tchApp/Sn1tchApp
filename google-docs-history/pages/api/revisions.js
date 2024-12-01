import { google } from "googleapis";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Only GET requests are allowed" });
    return;
  }

  try {
    console.log("API Drive Activity sendo chamada");
    //console.log("Autenticação configurada:", process.env.GOOGLE_PRIVATE_KEY_ID);
    //console.log("Autenticação configurada:", process.env.GOOGLE_PRIVATE_KEY);
    //console.log("Autenticação configurada:", process.env.GOOGLE_CLIENT_EMAIL);
    //console.log("Autenticação configurada:", process.env.GOOGLE_CLIENT_ID);
    // Configurar autenticação para Drive Activity
    const driveAuth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: "sn1tchapp",
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url:
          "https://www.googleapis.com/robot/v1/metadata/x509/sn1tchapp%40sn1tchapp.iam.gserviceaccount.com",
        universe_domain: "googleapis.com",
      },
      scopes: ["https://www.googleapis.com/auth/drive.activity.readonly"],
    });

    
    // Configurar autenticação para Directory API
    const directoryAuth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: "sn1tchapp",
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url:
          "https://www.googleapis.com/robot/v1/metadata/x509/sn1tchapp%40sn1tchapp.iam.gserviceaccount.com",
        universe_domain: "googleapis.com",
      },
      scopes: ["https://www.googleapis.com/auth/admin.directory.user.readonly"],
    });

    const driveActivity = google.driveactivity({ version: "v2", auth: driveAuth });

    // Função para buscar o nome de usuário com o Account ID
    async function getUserName(accountId) {
      console.log("Buscando nome do usuário:", accountId);
      try {
        const authClient = await directoryAuth.getClient();

        // Impersonar um administrador do Google Workspace
        authClient.subject = "mwl@cesar.school"; // Substitua pelo e-mail do administrador

        const directory = google.admin({ version: "directory_v1", auth: authClient });

        // Obter o nome do usuário pelo Account ID
        const res = await directory.users.get({
          userKey: accountId, // ID único ou e-mail do usuário
        });

        return res.data.name.fullName || "Nome desconhecido";
      } catch (err) {
        console.error("Erro ao buscar nome do usuário:", err.message);
        return "Nome desconhecido";
      }
    }

    // ID do documento
    const documentId = process.env.DOCUMENT_ID;
    console.log("ID do documento:", documentId);

    // Obter atividades relacionadas ao documento
    const activityResponse = await driveActivity.activity.query({
      requestBody: {
        itemName: `items/${documentId}`,
        pageSize: 1,
      },
    });

    const activities = activityResponse.data.activities || [];
    const formattedActivities = [];

    for (const activity of activities) {
      console.log("Atividade:", activity);
      const actor = activity.actors?.[0]?.user?.knownUser.personName;
      const accountId = actor?.split("/")[1];

      const author = accountId ? await getUserName(accountId) : "Autor desconhecido";

      const actionDetail = activity.primaryActionDetail;
      let description = "Descrição não disponível";

      if (actionDetail?.edit) {
        description = "Edição realizada";
      } else if (actionDetail?.comment) {
        description = "Comentário adicionado";
      } else if (actionDetail?.create) {
        description = "Documento criado";
      }

      formattedActivities.push({
        version: formattedActivities.length + 1,
        modifiedTime: activity.timestamp || "Data não disponível",
        author,
        description,
      });
    }

    res.status(200).json(formattedActivities);
  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
    res.status(500).json({ error: "Erro ao buscar atividades" });
  }
}