// app/api/projeto/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const contribTypes = z.enum([
  "Documentação",
  "Frontend",
  "Backend",
  "Infraestrutura e DevOps",
  "Gerenciamento do Projeto",
  "Testes e Qualidade",
  "Pesquisa e Desenvolvimento",
  "Integração e Comunicação",
]);

const Resumo = z.object({
  summary: z.array(
    z.object({
      userEmail: z.string(),
      userSummary: z.string(),
      contributionCounts: z.array(
        z.object({ type: contribTypes, count: z.number() })
      ),
    })
  ),
});

export async function POST(request: Request) {
  const { gitData, driveData } = await request.json();

  if (!gitData) {
    return NextResponse.json({ error: "Data é obrigatório" }, { status: 400 });
  }

  try {
    const openAi = new OpenAI({ apiKey: process.env.AI_TOKEN });
    const completion = await openAi.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Faça um resumo das contribuições de cada aluno do projeto a partir dos dados de commits do git e de registros no documento do Google Docs. Agrupe as contribuições de um mesmo aluno no email com maior numero de contribuições, sinalizando o email principal deste aluno no campo userEmail. Realize uma síntese das principais contribuições de cada aluno no campo userSummary, caso o aluno tenha commits com mais de um email, sinalize no sumário quais outros emails deste aluno realizaram commits. Para cada aluno, informe a quantidade de contribuições de cada tipo.",
        },
        {
          role: "user",
          content: `Dados obtidos do git:
${gitData
  .map(
    (item: any) =>
      `email: ${item.email} \n handle do estudante: ${item.name} \n messagem de commit: ${item.message}`
  )
  .join("\n")}
  
Dados do drive:

${driveData}
  `,
        },
      ],
      response_format: zodResponseFormat(Resumo, "event"),
    });
    const summary = completion.choices[0].message.parsed;

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error("Erro ao utilizar inteligência artificial:", error);
    return NextResponse.json(
      { error: "Erro ao utilizar inteligência artificial" },
      { status: 500 }
    );
  }
}
