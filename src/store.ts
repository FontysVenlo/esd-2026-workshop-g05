import { artists, playlists, tracks } from "./data.ts";

// both APIs read same objects (also future in memory updates)
export const findPlaylist = (id: string) => playlists.find((p) => p.id === id) ?? null;
export const findTrack = (id: string) => tracks.find((t) => t.id === id) ?? null;
export const findArtist = (id: string) => artists.find((a) => a.id === id) ?? null;
