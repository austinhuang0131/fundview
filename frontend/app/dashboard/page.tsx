import Link from 'next/link';

export default function Dashboard() {
  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
          <h1 className="text-4xl font-bold mb-8">FundVue Dashboard</h1>
          <h2 className="text-1xl font-bold mb-8">By Austin, Eli, Ian, and Ivan</h2>
          <div className="space-y-4">
              <ul className="flex flex-col items-center space-y-4">
                  <li>
                      <Link href="/stocks" className="btn btn-primary">
                          Stocks
                      </Link>
                  </li>
                  <li>
                      <Link href="/funds" className="btn btn-primary">
                          Funds
                      </Link>
                  </li>
              </ul>
          </div>
      </div>
  );
}