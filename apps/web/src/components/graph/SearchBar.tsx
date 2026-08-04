import { useEffect, useMemo, useRef, useState } from 'react';
import type { Person } from '../../lib/api';

interface Props {
  persons: Person[];
  onPick: (id: string) => void;
}

export function SearchBar({ persons, onPick }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return persons
      .filter((p) => `${p.firstName} ${p.lastName ?? ''}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, persons]);

  useEffect(() => setCursor(0), [query]);

  // Ctrl+K / Cmd+K pour ouvrir
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener('mousedown', onClickOutside);
    return () => window.removeEventListener('mousedown', onClickOutside);
  }, []);

  function pick(id: string) {
    onPick(id);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && results[cursor]) {
      e.preventDefault();
      pick(results[cursor].id);
    } else if (e.key === 'Escape') {
      setQuery('');
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Rechercher…"
        className="h-7 w-44 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2.5 text-xs text-[var(--color-ink)] outline-none transition-all focus:w-56 focus:ring-1 focus:ring-[var(--color-accent)]"
      />
      {!query && (
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-ink-muted)] opacity-60">
          ⌘K
        </kbd>
      )}

      {open && results.length > 0 && (
        <div
          className="absolute left-0 top-9 z-40 w-64 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-1 shadow-lg"
          style={{ animation: 'scaleIn 120ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {results.map((p, i) => (
            <button
              key={p.id}
              onMouseEnter={() => setCursor(i)}
              onClick={() => pick(p.id)}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[13px] transition-colors"
              style={{ background: i === cursor ? 'var(--color-bg)' : 'transparent' }}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
              >
                {`${p.firstName[0] ?? ''}${p.lastName?.[0] ?? ''}`.toUpperCase()}
              </span>
              <span className="truncate text-[var(--color-ink)]">
                {p.firstName} {p.lastName}
              </span>
              {p.birthDate && (
                <span className="ml-auto shrink-0 text-[11px] text-[var(--color-ink-muted)]">
                  {new Date(p.birthDate).getFullYear()}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {open && query && results.length === 0 && (
        <div className="absolute left-0 top-9 z-40 w-64 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-[13px] text-[var(--color-ink-muted)] shadow-lg">
          Aucun résultat
        </div>
      )}
    </div>
  );
}
