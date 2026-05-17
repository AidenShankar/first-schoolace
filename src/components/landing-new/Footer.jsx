import React from "react";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 100 100" fill="rgba(255,255,255,0.4)" aria-label="SchoolACE">
            <path d="M1.22541 61.5228c-.2225-.9485.90748-1.5459 1.59638-.857L39.3342 97.1782c.6889.6889.0915 1.8189-.857 1.5964C20.0515 94.4522 5.54779 79.9485 1.22541 61.5228ZM.00189 46.8891c-.0176.2833.0889.5599.2896.7606L52.3503 99.7085c.2007.2007.4773.3075.7606.2896 2.3692-.1476 4.6938-.46 6.9624-.9259.7645-.157 1.0301-1.0963.4782-1.6481L2.576 39.4485c-.5519-.5519-1.4912-.2863-1.6482.4782-.4659 2.2686-.7783 4.5932-.9259 6.9624ZM4.21093 29.7054c-.16649.3738-.08169.8106.20765 1.1l64.77602 64.776c.2894.2894.7262.3742 1.1.2077 1.7861-.7956 3.5171-1.6927 5.1855-2.684.5521-.328.6373-1.0867.1832-1.5407L8.43566 24.3367c-.45409-.4541-1.21271-.3689-1.54074.1832-.99132 1.6684-1.88843 3.3994-2.68399 5.1855ZM12.6587 18.074c-.3701-.3701-.393-.9637-.0443-1.3541C21.7795 6.45931 35.1114 0 49.9519 0 77.5927 0 100 22.4073 100 50.0481c0 14.8405-6.4593 28.1724-16.7199 37.3375-.3903.3487-.984.3258-1.3542-.0443L12.6587 18.074Z" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-quaternary)", letterSpacing: "-0.01em" }}>SchoolACE</span>
        </div>

        <p style={{ fontSize: 12, color: "var(--color-text-quaternary)", margin: 0 }}>
          © 2026 SchoolACE, Inc. All rights reserved.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {[
            { label: "Terms", href: "#" },
            { label: "Privacy", href: "#" },
            { label: "contact@schoolace.ai", href: "mailto:contact@schoolace.ai" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{ fontSize: 12, color: "var(--color-text-quaternary)", textDecoration: "none", transition: "color 150ms" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-quaternary)")}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}