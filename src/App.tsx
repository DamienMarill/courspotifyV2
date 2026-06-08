import { SearchPanel } from './components/SearchPanel/SearchPanel'
import { PlaylistPanel } from './components/PlaylistPanel/PlaylistPanel'
import { ExportPanel } from './components/ExportPanel/ExportPanel'
import { usePlaylist } from './hooks/usePlaylist'
import { AudioProvider } from './hooks/AudioProvider'

function App() {
  const {
    entries,
    addEntry,
    removeEntry,
    reorderEntries,
    moveUp,
    moveDown,
    entryIds,
    isFull,
    maxSize,
  } = usePlaylist()

  return (
    <AudioProvider>
      <main className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Deezer Playlist Builder</h1>
          <div className="grid gap-4 lg:grid-cols-2">
            <SearchPanel
              playlistIds={entryIds}
              isPlaylistFull={isFull}
              onAddEntry={addEntry}
            />
            <PlaylistPanel
              entries={entries}
              maxSize={maxSize}
              onRemove={removeEntry}
              onReorder={reorderEntries}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
            />
          </div>
          <ExportPanel entries={entries} />
        </div>
      </main>
    </AudioProvider>
  )
}

export default App
