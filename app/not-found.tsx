import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-400 p-6 font-mono text-center">
      <h1 className="text-2xl text-violet-400 font-bold mb-2">404 - STRATEGIC NODE NOT FOUND</h1>
      <p className="text-xs text-zinc-500 max-w-md">
        The requested pathway or intelligence resource does not exist in the active Strategic Vault directory.
      </p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-violet-900/60 transition text-xs rounded hover:text-violet-300"
      >
        Return to Intelligence Hub
      </Link>
    </div>
  );
}
