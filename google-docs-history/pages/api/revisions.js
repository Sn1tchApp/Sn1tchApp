import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Only GET requests are allowed" });
    return;
  }

  try {
    console.log("API Drive Activity sendo chamada");

    // Configurar autenticação para Drive Activity
    const driveAuth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: "sn1tchapp",
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
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
      },
      scopes: ["https://www.googleapis.com/auth/admin.directory.user.readonly"],
    });

    const driveActivity = google.driveactivity({ version: "v2", auth: driveAuth });

    // Cache para armazenar nomes e e-mails de usuários
    const userCache = new Map();

    // Função para buscar o nome e o e-mail do usuário com o Account ID
    async function getUserInfo(accountId) {
      if (userCache.has(accountId)) {
        console.log(`Informações do usuário encontradas no cache: ${accountId}`);
        return userCache.get(accountId);
      }

      console.log("Buscando informações do usuário:", accountId);
      try {
        const authClient = await directoryAuth.getClient();
        authClient.subject = process.env.GOOGLE_ADMIN_ACCOUNT;

        const directory = google.admin({ version: "directory_v1", auth: authClient });

        const res = await directory.users.get({
          userKey: accountId,
        });

        const userInfo = {
          name: res.data.name.fullName || "Nome desconhecido",
          email: res.data.primaryEmail || "Email desconhecido",
        };

        userCache.set(accountId, userInfo); // Salvar no cache
        return userInfo;
      } catch (err) {
        console.error("Erro ao buscar informações do usuário:", err.message);
        return { name: "Nome desconhecido", email: "Email desconhecido" };
      }
    }

    // ID do documento
    const documentId = process.env.DOCUMENT_ID;
    console.log("ID do documento:", documentId);

    // Obter atividades relacionadas ao documento
    const activityResponse = await driveActivity.activity.query({
      requestBody: {
        itemName: `items/${documentId}`,
        pageSize: 100,
      },
    });

    const activities = activityResponse.data.activities || [];
    const formattedActivities = [];

    // Manter a ordem original para que as mais recentes sejam processadas primeiro
    for (const [index, activity] of activities.entries()) {
      console.log("Atividade:", activity);
      const actor = activity.actors?.[0]?.user?.knownUser.personName;
      const accountId = actor?.split("/")[1];

      const userInfo = accountId
        ? await getUserInfo(accountId)
        : { name: "Autor desconhecido", email: "Email desconhecido" };

      const actionDetail = activity.primaryActionDetail;
      let description = "Descrição não disponível";

      if (actionDetail?.edit) {
        description = "Edição realizada";
      } else if (actionDetail?.comment) {
        description = "Comentário adicionado";
      } else if (actionDetail?.create) {
        description = "Documento criado";
      }

      const modifiedTime = activity.timestamp
        ? new Date(activity.timestamp).toLocaleString()
        : "Data não disponível";

      // Ajustar o número da versão para que a mais recente seja numerada corretamente
      const versionNumber = activities.length - index;

      formattedActivities.push({
        version: `${versionNumber}`, // Ajustar o cálculo da versão
        modifiedTime: `${modifiedTime}`,
        author: `${userInfo.name}`,
        email: `${userInfo.email}`,
        description: `${description}`,
      });
    }

    console.log("Atividades formatadas (ordenadas corretamente):", JSON.stringify(formattedActivities, null, 2));
    res.status(200).json(formattedActivities);
    
  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
    res.status(500).json({ error: "Erro ao buscar atividades" });
  }
}