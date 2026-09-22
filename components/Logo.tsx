export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logoWrap">
      <div className="logoMark">I</div>
      {!compact && <div><strong>IDEALTECH</strong><span>3D EXPERIENCE</span></div>}
    </div>
  );
}
