import { google } from "googleapis";

const driveAuth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: "sn1tchapp",
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
  },
  scopes: ["https://www.googleapis.com/auth/drive.readonly", "https://www.googleapis.com/auth/drive.metadata.readonly"],
});

const drive = google.drive({ version: "v3", auth: driveAuth });

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const documentId = process.env.DOCUMENT_ID;
  console.log("ID do documento:", documentId);

  try {
    const revisionsResponse = await drive.revisions.get({
      fileId: documentId,
      pageSize: 1000,
      supportsAllDrives: true,
    });
    console.log("Revisions response:", revisionsResponse.data);
    if (revisionsResponse.data && revisionsResponse.data.revisions) {
        //console.log("Revisions found:", revisionsResponse.data.revisions);
      return res.status(200).json(revisionsResponse.data.revisions);
    } else {
        console.warn("No revisions found for the document:", documentId);
      return res.status(404).json({ message: "No revisions found" });
    }
  } catch (error) {
    console.error("Error fetching revisions:", error.message);
    return res.status(500).json({ message: "Error fetching revisions", error: error.message });
  }
}