import { createServer } from "node:http";
import { createSchema, createYoga } from "graphql-yoga";
import type { Playlist, Track } from "./data.ts";
import {
  findPlaylist,
  getPlaylistTracks,
  getTrackArtist,
  listPlaylists,
} from "./store.ts";
import { handleRest } from "./rest.ts";
import { GraphQLError } from "graphql";
import { RenameError, renamePlaylist } from "./service.ts";

const MIN_LIMIT = 1;
const MAX_LIMIT = 50;

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
    tracks(limit: Int! = 10): [Track!]!
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
    playlists: () => listPlaylists(),
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
    tracks: (playlist: Playlist, { limit }: { limit: number }) => {
      if (!Number.isInteger(limit) || limit < MIN_LIMIT || limit > MAX_LIMIT) {
        throw new GraphQLError(
          `limit must be an integer between ${MIN_LIMIT} and ${MAX_LIMIT}.`,
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }
      return getPlaylistTracks(playlist).slice(0, limit);
    },
  },
  Track: {
    artist: (track: Track) => getTrackArtist(track),
  },
};

const yoga = createYoga({ schema: createSchema({ typeDefs, resolvers }) });

const port = Number(process.env.PORT ?? 4000);

createServer((req, res) => {
  if (!handleRest(req, res)) return yoga(req, res);
}).listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}/graphql`);
});
