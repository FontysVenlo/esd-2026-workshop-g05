import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";
import { artists, playlists, tracks } from "./data.ts";
import type { Playlist, Track } from "./data.ts";

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
    playlist: (_: unknown, { id }: { id: string }) => playlists.find((p) => p.id === id) ?? null,
    playlists: () => playlists,
  },
  Playlist: {
    tracks: (playlist: Playlist, { limit }: { limit?: number }) =>
      playlist.trackIds
        .slice(0, limit ?? undefined)
        .map((id) => tracks.find((t) => t.id === id))
        .filter((t): t is Track => t !== undefined),
  },
  Track: {
    artist: (track: Track) => artists.find((a) => a.id === track.artistId) ?? null,
  },
};

const yoga = createYoga({ schema: createSchema({ typeDefs, resolvers }) });

const port = Number(process.env.PORT ?? 4000);

createServer(yoga).listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}/graphql`);
});
