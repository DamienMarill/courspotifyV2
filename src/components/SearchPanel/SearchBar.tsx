interface SearchBarProps {
  query: string
  isLoading: boolean
  onQueryChange: (value: string) => void
  onSearch: () => void
}

export function SearchBar({
  query,
  isLoading,
  onQueryChange,
  onSearch,
}: SearchBarProps) {
  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch()
      }}
    >
      <input
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Rechercher un track Deezer..."
        aria-label="Recherche de tracks"
      />
      <button
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        type="submit"
        disabled={isLoading || !query.trim()}
      >
        Rechercher
      </button>
    </form>
  )
}
