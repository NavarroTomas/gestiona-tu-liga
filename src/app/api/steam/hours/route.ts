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

export async function GET(request: NextRequest) {
  try {
    const steamApiKey = process.env.STEAM_API_KEY;
    const steamAppId = process.env.STEAM_APP_ID;

    if (!steamApiKey || !steamAppId) {
      return NextResponse.json({ ok: false, error: "Faltan variables de entorno." }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get("steamId")?.trim();

    if (!steamId) {
      return NextResponse.json({ ok: false, error: "Falta steamId." }, { status: 400 });
    }

    const url = new URL("https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/");
    url.searchParams.set("key", steamApiKey);
    url.searchParams.set("steamid", steamId);
    url.searchParams.set("format", "json");
    url.searchParams.set("include_played_free_games", "1");

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({
        ok: true,
        found: false,
        hours: 0,
        reason: "Perfil privado o límite de Steam alcanzado",
      });
    }

    const data = (await response.json()) as SteamOwnedGamesResponse;
    
    // Si la respuesta viene vacía u objeto vacío {}, es 100% perfil privado
    if (!data.response || Object.keys(data.response).length === 0) {
      return NextResponse.json({
        ok: true,
        found: false,
        hours: 0,
        reason: "Perfil de Steam privado",
      });
    }

    const games = data.response.games || [];
    const appIdNumber = Number(steamAppId);

    const game = games.find((g) => Number(g.appid) === appIdNumber);

    if (!game) {
      return NextResponse.json({
        ok: true,
        found: false,
        hours: 0,
        reason: "Juego no encontrado en la biblioteca",
      });
    }

    const minutes = Number(game.playtime_forever || 0);
    const hours = Math.round((minutes / 60) * 10) / 10;

    return NextResponse.json({
      ok: true,
      found: true,
      minutes,
      hours,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      ok: true,
      found: false,
      hours: 0,
      reason: "Error de conexión con Steam",
    });
  }
}