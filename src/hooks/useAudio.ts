import { useContext } from 'react'
import { AudioContext, type AudioController } from './audioContext'

export function useAudioController(): AudioController {
  const context = useContext(AudioContext)

  if (!context) {
    throw new Error('useAudioController must be used within an AudioProvider')
  }

  return context
}
