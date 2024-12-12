'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StockData {
    CUSIP: string;
    ticker: string;
}

export default function StocksPage() {
    const [stockData, setStockData] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/cusip");
                if (!response.ok) {
                    throw new Error("Failed to load stock data.");
                }
                const data = await response.json();
                setStockData(data);
            } catch (err) {
                setError("Failed to load stock data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSelect = (cusip: string) => {
        router.push(`/stocks/${cusip}`);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const filteredData = searchTerm
        ? stockData.filter((stock) =>
            stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : stockData;

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="max-w-lg w-full p-6 bg-white rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-4 text-center">Select a Stock</h1>
                <div className="form-control mb-4">
                    <input
                        type="text"
                        placeholder="Search for a stock..."
                        className="input input-bordered w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <ul className="menu bg-base-100 rounded-box overflow-y-auto max-h-60">
                    {filteredData.map((stock) => (
                        <li key={stock.CUSIP}>
                            <button
                                className="btn btn-ghost justify-start"
                                onClick={() => handleSelect(stock.CUSIP)}
                            >
                                {stock.ticker}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}