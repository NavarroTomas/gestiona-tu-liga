import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function read(path) {
  return readFileSync(path, "utf8");
}

function includes(path, needle, message) {
  const content = read(path);
  assert.ok(content.includes(needle), message);
}

function excludes(path, needle, message) {
  const content = read(path);
  assert.ok(!content.includes(needle), message);
}

function matches(path, pattern, message) {
  const content = read(path);
  assert.match(content, pattern, message);
}

function notMatches(path, pattern, message) {
  const content = read(path);
  assert.doesNotMatch(content, pattern, message);
}

const registrationPath = "src/app/registro/page.tsx";
const layoutPath = "src/app/layout.tsx";
const adminLayoutPath = "src/app/admin/layout.tsx";
const adminGuardPath = "src/components/AdminGuard.tsx";
const nextConfigPath = "next.config.ts";
const navbarPath = "src/components/Navbar.tsx";
const cookieConsentPath = "src/components/CookieConsent.tsx";
const steamHoursPath = "src/app/api/steam/hours/route.ts";

assert.equal(
  existsSync("src/app/debug-user/page.tsx"),
  false,
  "The debug-user route must not be restored.",
);

matches(
  registrationPath,
  /password\.length\s*<\s*10/,
  "Registration must enforce a minimum 10-character password before signup.",
);
includes(
  registrationPath,
  "minLength={10}",
  "The registration password field must advertise the 10-character minimum to the browser.",
);
includes(
  registrationPath,
  "requested_playerid: playerIdLimpio",
  "Registration must send requested_playerid in signup metadata for the atomic DB trigger.",
);
includes(
  registrationPath,
  "steam_id: steamIdLimpio",
  "Registration must send steam_id in signup metadata for the atomic DB trigger.",
);
includes(
  registrationPath,
  "discord_id: discordIdLimpio",
  "Registration must send discord_id in signup metadata for the atomic DB trigger.",
);
notMatches(
  registrationPath,
  /\.from\(["']profiles["']\)[\s\S]{0,180}?\.update\(/,
  "Registration must not perform a second client-side profiles update after signup.",
);

includes(
  adminLayoutPath,
  "<AdminGuard>{children}</AdminGuard>",
  "Every /admin route must remain wrapped by AdminGuard.",
);
includes(
  adminGuardPath,
  "await supabase.auth.getUser()",
  "AdminGuard must verify the authenticated user.",
);
includes(
  adminGuardPath,
  "hasAnyAdminPermission(permisos)",
  "AdminGuard must require at least one admin permission before rendering admin content.",
);
includes(
  adminGuardPath,
  'router.push("/")',
  "AdminGuard must reject authenticated users without admin permissions.",
);

includes(
  cookieConsentPath,
  "apa_cookie_consent_v1",
  "Cookie consent storage key must remain present.",
);
includes(
  layoutPath,
  "<CookieConsent />",
  "Tracking must remain gated behind the CookieConsent component.",
);
excludes(
  layoutPath,
  "googletagmanager.com/gtag/js",
  "Google Analytics must not be loaded unconditionally from the root layout.",
);
excludes(
  layoutPath,
  "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
  "AdSense must not be loaded unconditionally from the root layout.",
);

for (const header of [
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "X-Frame-Options",
  "Permissions-Policy",
  "Content-Security-Policy-Report-Only",
]) {
  includes(nextConfigPath, header, `Security header ${header} must remain configured.`);
}
includes(
  nextConfigPath,
  '"object-src \'none\'"',
  "The CSP report-only baseline must continue to deny plugin/object content.",
);
notMatches(
  nextConfigPath,
  /key:\s*["']Content-Security-Policy["']/,
  "CSP must remain Report-Only until nonce/AdSense compatibility is intentionally implemented and tested.",
);

matches(
  steamHoursPath,
  /AbortSignal\.timeout\(8_?000\)/,
  "Steam hours requests must keep an 8-second upstream timeout.",
);
matches(
  steamHoursPath,
  /const\s+RATE_LIMIT\s*=\s*30\s*;/,
  "Steam hours API must keep its 30-request rate-limit guard.",
);
includes(
  steamHoursPath,
  "CACHE_TTL_MS",
  "Steam hours API must keep caching enabled.",
);

for (const marker of [
  'aria-controls="apa-notifications-menu"',
  'aria-controls="apa-user-menu"',
  'aria-controls="apa-mobile-menu"',
  'aria-labelledby="apa-search-title"',
  'aria-labelledby="apa-dispute-title"',
  'window.addEventListener("keydown", cerrarConEscape)',
]) {
  includes(navbarPath, marker, `Navbar accessibility regression: missing ${marker}`);
}

console.log("Security regression checks passed.");
