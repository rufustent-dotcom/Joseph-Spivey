'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function AppErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled App Router Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-400 p-6 font-mono text-center">
      <h1 className="text-2xl text-red-500 font-bold mb-2">SYSTEM EXCEPTION DETECTED</h1>
      <p className="text-xs text-zinc-500 max-w-md mb-4">
        A runtime exception occurred in the intelligence sandbox environment.
      </p>
      <div className="bg-zinc-900 border border-zinc-850 text-[10px] text-zinc-500 p-3 rounded max-w-lg mb-6 overflow-x-auto text-left whitespace-pre-wrap max-h-40 font-mono w-full">
        {error?.message || 'Unknown strategic system error.'}
      </div>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-violet-950/20 border border-violet-900 text-violet-300 transition text-xs rounded hover:bg-violet-900/40 cursor-pointer"
        >
          Recover Session
        </button>
        <Link
          href="/"
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition text-xs rounded hover:text-zinc-200"
        >
          Return to Hub
        </Link>
      </div>
    </div>
  );
}
