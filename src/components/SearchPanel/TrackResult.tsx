import { useEffect, useRef, useState } from 'react'
import type { DeezerSearchTrack, PlaylistEntry } from '../../types'
import { useAudioController } from '../../hooks/useAudio'

interface TrackResultProps {
  track: DeezerSearchTrack
  isInPlaylist: boolean
  isPlaylistFull: boolean
  onAdd: (entry: PlaylistEntry) => void
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

export function TrackResult({
  track,
  isInPlaylist,
  isPlaylistFull,
  onAdd,
}: TrackResultProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const { registerAndPlay, unregister } = useAudioController()
  const hasPreview = Boolean(track.preview)

  useEffect(() => {
    const currentAudio = audioRef.current

    if (!currentAudio) {
      return
    }

    const onPlay = () => {
      setIsPlaying(true)
      registerAndPlay(currentAudio)
    }
    const onPause = () => {
      setIsPlaying(false)
      unregister(currentAudio)
    }
    const onEnded = () => {
      setIsPlaying(false)
      unregister(currentAudio)
    }

    currentAudio.addEventListener('play', onPlay)
    currentAudio.addEventListener('pause', onPause)
    currentAudio.addEventListener('ended', onEnded)

    return () => {
      currentAudio.removeEventListener('play', onPlay)
      currentAudio.removeEventListener('pause', onPause)
      currentAudio.removeEventListener('ended', onEnded)
    }
  }, [registerAndPlay, unregister])

  const handleTogglePlayback = async () => {
    const currentAudio = audioRef.current

    if (!currentAudio || !hasPreview) {
      return
    }

    if (currentAudio.paused) {
      try {
        await currentAudio.play()
      } catch {
        setIsPlaying(false)
      }
      return
    }

    currentAudio.pause()
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <img
        src={track.album.cover_small}
        alt={`Pochette de ${track.album.title}`}
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded object-cover"
      />
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-sm">
        <p className="truncate font-semibold text-slate-900">{track.title}</p>
        <span className="shrink-0 text-slate-300">•</span>
        <p className="truncate text-slate-600">{track.artist.name}</p>
        <span className="shrink-0 text-xs text-slate-500">{formatDuration(track.duration)}</span>
        {track.explicit_lyrics ? (
          <span className="shrink-0 rounded bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
            🔞
          </span>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <audio ref={audioRef} preload="none" src={track.preview} className="hidden" />
        <button
          type="button"
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleTogglePlayback}
          disabled={!hasPreview}
          aria-label={isPlaying ? 'Mettre en pause l’extrait' : 'Lire l’extrait'}
          title={!hasPreview ? 'Aucun extrait disponible' : undefined}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
        {isInPlaylist ? (
          <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
            ✓ Dans la playlist
          </span>
        ) : (
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPlaylistFull}
            title={isPlaylistFull ? 'Playlist complète (50/50)' : undefined}
            onClick={() =>
              onAdd({
                deezer_id: track.id,
                name: track.title,
                artist_name: track.artist.name,
                album_name: track.album.title,
                duration_ms: track.duration * 1000,
                explicit: track.explicit_lyrics,
              })
            }
          >
            + Ajouter
          </button>
        )}
      </div>
    </li>
  )
}
