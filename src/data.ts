export interface Artist {
  id: string;
  name: string;
}

export interface Track {
  id: string;
  title: string;
  durationSeconds: number;
  artistId: string;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
}

export const artists: Artist[] = [
  { id: "a1", name: "Mira Vale" },
];

// both tracks share 1 artist
export const tracks: Track[] = [
  { id: "t1", title: "Quiet Lines", durationSeconds: 180, artistId: "a1" },
  { id: "t2", title: "River Lights", durationSeconds: 210, artistId: "a1" },
];

export const playlists: Playlist[] = [
  { id: "p1", name: "Evening Coding", trackIds: ["t1", "t2"] },
  { id: "p2", name: "Morning Walk", trackIds: ["t2"] },
];
