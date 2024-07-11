import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accueil | FAHB"
}

export default function Home() {
  return (
      <h1>Bienvenue sur le site de la FAHB</h1>
  );
}
