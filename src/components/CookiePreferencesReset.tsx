"use client";

const STORAGE_KEY = "apa_cookie_consent_v1";

export default function CookiePreferencesReset() {
  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={reset}
      className="rounded-xl border border-white/20 px-4 py-2 font-bold text-white"
    >
      Cambiar preferencias de cookies
    </button>
  );
}
