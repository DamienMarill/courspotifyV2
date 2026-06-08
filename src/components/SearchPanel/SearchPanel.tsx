import { useState } from 'react'
import { searchTracks } from '../../api/deezer'
import type { DeezerSearchTrack, PlaylistEntry } from '../../types'
import { SearchBar } from './SearchBar'
import { TrackResult } from './TrackResult'

interface SearchPanelProps {
  playlistIds: Set<number>
  isPlaylistFull: boolean
  onAddEntry: (entry: PlaylistEntry) => void
}

function SkeletonLoader() {
  return (
    <ul className="space-y-2" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index} className="animate-pulse rounded-lg border border-slate-200 p-3">
          <div className="h-14 w-14 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-2/3 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
        </li>
      ))}
    </ul>
  )
}

export function SearchPanel({
  playlistIds,
  isPlaylistFull,
  onAddEntry,
}: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<DeezerSearchTrack[]>([])

  const runSearch = async () => {
    if (!query.trim()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const tracks = await searchTracks(query)
      setResults(tracks.slice(0, 5))
    } catch {
      setError("Erreur lors de l'appel API Deezer. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Recherche</h2>
      <SearchBar
        query={query}
        isLoading={isLoading}
        onQueryChange={setQuery}
        onSearch={runSearch}
      />

      <div className="mt-4">
        {isLoading ? <SkeletonLoader /> : null}

        {error ? (
          <p className="rounded-md bg-rose-100 p-2 text-sm text-rose-700">{error}</p>
        ) : null}

        {!isLoading && !error && results.length > 0 ? (
          <ul className="space-y-3">
            {results.map((track) => (
              <TrackResult
                key={track.id}
                track={track}
                isInPlaylist={playlistIds.has(track.id)}
                isPlaylistFull={isPlaylistFull}
                onAdd={onAddEntry}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
