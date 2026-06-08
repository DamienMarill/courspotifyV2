import { createContext } from 'react'

export interface AudioController {
  registerAndPlay: (audioElement: HTMLAudioElement) => void
  unregister: (audioElement: HTMLAudioElement) => void
}

export const AudioContext = createContext<AudioController | null>(null)
