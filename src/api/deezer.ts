import type {
  DeezerAlbumDetail,
  DeezerArtistDetail,
  DeezerSearchTrack,
  DeezerTrackDetail,
} from '../types'

const API_BASE_URL = 'https://api.deezer.com'

async function fetchDeezer<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`Deezer API error (${response.status})`)
  }

  return response.json() as Promise<T>
}

export async function searchTracks(query: string): Promise<DeezerSearchTrack[]> {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return []
  }

  const data = await fetchDeezer<{ data: DeezerSearchTrack[] }>(
    `/search?q=${encodeURIComponent(trimmedQuery)}&limit=5`,
  )

  return data.data ?? []
}

export async function getTrack(id: number): Promise<DeezerTrackDetail> {
  return fetchDeezer<DeezerTrackDetail>(`/track/${id}`)
}

export async function getAlbum(id: number): Promise<DeezerAlbumDetail> {
  return fetchDeezer<DeezerAlbumDetail>(`/album/${id}`)
}

export async function getArtist(id: number): Promise<DeezerArtistDetail> {
  return fetchDeezer<DeezerArtistDetail>(`/artist/${id}`)
}
