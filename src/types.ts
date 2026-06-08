export interface Image {
  height: number
  url: string
  width: number
}

export interface Artist {
  followers: { total: number }
  genres: string[]
  id: string
  images: Image[]
  name: string
  popularity: number
  type: string
}

export interface Album {
  album_type: string
  total_tracks: number
  id: string
  images: Image[]
  name: string
  release_date: string
  release_date_precision: string
  type: string
  genres: string[]
  popularity: number
  artists: Artist[]
  tracks: Track[]
}

export interface Track {
  album: Album
  artists: Artist[]
  duration_ms: number
  explicit: boolean
  id: string
  name: string
  popularity: number
  preview_url: string
  track_number: number
  type: string
}

export interface PlaylistEntry {
  deezer_id: number
  name: string
  artist_name: string
  album_name: string
  duration_ms: number
  explicit: boolean
}

export interface DeezerSearchTrack {
  id: number
  title: string
  duration: number
  explicit_lyrics: boolean
  preview: string
  rank: number
  artist: {
    id: number
    name: string
  }
  album: {
    id: number
    title: string
    cover_small: string
  }
}

export interface DeezerTrackDetail {
  id: number
  title: string
  duration: number
  explicit_lyrics: boolean
  preview: string
  rank: number
  track_position: number
  contributors?: DeezerArtistSummary[]
  artist: DeezerArtistSummary
  album: {
    id: number
    title: string
  }
}

export interface DeezerTrackSummary {
  id: number
  title: string
  duration: number
  explicit_lyrics: boolean
  preview: string
  rank: number
  track_position?: number
  artist?: DeezerArtistSummary
  contributors?: DeezerArtistSummary[]
}

export interface DeezerArtistSummary {
  id: number
  name: string
}

export interface DeezerAlbumDetail {
  id: number
  title: string
  record_type: string
  nb_tracks: number
  release_date: string
  fans: number
  cover_small: string
  cover_medium: string
  cover_big: string
  cover_xl: string
  genres: { data: Array<{ id: number; name: string }> }
  contributors?: DeezerArtistSummary[]
  tracks: {
    data: DeezerTrackSummary[]
  }
}

export interface DeezerArtistDetail {
  id: number
  name: string
  nb_fan: number
  picture_small: string
  picture_medium: string
  picture_big: string
  picture_xl: string
}
