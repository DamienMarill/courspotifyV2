import type {
  Album,
  Artist,
  DeezerAlbumDetail,
  DeezerArtistDetail,
  DeezerArtistSummary,
  DeezerTrackDetail,
  DeezerTrackSummary,
  Image,
  Track,
} from '../types'

function clampTo100(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, value))
}

function buildImages(
  small: string,
  medium: string,
  big: string,
  xl: string,
): Image[] {
  return [
    { url: small, height: 56, width: 56 },
    { url: medium, height: 250, width: 250 },
    { url: big, height: 500, width: 500 },
    { url: xl, height: 1000, width: 1000 },
  ]
}

function mapArtist(
  artistSummary: DeezerArtistSummary,
  artistDetailsById: Map<number, DeezerArtistDetail>,
  artistGenresById: Map<number, Set<string>>,
): Artist {
  const artistDetails = artistDetailsById.get(artistSummary.id)
  const genres = Array.from(artistGenresById.get(artistSummary.id) ?? [])
  const followers = artistDetails?.nb_fan ?? 0

  return {
    id: artistSummary.id.toString(),
    name: artistSummary.name,
    type: 'artist',
    followers: { total: followers },
    genres,
    popularity: clampTo100(Math.round(followers / 100000)),
    images: buildImages(
      artistDetails?.picture_small ?? '',
      artistDetails?.picture_medium ?? '',
      artistDetails?.picture_big ?? '',
      artistDetails?.picture_xl ?? '',
    ),
  }
}

function mapTrackList(
  tracks: DeezerTrackSummary[],
  album: DeezerAlbumDetail,
  artistDetailsById: Map<number, DeezerArtistDetail>,
  artistGenresById: Map<number, Set<string>>,
): Track[] {
  return tracks.map((track) => {
    return mapDeezerToTrack(
      {
        ...track,
        album: { id: album.id, title: album.title },
        artist: track.artist ?? album.contributors?.[0] ?? { id: 0, name: 'Unknown' },
        track_position: track.track_position ?? 0,
      },
      album,
      artistDetailsById,
      artistGenresById,
      false,
    )
  })
}

export function mapDeezerToTrack(
  track: DeezerTrackDetail,
  album: DeezerAlbumDetail,
  artistDetailsById: Map<number, DeezerArtistDetail>,
  artistGenresById: Map<number, Set<string>>,
  includeAlbumTracks = true,
): Track {
  const contributors = track.contributors?.length
    ? track.contributors
    : [track.artist]

  const artists = contributors.map((artist) =>
    mapArtist(artist, artistDetailsById, artistGenresById),
  )

  const albumArtists = (album.contributors ?? []).map((artist) =>
    mapArtist(artist, artistDetailsById, artistGenresById),
  )

  const mappedAlbum: Album = {
    id: album.id.toString(),
    name: album.title,
    album_type: album.record_type,
    total_tracks: album.nb_tracks,
    release_date: album.release_date,
    release_date_precision: 'day',
    type: 'album',
    genres: album.genres.data.map((genre) => genre.name),
    popularity: clampTo100(Math.round(album.fans / 10000)),
    images: buildImages(
      album.cover_small,
      album.cover_medium,
      album.cover_big,
      album.cover_xl,
    ),
    artists: albumArtists,
    tracks: [],
  }

  const mappedTrack: Track = {
    id: track.id.toString(),
    name: track.title,
    duration_ms: track.duration * 1000,
    explicit: track.explicit_lyrics,
    popularity: clampTo100(Math.round(track.rank / 10000)),
    preview_url: track.preview,
    track_number: track.track_position,
    type: 'track',
    artists,
    album: mappedAlbum,
  }

  if (includeAlbumTracks) {
    mappedAlbum.tracks = mapTrackList(
      album.tracks.data,
      album,
      artistDetailsById,
      artistGenresById,
    )
  }

  return mappedTrack
}
