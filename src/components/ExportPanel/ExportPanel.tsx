import { useMemo, useState } from 'react'
import { getAlbum, getArtist, getTrack } from '../../api/deezer'
import type {
  DeezerAlbumDetail,
  DeezerArtistDetail,
  DeezerTrackDetail,
  PlaylistEntry,
} from '../../types'
import { mapDeezerToTrack } from '../../utils/mapper'
import { ExportProgress } from './ExportProgress'

interface ExportPanelProps {
  entries: PlaylistEntry[]
}

interface EnrichedTrack {
  track: DeezerTrackDetail
  album: DeezerAlbumDetail
}

const WAIT_BETWEEN_TRACKS_MS = 2000
const MIN_EXPORT_TRACKS = 30

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs)
  })
}

export function ExportPanel({ entries }: ExportPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progressTrackName, setProgressTrackName] = useState('')
  const [processedTracks, setProcessedTracks] = useState(0)
  const [jsonResult, setJsonResult] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const hasMinimumTracks = entries.length >= MIN_EXPORT_TRACKS
  const canGenerate = hasMinimumTracks && !isGenerating

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setProcessedTracks(0)
    setProgressTrackName('')
    setJsonResult('')

    const artistCache = new Map<number, DeezerArtistDetail>()
    const albumGenreByArtistId = new Map<number, Set<string>>()
    const enrichedTracks: EnrichedTrack[] = []

    try {
      for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index]
        setProgressTrackName(entry.name)

        const track = await getTrack(entry.deezer_id)
        const [album, mainArtist] = await Promise.all([
          getAlbum(track.album.id),
          artistCache.has(track.artist.id)
            ? Promise.resolve(artistCache.get(track.artist.id)!)
            : getArtist(track.artist.id),
        ])

        artistCache.set(mainArtist.id, mainArtist)

        const contributorIds = new Set<number>([
          track.artist.id,
          ...(track.contributors?.map((artist) => artist.id) ?? []),
          ...(album.contributors?.map((artist) => artist.id) ?? []),
        ])

        const missingArtists = Array.from(contributorIds).filter(
          (artistId) => !artistCache.has(artistId),
        )

        if (missingArtists.length) {
          const fetchedArtists = await Promise.all(
            missingArtists.map((artistId) => getArtist(artistId)),
          )

          fetchedArtists.forEach((artist) => {
            artistCache.set(artist.id, artist)
          })
        }

        const albumGenres = album.genres.data.map((genre) => genre.name)
        for (const contributor of album.contributors ?? []) {
          const genreSet = albumGenreByArtistId.get(contributor.id) ?? new Set<string>()
          albumGenres.forEach((genre) => genreSet.add(genre))
          albumGenreByArtistId.set(contributor.id, genreSet)
        }

        enrichedTracks.push({ track, album })
        setProcessedTracks(index + 1)

        if (index < entries.length - 1) {
          await wait(WAIT_BETWEEN_TRACKS_MS)
        }
      }

      const mappedTracks = enrichedTracks.map(({ track, album }) =>
        mapDeezerToTrack(track, album, artistCache, albumGenreByArtistId),
      )

      setJsonResult(JSON.stringify(mappedTracks, null, 2))
    } catch {
      setError('Erreur lors de la génération JSON. Veuillez réessayer.')
    } finally {
      setIsGenerating(false)
      setProgressTrackName('')
    }
  }

  const downloadUrl = useMemo(() => {
    if (!jsonResult) {
      return ''
    }

    const blob = new Blob([jsonResult], { type: 'application/json' })
    return URL.createObjectURL(blob)
  }, [jsonResult])

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Export JSON</h2>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          {jsonResult ? '🔄 Régénérer' : 'Générer le JSON'}
        </button>

        {hasMinimumTracks && jsonResult ? (
          <a
            href={downloadUrl}
            download="tracks.json"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            📥 Télécharger tracks.json
          </a>
        ) : null}
      </div>

      {isGenerating ? (
        <div className="mt-3">
          <ExportProgress
            current={processedTracks}
            total={entries.length}
            trackName={progressTrackName}
          />
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}

      {!hasMinimumTracks ? (
        <p className="mt-3 text-sm text-slate-600">
          Il faut au moins {MIN_EXPORT_TRACKS} musiques dans la playlist pour générer le JSON.
        </p>
      ) : null}

      {hasMinimumTracks && jsonResult ? (
        <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
          <code>{jsonResult}</code>
        </pre>
      ) : null}
    </section>
  )
}
