'use client';

import { useEffect, useState } from "react";
import { CIKNAME } from "@/lib/api";
import { fetchCikAndNames } from "@/lib/api";
import { useRouter } from "next/router";
import { redirect } from "next/dist/server/api-utils";
import { permanentRedirect } from "next/navigation";

export default function CikList() {
  const [cikData, setCikData] = useState<CIKNAME[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchCikAndNames();
        setCikData(data);
      } catch (err) {
        setError("Failed to load CIK data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSelect = (cik: string) => {
    permanentRedirect(`/funds/${cik}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const filteredData = searchTerm
    ? cikData.filter((cik) =>
        cik.NAME.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cikData;

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="max-w-lg w-full p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Select a Fund</h1>
        <div className="form-control mb-4">
          <input
            type="text"
            placeholder="Search for a fund..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ul className="menu bg-base-100 rounded-box overflow-y-auto max-h-60">
          {filteredData.map((cik) => (
            <li key={cik.CIK}>
              <button
                className="btn btn-ghost justify-start"
                onClick={() => handleSelect(cik.CIK)}
              >
                {cik.NAME}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}