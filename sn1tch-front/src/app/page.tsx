"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function IntegrationScreen() {
  const [githubLink, setGithubLink] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const router = useRouter();

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    router.push(
      `/dashboard?githubLink=${githubLink}&accessToken=${accessToken}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-8 text-gray-900">
        Integração com o GitHub
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-lg">
        <div className="mb-6">
          <label
            htmlFor="githubLink"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Link do Repositório do GitHub
          </label>
          <input
            type="text"
            id="githubLink"
            value={githubLink}
            onChange={(e) => setGithubLink(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="https://github.com/seu-usuario/seu-repositorio"
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="accessToken"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Token de Acesso (Opcional)
          </label>
          <input
            type="text"
            id="accessToken"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Token de Acesso"
          />
        </div>
        <button
          type="submit"
          className="text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Integrar
        </button>
      </form>
    </div>
  );
}
