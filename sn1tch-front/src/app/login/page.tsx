import React, { useState } from "react";
import LoginButton from "@/app/components/LoginButton";
import { authOptions } from "@/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function loginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-8 mt-8 text-gray-900">
        Sn1tch Auth
      </h1>
      <LoginButton />
    </div>
  );
}
