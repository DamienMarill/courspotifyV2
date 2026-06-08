import type {
  DeezerAlbumDetail,
  DeezerArtistDetail,
  DeezerSearchTrack,
  DeezerTrackDetail,
} from '../types'

const API_BASE_URL = 'https://api.deezer.com/2.0'
const JSONP_TIMEOUT_MS = 10_000

interface DeezerApiError {
  error: {
    code?: number
    message?: string
    type?: string
  }
}

function hasDeezerError(value: unknown): value is DeezerApiError {
  if (!value || typeof value !== 'object' || !('error' in value)) {
    return false
  }

  const maybeError = value.error

  return Boolean(maybeError && typeof maybeError === 'object')
}

function buildDeezerJsonpUrl(path: string, callbackName: string): string {
  const separator = path.includes('?') ? '&' : '?'
  return `${API_BASE_URL}${path}${separator}output=jsonp&callback=${encodeURIComponent(callbackName)}`
}

async function fetchDeezer<T>(path: string): Promise<T> {
  if (typeof document === 'undefined') {
    throw new Error('Deezer API JSONP requests require a browser environment.')
  }

  return new Promise<T>((resolve, reject) => {
    const callbackName = `deezerJsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const callbackContainer = window as unknown as Record<string, unknown>
    const script = document.createElement('script')
    const timeoutId = window.setTimeout(() => {
      cleanup()
      reject(new Error('Deezer API request timed out.'))
    }, JSONP_TIMEOUT_MS)

    const cleanup = () => {
      window.clearTimeout(timeoutId)
      script.remove()
      delete callbackContainer[callbackName]
    }

    callbackContainer[callbackName] = (payload: unknown) => {
      cleanup()

      if (hasDeezerError(payload)) {
        reject(
          new Error(
            `Deezer API error${payload.error.code ? ` (${payload.error.code})` : ''}: ${payload.error.message ?? 'Unknown error'}`,
          ),
        )
        return
      }

      resolve(payload as T)
    }

    script.onerror = () => {
      cleanup()
      reject(new Error('Unable to load Deezer API JSONP script.'))
    }

    script.src = buildDeezerJsonpUrl(path, callbackName)
    script.async = true
    document.head.appendChild(script)
  })
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
