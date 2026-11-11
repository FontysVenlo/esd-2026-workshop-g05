import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";
import { playlists } from "./data.ts";
import type { Playlist, Track } from "./data.ts";
import { findArtist, findPlaylist, findTrack } from "./store.ts";
import { handleRest } from "./rest.ts";
import { GraphQLError } from "graphql";
import { RenameError, renamePlaylist } from "./service.ts";

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

  input RenamePlaylistInput {
    playlistId: ID!
    name: String!
  }

  type Mutation {
    renamePlaylist(input: RenamePlaylistInput!): Playlist
  }
`;

const resolvers = {
  Query: {
    playlist: (_: unknown, { id }: { id: string }) => findPlaylist(id),
    playlists: () => playlists,
  },
  Mutation: {
    renamePlaylist: (
      _: unknown,
      { input }: { input: { playlistId: string; name: string } },
    ) => {
      try {
        return renamePlaylist(input.playlistId, input.name);
      } catch (error) {
        if (error instanceof RenameError) {
          throw new GraphQLError(error.message, {
            extensions: { code: error.code },
          });
        }
        throw error;
      }
    },
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
