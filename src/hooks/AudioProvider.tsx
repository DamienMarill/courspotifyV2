import { useCallback, useMemo, useRef } from 'react'
import { AudioContext } from './audioContext'

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const activeAudioRef = useRef<HTMLAudioElement | null>(null)

  const registerAndPlay = useCallback((audioElement: HTMLAudioElement) => {
    if (activeAudioRef.current && activeAudioRef.current !== audioElement) {
      activeAudioRef.current.pause()
      activeAudioRef.current.currentTime = 0
    }

    activeAudioRef.current = audioElement
  }, [])

  const unregister = useCallback((audioElement: HTMLAudioElement) => {
    if (activeAudioRef.current === audioElement) {
      activeAudioRef.current = null
    }
  }, [])

  const value = useMemo(
    () => ({ registerAndPlay, unregister }),
    [registerAndPlay, unregister],
  )

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}
