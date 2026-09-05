import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SteamOwnedGame = {
  appid: number;
  playtime_forever?: number;
};

type SteamOwnedGamesResponse = {
  response?: {
    games?: SteamOwnedGame[];
  };
};

type CacheValue = {
  expiresAt: number;
  payload: Record<string, unknown>;
};

type RateValue = {
  resetAt: number;
  count: number;
};

const CACHE_TTL_MS = 30 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 30;

const steamCache = new Map<string, CacheValue>();
const rateLimit = new Map<string, RateValue>();

function clientKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(request: NextRequest) {
  const key = clientKey(request);
  const now = Date.now();
  const current = rateLimit.get(key);

  if (!current || current.resetAt <= now) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  current.count += 1;
  rateLimit.set(key, current);
  return current.count > RATE_LIMIT;
}

function json(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    if (isRateLimited(request)) {
      return json({ ok: false, error: "Demasiadas solicitudes. Intentá nuevamente en un minuto." }, 429);
    }

    const steamApiKey = process.env.STEAM_API_KEY;
    const steamAppId = process.env.STEAM_APP_ID;

    if (!steamApiKey || !steamAppId) {
      console.error("Steam API configuration missing");
      return json({ ok: false, error: "Servicio temporalmente no disponible." }, 503);
    }

    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get("steamId")?.trim();

    if (!steamId || !/^7656119\d{10}$/.test(steamId)) {
      return json({ ok: false, error: "SteamID64 inválido." }, 400);
    }

    const now = Date.now();
    const cached = steamCache.get(steamId);
    if (cached && cached.expiresAt > now) {
      return json(cached.payload);
    }

    const url = new URL("https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/");
    url.searchParams.set("key", steamApiKey);
    url.searchParams.set("steamid", steamId);
    url.searchParams.set("format", "json");
    url.searchParams.set("include_played_free_games", "1");

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    let payload: Record<string, unknown>;

    if (!response.ok) {
      payload = {
        ok: true,
        found: false,
        hours: 0,
        reason: "Perfil privado o servicio de Steam no disponible",
      };
    } else {
      const data = (await response.json()) as SteamOwnedGamesResponse;

      if (!data.response || Object.keys(data.response).length === 0) {
        payload = {
          ok: true,
          found: false,
          hours: 0,
          reason: "Perfil de Steam privado",
        };
      } else {
        const games = data.response.games || [];
        const appIdNumber = Number(steamAppId);

        if (!Number.isSafeInteger(appIdNumber) || appIdNumber <= 0) {
          console.error("STEAM_APP_ID is invalid");
          return json({ ok: false, error: "Servicio temporalmente no disponible." }, 503);
        }

        const game = games.find((g) => Number(g.appid) === appIdNumber);

        if (!game) {
          payload = {
            ok: true,
            found: false,
            hours: 0,
            reason: "Juego no encontrado en la biblioteca",
          };
        } else {
          const minutes = Math.max(0, Number(game.playtime_forever || 0));
          const hours = Math.round((minutes / 60) * 10) / 10;
          payload = { ok: true, found: true, minutes, hours };
        }
      }
    }

    steamCache.set(steamId, { payload, expiresAt: now + CACHE_TTL_MS });
    return json(payload);
  } catch (error) {
    console.error("Steam hours lookup failed", error);
    return json({
      ok: true,
      found: false,
      hours: 0,
      reason: "Error de conexión con Steam",
    });
  }
}
