"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

type Consent = {
  analytics: boolean;
  advertising: boolean;
};

const STORAGE_KEY = "apa_cookie_consent_v1";

export default function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setConsent(null);
        return;
      }

      const parsed = JSON.parse(stored) as Consent;
      setConsent({
        analytics: parsed.analytics === true,
        advertising: parsed.advertising === true,
      });
    } catch {
      setConsent(null);
    }
  }, []);

  function save(next: Consent) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setConsent(next);
  }

  return (
    <>
      {consent?.analytics && (
        <>
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-EMHDZV5ZPW"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-EMHDZV5ZPW', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {consent?.advertising && (
        <Script
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9012377872796123"
        />
      )}

      {consent === null && (
        <aside
          aria-label="Preferencias de privacidad"
          className="fixed inset-x-4 bottom-4 z-[9999] mx-auto max-w-2xl rounded-2xl border border-white/15 bg-black/95 p-5 text-sm text-white shadow-2xl"
        >
          <p className="font-black">Privacidad y cookies</p>
          <p className="mt-2 text-zinc-300">
            Liga usa almacenamiento necesario para el funcionamiento del sitio. Analytics y publicidad son opcionales y sólo se cargan si los autorizás.
          </p>

          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
              />
              Analítica
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={advertising}
                onChange={(event) => setAdvertising(event.target.checked)}
              />
              Publicidad
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => save({ analytics: false, advertising: false })}
              className="rounded-xl border border-white/20 px-4 py-2 font-bold"
            >
              Sólo necesarias
            </button>
            <button
              type="button"
              onClick={() => save({ analytics, advertising })}
              className="rounded-xl border border-white/20 px-4 py-2 font-bold"
            >
              Guardar selección
            </button>
            <button
              type="button"
              onClick={() => save({ analytics: true, advertising: true })}
              className="rounded-xl bg-white px-4 py-2 font-black text-black"
            >
              Aceptar todas
            </button>
            <a href="/cookies" className="px-2 py-2 underline underline-offset-4">
              Más información
            </a>
          </div>
        </aside>
      )}
    </>
  );
}
