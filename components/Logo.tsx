import Image from 'next/image';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`logoWrap${compact ? ' compact' : ''}`}>
      <Image
        className="logoImage"
        src="/idealtech-logo.png"
        alt="Idealtech"
        width={54}
        height={54}
        priority
      />
      {!compact && (
        <div className="logoText">
          <strong>IDEALTECH</strong>
          <span>3D EXPERIENCE</span>
        </div>
      )}
    </div>
  );
}
