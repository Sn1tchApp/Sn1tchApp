// app/projeto/cadastrar/page.tsx
import ProjectForm from "./ProjectForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CadastrarProjetoPage() {
  const session = (await getServerSession(authOptions)) as any;

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="absolute top-0 right-0 m-4">
        <Link className="bg-black text-white px-4 py-2 rounded mr-2" href="/">
          Voltar
        </Link>
      </div>
      <h1>Cadastrar Projeto e Estudantes</h1>
      <ProjectForm />
    </div>
  );
}
