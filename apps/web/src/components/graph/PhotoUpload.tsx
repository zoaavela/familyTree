import { useRef, useState } from 'react';
import { compressImage } from '../../lib/compressImage';

interface Props {
  photoUrl: string | null;
  initials?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  size?: number;
}

function DefaultAvatar({ size }: { size: number }) {
  return (
    <svg
      width={size * 0.5}
      height={size * 0.5}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="7.2" r="3.2" />
      <path d="M3.6 17c.7-3.4 3.4-5.4 6.4-5.4s5.7 2 6.4 5.4" />
    </svg>
  );
}

export function PhotoUpload({ photoUrl, initials, onUpload, onRemove, size = 88 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Format image requis');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      await onUpload(compressed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="group relative cursor-pointer overflow-hidden rounded-full border border-[var(--color-border)]"
        style={{ width: size, height: size }}
        onClick={() => inputRef.current?.click()}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: 'var(--color-bg-sunken)', color: 'var(--color-ink-faint)' }}
          >
            <DefaultAvatar size={size} />
          </div>
        )}

        <div
          className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100"
          style={{ transitionDuration: 'var(--transition-fast)' }}
        >
          <span className="text-[11px] font-medium text-white">
            {busy ? '…' : photoUrl ? 'Changer' : 'Ajouter'}
          </span>
        </div>
      </div>

      {photoUrl && !busy && (
        <button
          onClick={() => void onRemove()}
          className="text-[11px] text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-error)]"
        >
          Retirer la photo
        </button>
      )}

      {error && <p className="text-[11px] text-[var(--color-error)]">{error}</p>}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}
