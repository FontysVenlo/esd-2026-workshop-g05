import { artists, playlists, tracks } from "./data.ts";
import type { Artist, Playlist, Track } from "./data.ts";

// both APIs read same objects (also future in memory updates)
export const findPlaylist = (id: string) => playlists.find((p) => p.id === id) ?? null;
export const findTrack = (id: string) => tracks.find((t) => t.id === id) ?? null;
export const findArtist = (id: string) => artists.find((a) => a.id === id) ?? null;

export function listPlaylists(): Playlist[] {
  return playlists;
}

export function getPlaylistTracks(playlist: Playlist): Track[] {
  return playlist.trackIds.map(findTrack).filter((track) => track !== null);
}

export function getTrackArtist(track: Track): Artist | null {
  return findArtist(track.artistId);
}
