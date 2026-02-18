// src/app/review/[token]/page.js
"use client";
import { useParams } from "next/navigation";
import ReviewFlow from "../../../components/review/ReviewFlow";

export default function ReviewPage() {
  const { token } = useParams();
  return <ReviewFlow token={token} />;
}
