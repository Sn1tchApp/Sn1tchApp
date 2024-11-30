import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import { redirect } from "next/navigation";
import LogoutButton from "./components/LogoutButton";
import { prisma } from "@/lib/prisma";
import Link from "next/link"; // Step 1: Import Link component

export default async function homePage() {
  const session = (await getServerSession(authOptions)) as any;

  if (!session) {
    redirect("/login");
  }
  const projects = await prisma.project.findMany({
    where: { userId: session?.user?.id || "inexistente" },
    include: {
      students: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-8 text-gray-900">Projetos</h1>
      <ul className="w-full max-w-2xl">
        {projects.length === 0 && (
          <div className="flex flex-col items-center">
            <li className="mb-4 p-4 bg-white shadow rounded">
              <p className="text-lg font-semibold">
                Nenhum projeto cadastrado ainda
              </p>
            </li>
            <Link
              className="bg-black text-white px-4 py-2 rounded"
              href="/projeto/cadastrar"
            >
              Cadastrar Projeto
            </Link>
          </div>
        )}
        {projects.map((project) => (
          <li key={project.id} className="mb-4 p-4 bg-white shadow rounded">
            <Link href={`/projeto/${project.id}`}>
              <h2>{project.url.replace("https://github.com/", "")}</h2>
              <h2 className="text-md font-medium mt-2">Estudantes:</h2>
              <ul className="list-disc list-inside">
                {project.students.map((student) => (
                  <li key={student.id} className="ml-4 mb-4 list-none">
                    <p>
                      <b>{student.name}</b> {`<${student.email}>`}
                    </p>
                  </li>
                ))}
              </ul>
            </Link>
          </li>
        ))}
      </ul>
      <div className="absolute top-0 right-0 m-4">
        <Link
          className="bg-black text-white px-4 py-2 rounded mr-2"
          href="/projeto/cadastrar"
        >
          Cadastrar Projeto
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
