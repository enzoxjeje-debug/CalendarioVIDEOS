export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-6 py-14 sm:flex-row sm:items-end sm:px-10">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.34em] text-muted">
            DISPONIBLE PARA NUEVOS PROYECTOS
          </p>
          <p className="mt-4 max-w-md text-2xl font-bold tracking-[-0.01em] sm:text-3xl">
            ¿Construimos algo que dure?
          </p>
        </div>
        <a
          href="#top"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-mist transition-colors hover:border-accent hover:text-accent"
        >
          Volver al inicio
          <span aria-hidden>↑</span>
        </a>
      </div>
    </footer>
  )
}