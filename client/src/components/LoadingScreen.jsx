export default function LoadingScreen({ label = 'Loading HB Money...', inline = false }) {
  const wrapperClass = inline
    ? 'min-h-[70vh] p-8'
    : 'min-h-screen';

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-mist ${wrapperClass}`}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <div className="hb-loader-pattern h-full w-full" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-brand/20" />
          <div className="absolute inset-2 rounded-full border-4 border-dashed border-brand/40 hb-loader-spin" />
          <div className="absolute inset-5 rounded-full bg-brand/12 blur-md" />
          <div className="relative h-16 w-16 overflow-hidden rounded-3xl bg-brand shadow-soft">
            <img src="/icon.ico" alt="HB Money" className="h-full w-full scale-150 object-cover" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xl font-bold text-ink">HB Money</p>
          <p className="text-sm font-medium text-slateSoft">{label}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hb-loader-dot" />
          <span className="hb-loader-dot hb-loader-dot-delay-1" />
          <span className="hb-loader-dot hb-loader-dot-delay-2" />
        </div>
      </div>
    </div>
  );
}
