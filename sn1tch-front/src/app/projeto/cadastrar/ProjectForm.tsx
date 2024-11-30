// app/projeto/cadastrar/ProjectForm.tsx
"use client";

import { useState } from "react";

interface Student {
  name: string;
  email: string;
}

export default function ProjectForm() {
  const [url, setUrl] = useState("");
  const [students, setStudents] = useState<Student[]>([
    { name: "", email: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStudentChange = (index: number, field: string, value: string) => {
    const newStudents = [...students];
    newStudents[index] = { ...newStudents[index], [field]: value };
    setStudents(newStudents);
  };

  const addStudent = () => {
    setStudents([...students, { name: "", email: "" }]);
  };

  const removeStudent = (index: number) => {
    const newStudents = students.filter((_, i) => i !== index);
    setStudents(newStudents);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Enviar os dados do projeto e dos estudantes para a API
    const response = await fetch("/api/projeto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        students,
      }),
    });

    if (response.ok) {
      alert("Projeto e estudantes cadastrados com sucesso!");
    } else {
      alert("Erro ao cadastrar projeto e estudantes.");
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mt-6">
        <label
          className="block mb-2 text-sm font-medium text-gray-900"
          htmlFor="url"
        >
          URL do GitHub do Projeto:
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="https://github.com/..."
        />
      </div>
      <div className="flex">
        <h3 className="mt-8 mr-8">Estudantes</h3>
        <button
          className="mt-4 text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          type="button"
          onClick={addStudent}
        >
          Adicionar Estudante
        </button>
      </div>
      {students.map((student, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <div className="mt-6">
            <label
              className="block mb-2 text-sm font-medium text-gray-900"
              htmlFor={`name-${index}`}
            >
              Nome do Estudante:
            </label>
            <input
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              type="text"
              id={`name-${index}`}
              value={student.name}
              onChange={(e) =>
                handleStudentChange(index, "name", e.target.value)
              }
              required
              placeholder="Nome do estudante"
            />
          </div>
          <div>
            <label
              className="block mb-2 text-sm font-medium text-gray-900"
              htmlFor={`email-${index}`}
            >
              Email do Estudante:
            </label>
            <input
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              type="email"
              id={`email-${index}`}
              value={student.email}
              onChange={(e) =>
                handleStudentChange(index, "email", e.target.value)
              }
              required
              placeholder="email@exemplo.com"
            />
          </div>
          <button
            className="mt-4 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            type="button"
            onClick={() => removeStudent(index)}
          >
            Remover Estudante
          </button>
        </div>
      ))}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-4 text-white bg-green-500 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
      >
        {isSubmitting ? "Cadastrando..." : "Cadastrar Projeto"}
      </button>
    </form>
  );
}
