"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export default function LoginButton() {
  return (
    <Button onClick={() => signIn("github")}>
      <Github className="mr-2 h-4 w-4" /> Login com GitHub
    </Button>
  );
}
