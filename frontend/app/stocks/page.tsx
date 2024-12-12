"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CUSIPData {
  CUSIP: string;
  name_of_issuer: string; // Update this based on your database schema
}

async function fetchCUSIPs() {
  const response = await fetch("/api/cusip");
  if (!response.ok) {
    throw new Error("Failed to fetch CUSIPs");
  }
  return response.json();
}

export default function StocksPage() {
  const [cusips, setCusips] = useState<CUSIPData[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetchCUSIPs()
        .then(setCusips)
        .catch((error) => console.error("Error fetching CUSIPs:", error))
        .finally(() => setLoading(false));
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (!cusips.length) return <p>No CUSIPs available.</p>;

  return (
      <div>
        <h1>Available CUSIPs</h1>
        <ul>
          {cusips.map((cusip) => (
              <li key={cusip.CUSIP}>
                <Link href={`/stocks/${cusip.CUSIP}`}>
                  {cusip.name_of_issuer} ({cusip.CUSIP})
                </Link>
              </li>
          ))}
        </ul>
      </div>
  );
}