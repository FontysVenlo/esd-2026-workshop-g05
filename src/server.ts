import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";
import { playlists } from "./data.ts";
import type { Playlist, Track } from "./data.ts";
import { findArtist, findPlaylist, findTrack } from "./store.ts";
import { handleRest } from "./rest.ts";

const typeDefs = `
  type Artist {
    id: ID!
    name: String!
  }

  type Track {
    id: ID!
    title: String!
    durationSeconds: Int!
    artist: Artist
  }

  type Playlist {
    id: ID!
    name: String!
    tracks(limit: Int): [Track!]!
  }

  type Query {
    playlist(id: ID!): Playlist
    playlists: [Playlist!]!
  }
`;

const resolvers = {
  Query: {
    playlist: (_: unknown, { id }: { id: string }) => findPlaylist(id),
    playlists: () => playlists,
  },
  Playlist: {
    tracks: (playlist: Playlist, { limit }: { limit?: number }) =>
      playlist.trackIds
        .slice(0, limit ?? undefined)
        .map(findTrack)
        .filter((t): t is Track => t !== null),
  },
  Track: {
    artist: (track: Track) => findArtist(track.artistId),
  },
};

const yoga = createYoga({ schema: createSchema({ typeDefs, resolvers }) });

const port = Number(process.env.PORT ?? 4000);

createServer((req, res) => {
  if (!handleRest(req, res)) return yoga(req, res);
}).listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}/graphql`);
});
