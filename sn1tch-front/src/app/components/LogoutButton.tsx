"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Logout() {
  return (
    <Button className="bg-black" onClick={() => signOut()}>
      Sair
    </Button>
  );
}
