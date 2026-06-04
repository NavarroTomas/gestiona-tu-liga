import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SteamOwnedGame = {
  appid: number;
  playtime_forever?: number;
  playtime_windows_forever?: number;
  playtime_mac_forever?: number;
  playtime_linux_forever?: number;
};

type SteamOwnedGamesResponse = {
  response?: {
    game_count?: number;
    games?: SteamOwnedGame[];
  };
};

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status },
  );
}

export async function GET(request: NextRequest) {
  try {
    const steamApiKey = process.env.STEAM_API_KEY;
    const steamAppId = process.env.STEAM_APP_ID;

    if (!steamApiKey) {
      return jsonError("Falta configurar STEAM_API_KEY en .env.local.", 500);
    }

    if (!steamAppId) {
      return jsonError("Falta configurar STEAM_APP_ID en .env.local.", 500);
    }

    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get("steamId")?.trim();

    if (!steamId) {
      return jsonError("Falta el parámetro steamId.");
    }

    if (!/^\d{15,20}$/.test(steamId)) {
      return jsonError("El steamId debe ser un SteamID64 válido.");
    }

    const url = new URL(
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/",
    );

    url.searchParams.set("key", steamApiKey);
    url.searchParams.set("steamid", steamId);
    url.searchParams.set("format", "json");
    url.searchParams.set("include_appinfo", "0");
    url.searchParams.set("include_played_free_games", "1");
    url.searchParams.set("appids_filter[0]", steamAppId);

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return jsonError(
        `Steam respondió con error ${response.status}.`,
        response.status,
      );
    }

    const data = (await response.json()) as SteamOwnedGamesResponse;
    const games = data.response?.games || [];
    const appIdNumber = Number(steamAppId);

    const game = games.find((g) => Number(g.appid) === appIdNumber);

    if (!game) {
      return NextResponse.json({
        ok: true,
        found: false,
        steamId,
        appId: appIdNumber,
        minutes: 0,
        hours: 0,
        reason:
          "Steam no devolvió horas para este juego. Puede ser porque el perfil/biblioteca es privada, porque no posee el juego o porque no hay horas registradas.",
      });
    }

    const minutes = Number(game.playtime_forever || 0);
    const hours = Math.round((minutes / 60) * 10) / 10;

    return NextResponse.json({
      ok: true,
      found: true,
      steamId,
      appId: appIdNumber,
      minutes,
      hours,
    });
  } catch (error) {
    console.error(error);

    return jsonError("Error inesperado consultando Steam.", 500);
  }
}
