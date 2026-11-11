import type { Playlist } from "./data.ts";
import { findPlaylist } from "./store.ts";

export const MAX_PLAYLIST_NAME_LENGTH = 80;

export type RenameErrorCode = "BAD_USER_INPUT" | "NOT_FOUND";

export class RenameError extends Error {
  code: RenameErrorCode;
  constructor(code: RenameErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

// validates first, changes the existing playlist object only afterwards
export function renamePlaylist(playlistId: string, name: string): Playlist {
  const playlist = findPlaylist(playlistId);
  if (!playlist) {
    throw new RenameError("NOT_FOUND", `Playlist "${playlistId}" not found.`);
  }

  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new RenameError("BAD_USER_INPUT", "Playlist name must not be empty.");
  }
  if (Array.from(trimmed).length > MAX_PLAYLIST_NAME_LENGTH) {
    throw new RenameError(
      "BAD_USER_INPUT",
      `Playlist name must be at most ${MAX_PLAYLIST_NAME_LENGTH} characters.`,
    );
  }

  playlist.name = trimmed;
  return playlist;
}
