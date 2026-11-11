import type { IncomingMessage, ServerResponse } from "node:http";
import {
  findArtist,
  findPlaylist,
  findTrack,
  getPlaylistTracks,
  getTrackArtist,
  listPlaylists,
} from "./store.ts";

// return false for other paths bc then GraphQL Yoga can handle them
export function handleRest(req: IncomingMessage, res: ServerResponse): boolean {
  const { pathname: path, searchParams } = new URL(req.url ?? "/", "http://localhost");
  const match = /^\/(playlists|tracks|artists)\/([^/]+)$/.exec(path);
  if (!match && path !== "/playlists") return false;

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return true;
  }

  if (!match) {
    const includes = searchParams.getAll("include");
    if (includes.length === 0) {
      res.end(JSON.stringify(listPlaylists()));
      return true;
    }
    if (includes.length !== 1 || includes[0] !== "tracks.artist") {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Use include=tracks.artist exactly once" }));
      return true;
    }

    const playlists = listPlaylists().map((playlist) => ({
      ...playlist,
      tracks: getPlaylistTracks(playlist).map((track) => ({
        ...track,
        artist: getTrackArtist(track),
      })),
    }));
    res.end(JSON.stringify(playlists));
    return true;
  }

  let id: string;
  try {
    id = decodeURIComponent(match[2]);
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Invalid ID encoding" }));
    return true;
  }

  const lookup = { playlists: findPlaylist, tracks: findTrack, artists: findArtist };
  const result = lookup[match[1] as keyof typeof lookup](id);
  res.statusCode = result === null ? 404 : 200;
  res.end(JSON.stringify(result ?? { error: "Not found" }));
  return true;
}
