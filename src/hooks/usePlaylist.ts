import { useCallback, useMemo, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type { PlaylistEntry } from '../types'

const STORAGE_KEY = 'deezer_playlist_entries'
const PLAYLIST_MAX = 50

function readStoredEntries(): PlaylistEntry[] {
  const rawEntries = localStorage.getItem(STORAGE_KEY)

  if (!rawEntries) {
    return []
  }

  try {
    const parsed = JSON.parse(rawEntries)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (entry): entry is PlaylistEntry =>
        typeof entry?.deezer_id === 'number' &&
        typeof entry?.name === 'string' &&
        typeof entry?.artist_name === 'string' &&
        typeof entry?.album_name === 'string' &&
        typeof entry?.duration_ms === 'number' &&
        typeof entry?.explicit === 'boolean',
    )
  } catch {
    return []
  }
}

function persistEntries(entries: PlaylistEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function usePlaylist() {
  const [entries, setEntries] = useState<PlaylistEntry[]>(readStoredEntries)

  const addEntry = useCallback((entry: PlaylistEntry) => {
    setEntries((previousEntries) => {
      if (previousEntries.length >= PLAYLIST_MAX) {
        return previousEntries
      }

      if (previousEntries.some((item) => item.deezer_id === entry.deezer_id)) {
        return previousEntries
      }

      const nextEntries = [...previousEntries, entry]
      persistEntries(nextEntries)
      return nextEntries
    })
  }, [])

  const removeEntry = useCallback((deezerId: number) => {
    setEntries((previousEntries) => {
      const nextEntries = previousEntries.filter(
        (entry) => entry.deezer_id !== deezerId,
      )
      persistEntries(nextEntries)
      return nextEntries
    })
  }, [])

  const reorderEntries = useCallback((oldIndex: number, newIndex: number) => {
    setEntries((previousEntries) => {
      const nextEntries = arrayMove(previousEntries, oldIndex, newIndex)
      persistEntries(nextEntries)
      return nextEntries
    })
  }, [])

  const moveUp = useCallback((index: number) => {
    if (index <= 0) {
      return
    }

    reorderEntries(index, index - 1)
  }, [reorderEntries])

  const moveDown = useCallback((index: number) => {
    if (index < 0 || index >= entries.length - 1) {
      return
    }

    reorderEntries(index, index + 1)
  }, [entries.length, reorderEntries])

  const entryIds = useMemo(
    () => new Set(entries.map((entry) => entry.deezer_id)),
    [entries],
  )

  return {
    entries,
    addEntry,
    removeEntry,
    reorderEntries,
    moveUp,
    moveDown,
    entryIds,
    isFull: entries.length >= PLAYLIST_MAX,
    maxSize: PLAYLIST_MAX,
  }
}
