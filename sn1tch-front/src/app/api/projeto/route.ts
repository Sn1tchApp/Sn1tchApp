// app/api/projeto/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authOptions";

export async function POST(request: Request) {
  const { url, students } = await request.json();

  if (!url || students.length === 0) {
    return NextResponse.json(
      { error: "URL e estudantes são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    // Cria o projeto e os estudantes associados no banco de dados
    const session = (await getServerSession(authOptions)) as any;
    const userId = session.user.id;

    const project = await prisma.project.create({
      data: {
        user: {
          connect: { id: userId }, // Relaciona o projeto ao usuário autenticado
        },
        url,
        students: {
          create: students.map((student: { name: string; email: string }) => ({
            name: student.name,
            email: student.email,
          })),
        },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar projeto e estudantes:", error);
    return NextResponse.json(
      { error: "Erro ao criar projeto e estudantes" },
      { status: 500 }
    );
  }
}
