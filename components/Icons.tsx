export function ArrowIcon({ diagonal = false, className = "" }: { diagonal?: boolean; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {diagonal ? <><path d="M6 18 18 6M6 6h12v12" /></> : <path d="M4 12h15m-6-6 6 6-6 6" />}
  </svg>;
}

export function ArchiveIcon({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h5v16H5zM14 4h5v16h-5zM7.5 8v8M16.5 8v8M3 20h18" /></svg>;
}

export function LockIcon() {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></svg>;
}

export function SearchIcon() {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>;
}

export function PersonIcon() {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="7.5" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg>;
}

export function ThreadMark() {
  return <svg viewBox="0 0 160 130" className="thread-mark" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth=".7"><path d="M-20 85C10 12 50 8 86 55s50 34 90 4M-20 94C12 18 52 15 87 62s49 32 91 4M-20 103C13 25 54 22 89 69s48 30 91 4M-20 112C14 32 56 29 91 76s47 28 91 4M-20 121C15 39 58 36 93 83s46 26 91 4M-20 130C16 46 60 43 95 90s45 24 91 4" /></g></svg>;
}
