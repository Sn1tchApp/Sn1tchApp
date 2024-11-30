import { prisma } from "@/lib/prisma";
import axios from "axios";
import { Card } from "flowbite-react";
import GitTimeline from "./GitTimeline";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import { redirect } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";
export const dynamic = "force-dynamic";

// Função para buscar os dados da API do GitHub
const getData = async (url: string, token: string) => {
  const maxPage = 1000;
  const authors: any = {};
  const repoData = url.replace("https://github.com/", "").split("/");
  const [owner, repo] = repoData;

  for (let page = 1; page < maxPage; page++) {
    const headers = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
            Accept: "application/vnd.github+json",
          },
        }
      : {};

    console.log("headers", headers);

    try {
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/commits?page=${page}`,
        headers
      );
      const { data } = response;
      if (!data.length) {
        break;
      }
      data.forEach(({ commit }: any) => {
        const { author, message } = commit;
        if (authors[author.email]) {
          authors[author.email] = {
            name: author.name,
            timeline: [
              ...authors[author.email].timeline,
              { date: author.date, message },
            ],
          };
        } else {
          authors[author.email] = {
            message: message,
            name: author.name,
            timeline: [{ date: author.date, message }],
          };
        }
      });
    } catch (e: any) {
      console.log(e.response);
      break;
    }
  }
  return authors;
};

export default async function Page({ params }: { params: { id: string } }) {
  const session = (await getServerSession(authOptions)) as any;

  if (!session) {
    redirect("/login");
  }

  // 1. Busca o projeto no banco de dados utilizando o Prisma
  const project = await prisma.project.findUnique({
    where: { id: params.id }, // Certifique-se de que o ID do projeto seja um número, ajuste conforme necessário
    include: {
      user: true, // Inclui o usuário relacionado, caso necessário
    },
  });
  const account = await prisma.account.findFirst({
    where: {
      userId: session?.user?.id,
      provider: "github", // Certifique-se de que este valor corresponde ao seu provedor de OAuth
    },
  });

  if (!project) {
    return <div>Projeto não encontrado</div>;
  }

  // 2. Obtenha a URL do projeto no GitHub e, opcionalmente, o token de acesso se necessário
  const githubLink = project.url;

  const accessToken = account?.access_token || ""; // TODO fazer a busca do token de acesso do usuário

  const authors = await getData(githubLink, accessToken);
  const authorsAsArray = Object.keys(authors).map((email) => ({
    email,
    ...authors[email],
  }));

  const combinedTimeline = authorsAsArray.flatMap((author: any) =>
    author.timeline.map((timelinePoint: any) => ({
      date: timelinePoint.date,
      message: timelinePoint.message,
      name: author.name,
      email: author.email,
    }))
  );

  // Ordenar a timeline combinada por data
  combinedTimeline.sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const authorsByContributions = authorsAsArray.sort(
    (a: any, b: any) => b.timeline.length - a.timeline.length
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="absolute top-0 right-0 m-4">
        <Link
          className="bg-black text-white px-4 py-2 rounded mr-2"
          href="/projeto/cadastrar"
        >
          Cadastrar Projeto
        </Link>
        <LogoutButton />
      </div>
      <h1 className="text-2xl font-bold mb-8 mt-16 text-gray-900">
        Dados do projeto {githubLink.replace("https://github.com/", "")}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
        {authorsByContributions.map((author: any, index: number) => (
          <Card key={index} className="max-w-sm">
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {author.name}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              <strong>{author.timeline.length}</strong> commits feitos no
              projeto
            </p>
            <p className="font-normal text-gray-700 dark:text-gray-400 break-words">
              Email: {author.email}
            </p>
          </Card>
        ))}
      </div>
      <Card>
        <GitTimeline combinedTimeline={combinedTimeline} />
      </Card>
    </div>
  );
}
