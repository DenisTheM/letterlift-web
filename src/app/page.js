"use client";
import dynamic from "next/dynamic";

const LetterLift = dynamic(() => import("../components/LetterLift"), { ssr: false });

export default function Home() {
  return <LetterLift />;
}
