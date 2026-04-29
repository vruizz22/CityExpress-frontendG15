import { useState } from 'react';
import { Package } from 'lucide-react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex items-center gap-3 text-brand-600">
        <Package className="h-10 w-10" aria-hidden="true" />
        <span className="text-sm font-medium uppercase tracking-widest text-slate-500">
          Vite + React
        </span>
      </div>
      <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
        CityExpress · Frontend G15
      </h1>
      <p className="max-w-prose text-slate-600 dark:text-slate-400">
        Single Page Application en React + Vite (JS puro), Tailwind v4 y autenticación Auth0. Pre-D0
        · Scaffolding listo. Ver{' '}
        <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">docs/roadmap.md</code>{' '}
        para el plan E1.
      </p>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        Smoke counter: {count}
      </button>
    </main>
  );
}
