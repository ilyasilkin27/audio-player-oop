import { Playlist } from './models/Playlist.js'
import { Track } from './models/Track.js'
import { AudioPlayer } from './core/AudioPlayer.js'
import { SequentialStrategy } from './strategies/SequentialStrategy.js'
import { ShuffleStrategy } from './strategies/ShuffleStrategy.js'
import { RepeatOneStrategy } from './strategies/RepeatOneStrategy.js'
import { Renderer } from './ui/Renderer.js'

const STORAGE_KEY = 'audio-player-oop:state'

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {}
  } catch {
    return {}
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function strategyFromName(name) {
  switch (name) {
    case 'shuffle':
      return new ShuffleStrategy()
    case 'repeat-one':
      return new RepeatOneStrategy()
    default:
      return new SequentialStrategy()
  }
}

const demoTracks = [
  new Track({
    id: '1',
    title: 'Scott Joplin - Maple Leaf Rag (demo)',
    artist: 'Scott Joplin',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_3b5bbf0f76.mp3?filename=maple-leaf-rag-21623.mp3',
  }),
  new Track({
    id: '2',
    title: 'Acoustic Breeze (demo)',
    artist: 'Benjamin Tissot',
    url: 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3',
  }),
  new Track({
    id: '3',
    title: 'Creative Minds (demo)',
    artist: 'Benjamin Tissot',
    url: 'https://www.bensound.com/bensound-music/bensound-creativeminds.mp3',
  }),
]

const state = loadState()
const playlist = new Playlist(demoTracks)
if (state.currentId) playlist.setCurrentById(state.currentId)

const player = new AudioPlayer({
  playlist,
  strategy: strategyFromName(state.strategy),
})

player.addEventListener('trackchange', (e) => {
  const { track } = e.detail
  saveState({ ...state, currentId: track.id, strategy: player.strategy.name })
})

player.addEventListener('strategychange', () => {
  saveState({
    ...state,
    currentId: playlist.current?.id ?? null,
    strategy: player.strategy.name,
  })
})

const root = document.getElementById('app')
new Renderer(root, player)

document.addEventListener('click', (ev) => {
  const target = ev.target
  if (!(target instanceof HTMLButtonElement)) return
  const text = target.textContent || ''
  if (text === 'Sequential') player.setStrategy(new SequentialStrategy())
  if (text === 'Shuffle') player.setStrategy(new ShuffleStrategy())
  if (text === 'Repeat One') player.setStrategy(new RepeatOneStrategy())
})
