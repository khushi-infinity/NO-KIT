import { createRoot } from 'react-dom/client'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BookOpen, Camera, Check, ChevronDown, CircleHelp, Compass, Globe2, LockKeyhole, Music2, NotebookPen, Sprout, Sparkles, Star, Trees, Trophy, Volume2, VolumeX, Wind, X } from 'lucide-react'
import { compressImage, demoMaterials, detectMaterials, type Material } from './api'
import './styles.css'
import './polish.css'

type Screen = 'home' | 'explore' | 'journal' | 'grass' | 'scan' | 'challenges' | 'mission' | 'build' | 'attempt' | 'prediction' | 'outside' | 'result' | 'discovery' | 'shelf'
const materials = demoMaterials.materials

function Logo() { return <div className="logo"><span>NO</span>-KIT<small>build with what you have</small></div> }

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scanPreview, setScanPreview] = useState('')
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>(materials)
  const [hintLevel, setHintLevel] = useState(0)
  const [result, setResult] = useState<'worked' | 'moved' | 'still' | 'broke' | null>(null)
  const [showWhy, setShowWhy] = useState(false)
  const [attempts, setAttempts] = useState(1)
  const [prediction, setPrediction] = useState('')
  const [observation, setObservation] = useState('')
  useEffect(() => localStorage.setItem('no-kit-progress', JSON.stringify({ attempts, prediction, observation, unlocked: screen === 'discovery' })), [attempts, prediction, observation, screen])
  const go = (next: Screen) => setScreen(next)
  const startScan = async (file?: File) => {
    setScanning(true)
    setScanError('')
    try {
      if (!file) throw new Error('Choose a photo to scan.')
      const image = await compressImage(file)
      setScanPreview(image)
      const response = await detectMaterials(image)
      setSelectedMaterials(response.materials)
    } catch (error) {
      setSelectedMaterials(materials)
      setScanError(error instanceof Error ? error.message : 'We could not read that image.')
    } finally {
      setScanning(false)
      go('scan')
    }
  }
  const toggleMaterial = (material: string) => setSelectedMaterials((current) => current.some((item) => item.name === material) ? current.filter((item) => item.name !== material) : [...current, { name: material, confidence: 1, properties: [] }])
  const removeScan = () => { setScanPreview(''); setScanError(''); setSelectedMaterials(materials) }
  if (screen === 'grass') return <GrassMode onExit={() => go('home')} />
  return <main className="app-shell">
    <header className="topbar"><button className="grass-button" aria-label="Touch grass" onClick={() => go('grass')}><Sprout size={20} /><span>touch grass</span></button><Logo /><nav className="site-nav" aria-label="Main navigation"><button className={screen === 'home' || screen === 'scan' ? 'active' : ''} onClick={() => go('home')}>PLAY</button><button className={screen === 'explore' ? 'active' : ''} onClick={() => go('explore')}>EXPLORE</button><button className={screen === 'journal' ? 'active' : ''} onClick={() => go('journal')}>JOURNAL</button></nav><div className="topbar-actions"><MusicToggle /><button className="shelf-button" aria-label="Open my shelf" onClick={() => go('shelf')}><span>MY SHELF</span><span className="shelf-count">1</span></button></div></header>
    {screen === 'home' && <Home onPlay={() => go('scan')} onShelf={() => go('shelf')} />}
    {screen === 'explore' && <Explore onBuild={() => go('scan')} />}
    {screen === 'journal' && <Journal onPlay={() => go('scan')} />}
    {screen === 'scan' && <Scan scanning={scanning} error={scanError} preview={scanPreview} materials={selectedMaterials} onScan={startScan} onRemove={removeScan} onToggle={toggleMaterial} onContinue={() => go('challenges')} />}
    {screen === 'challenges' && <Challenges onBuild={() => go('mission')} />}
    {screen === 'mission' && <Mission materials={selectedMaterials} onReady={() => go('build')} />}
    {screen === 'build' && <Build hintLevel={hintLevel} onHint={() => setHintLevel(Math.min(3, hintLevel + 1))} onBuilt={() => go('attempt')} onStuck={() => setHintLevel(1)} />}
    {screen === 'attempt' && <Attempt onTest={() => go('prediction')} />}
    {screen === 'prediction' && <Prediction value={prediction} onChange={setPrediction} onContinue={() => go('outside')} />}
    {screen === 'outside' && <Outside onBack={() => go('result')} />}
    {screen === 'result' && <Result result={result} setResult={setResult} observation={observation} onObservation={setObservation} onRetry={() => { setAttempts(attempts + 1); go('build') }} onSuccess={() => go('discovery')} />}
    {screen === 'discovery' && <Discovery showWhy={showWhy} onWhy={() => setShowWhy(!showWhy)} onShelf={() => go('shelf')} />}
    {screen === 'shelf' && <Shelf onBuild={() => go('scan')} />}
    <div className="blob blob-one" aria-hidden="true" /><div className="blob blob-two" aria-hidden="true" /><div className="playful-decor" aria-hidden="true"><span>✦</span><i>·</i><b>↝</b><em>✧</em></div>
  </main>
}

function GrassMode({ onExit }: { onExit: () => void }) {
  const [touched, setTouched] = useState<number[]>([])
  const [windAngle, setWindAngle] = useState(0)
  const blades = Array.from({ length: 260 }, (_, index) => index)
  const touchGrass = (index: number) => setTouched((current) => current.includes(index) ? current : [...current, index])
  return <main className="grass-mode"><button className="grass-close" aria-label="Leave Grass Mode" onClick={onExit}><X size={22} /></button><div className="grass-field" onPointerMove={(event) => { const bounds = event.currentTarget.getBoundingClientRect(); setWindAngle(((event.clientX - bounds.left) / bounds.width - .5) * 18) }} onPointerLeave={() => setWindAngle(0)}><div className="grass-message"><span>FIELD STUDY 001</span><strong>{touched.length ? `${touched.length} blades moved` : 'touch the meadow.'}</strong><small>{touched.length > 8 ? 'the field is listening.' : 'move slowly through the grass.'}</small></div><div className="grass-blades">{blades.map((index) => <button key={index} className={`grass-blade ${touched.includes(index) ? 'touched' : ''}`} style={{ ['--left' as string]: `${(index * 47) % 101}%`, ['--top' as string]: `${(index * 53) % 96}%`, ['--tilt' as string]: `${(index % 7) - 3}deg`, ['--height' as string]: `${70 + (index % 8) * 18}px`, ['--scale' as string]: `${.58 + (index % 8) * .08}`, ['--depth' as string]: `${index % 9}`, ['--wind-angle' as string]: `${windAngle}deg`, ['--delay' as string]: `${(index % 9) * -.18}s` }} onPointerEnter={() => touchGrass(index)} onPointerMove={() => touchGrass(index)} onPointerDown={() => touchGrass(index)} aria-label={`Touch grass blade ${index + 1}`}><i /><i /><i /></button>)}</div></div><div className="grass-footer"><span>NO-KIT · FIELD STUDY</span><button onClick={onExit}>BACK TO MAKING <ArrowRight size={18} /></button></div></main>
}

function MusicToggle() {
  const [playing, setPlaying] = useState(false)
  const audioContext = useRef<AudioContext | null>(null)
  const timer = useRef<number | null>(null)
  const note = useRef(0)
  const audioStarted = useRef(false)
  const gestureHandler = useRef<(() => void) | null>(null)
  const melody = [261.63, 329.63, 392, 523.25, 440, 392, 329.63, 293.66, 261.63, 329.63, 440, 587.33, 523.25, 440, 392, 329.63]

  const startMusic = () => {
    if (audioStarted.current) return
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    audioContext.current = context
    audioStarted.current = true
    void context.resume().then(() => {
      if (!audioStarted.current) return
      setPlaying(true)
      playNote()
      timer.current = window.setInterval(playNote, 270)
      if (gestureHandler.current) window.removeEventListener('pointerdown', gestureHandler.current)
    }).catch(() => { audioStarted.current = false; setPlaying(false) })
  }

  useEffect(() => {
    const startOnFirstGesture = () => { startMusic() }
    gestureHandler.current = startOnFirstGesture
    startMusic()
    window.addEventListener('pointerdown', startOnFirstGesture)
    return () => { window.removeEventListener('pointerdown', startOnFirstGesture); gestureHandler.current = null; if (timer.current) window.clearInterval(timer.current); audioContext.current?.close() }
  }, [])

  const playNote = () => {
    const context = audioContext.current
    if (!context) return
    const step = note.current % melody.length
    const now = context.currentTime
    const playVoice = (frequency: number, type: OscillatorType, peak: number, length: number, detune = 0) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = type
      oscillator.frequency.value = frequency
      oscillator.detune.value = detune
      gain.gain.setValueAtTime(.0001, now)
      gain.gain.exponentialRampToValueAtTime(peak, now + .015)
      gain.gain.exponentialRampToValueAtTime(.0001, now + length)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(now)
      oscillator.stop(now + length + .02)
    }
    const bassLine = [130.81, 130.81, 146.83, 164.81, 174.61, 174.61, 196, 220]
    const chords = [[261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66]]

    playVoice(melody[step], 'square', .012, .17, -5)
    playVoice(melody[step] * 1.5, 'triangle', .005, .13, 4)
    playVoice(bassLine[Math.floor(step / 2) % bassLine.length], 'sawtooth', .014, .23)
    if (step % 4 === 0) chords[step / 4].forEach((frequency) => playVoice(frequency, 'sine', .004, 1.05))

    if (step % 4 === 0) {
      const kick = context.createOscillator()
      const kickGain = context.createGain()
      kick.type = 'sine'
      kick.frequency.setValueAtTime(120, now)
      kick.frequency.exponentialRampToValueAtTime(55, now + .13)
      kickGain.gain.setValueAtTime(.045, now)
      kickGain.gain.exponentialRampToValueAtTime(.0001, now + .16)
      kick.connect(kickGain).connect(context.destination)
      kick.start(now)
      kick.stop(now + .18)
    }
    if (step % 2 === 1) {
      const noise = context.createBufferSource()
      const buffer = context.createBuffer(1, context.sampleRate * .045, context.sampleRate)
      const data = buffer.getChannelData(0)
      for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1
      const hatGain = context.createGain()
      noise.buffer = buffer
      hatGain.gain.setValueAtTime(.009, now)
      hatGain.gain.exponentialRampToValueAtTime(.0001, now + .045)
      noise.connect(hatGain).connect(context.destination)
      noise.start(now)
    }
    note.current += 1
  }

  const toggle = () => {
    if (!audioStarted.current || !playing) {
      startMusic()
      return
    }
    if (playing) {
      if (timer.current) window.clearInterval(timer.current)
      timer.current = null
      audioStarted.current = false
      void audioContext.current?.close()
      audioContext.current = null
      setPlaying(false)
      return
    }
    startMusic()
  }

  return <button className={`music-toggle ${playing ? 'playing' : ''}`} onClick={toggle} aria-label={playing ? 'Turn music off' : 'Start music'} title={playing ? 'Music is on' : 'Start music'}>{playing ? <Volume2 size={17} /> : <VolumeX size={17} />}<Music2 size={13} /></button>
}

function Explore({ onBuild }: { onBuild: () => void }) {
  const challenges = [
    ['WIND HACKER', 'Show which way the wind is coming from.', 'AERODYNAMICS', '15 MIN', 'GOOD OUTSIDE', true],
    ['SHADOW CLOCK', 'Use sunlight to tell a story about time.', 'EARTH + SHADOWS', '20 MIN', 'GOOD OUTSIDE', false],
    ['RAIN MEASURER', 'Make a tool that can compare rainfall.', 'MEASUREMENT', '10 MIN', 'GOOD OUTSIDE', false],
    ['BRIDGE BREAKER', 'Hold a target weight with a paper bridge.', 'STRUCTURES', '20 MIN', 'TABLETOP', false],
    ['SOUND PHONE', 'Send a voice across a gap without electronics.', 'VIBRATIONS', '15 MIN', 'GOOD OUTSIDE', false],
    ['PAPER GLIDER', 'Keep something in the air as long as possible.', 'FLIGHT', '15 MIN', 'OPEN SPACE', false],
  ]
  return <section className="website-page page-pad explore-page"><div className="website-heading"><div><div className="step-label">THE NO-KIT SHELF OF POSSIBILITIES</div><h2>Pick a problem.<br /><span>Make the answer.</span></h2></div><div className="heading-stamp"><Globe2 size={20} /> 8 FIELD TESTS</div></div><p className="lede">Every challenge starts with what is already in your hands. No shopping list. No tutorial rabbit hole.</p><div className="explore-grid">{challenges.map(([title, mission, concept, duration, badge, available]) => <article className={`explore-card ${available ? 'available' : 'coming'}`} key={title as string}><div className="explore-card-top"><span className="tag orange">{badge as string}</span>{available ? <span className="ready-dot">● READY</span> : <span className="coming-label">SOON</span>}</div><div className="explore-icon">{title === 'WIND HACKER' ? <Wind size={32} /> : title === 'SHADOW CLOCK' ? <Star size={32} /> : title === 'SOUND PHONE' ? <NotebookPen size={32} /> : <BookOpen size={32} />}</div><h3>{title as string}</h3><p>{mission as string}</p><div className="explore-meta"><span>{concept as string}</span><span>{duration as string}</span></div>{available ? <button className="card-button" onClick={onBuild}>PLAY THIS <ArrowRight size={17} /></button> : <div className="coming-note">Unlocks after your first discovery</div>}</article>)}</div></section>
}

function Journal({ onPlay }: { onPlay: () => void }) {
  const [saved, setSaved] = useState<{ attempts?: number, prediction?: string, observation?: string, unlocked?: boolean } | null>(null)
  useEffect(() => { const raw = localStorage.getItem('no-kit-progress'); if (raw) setSaved(JSON.parse(raw)) }, [])
  const hasEntry = Boolean(saved?.prediction || saved?.observation)
  return <section className="website-page page-pad journal-page"><div className="website-heading"><div><div className="step-label">YOUR FIELD NOTES</div><h2>Make, test,<br /><span>notice more.</span></h2></div><div className="heading-stamp"><NotebookPen size={20} /> LOCAL JOURNAL</div></div><div className="journal-summary"><div className="journal-stat"><Trophy size={20} /><strong>{saved?.unlocked ? '1' : '0'}</strong><span>discoveries</span></div><div className="journal-stat"><Trees size={20} /><strong>{saved?.unlocked ? '1' : '0'}</strong><span>outside tests</span></div><div className="journal-stat"><Star size={20} /><strong>{saved?.attempts ?? 0}</strong><span>attempts</span></div></div>{hasEntry ? <div className="journal-entry"><div className="entry-pin">✦</div><div><span className="tag orange">WIND HACKER · TODAY</span><h3>Your first field note</h3><div className="entry-lines"><p><b>Prediction</b>{saved?.prediction || 'Skipped this time.'}</p><p><b>Observation</b>{saved?.observation || 'No observation written yet.'}</p></div></div></div> : <div className="journal-empty"><div className="empty-icon"><NotebookPen size={32} /></div><h3>Your next discovery belongs here.</h3><p>Write one prediction, test one physical thing, and your field notes will start to grow.</p><button className="big-button yellow" onClick={onPlay}>START A FIELD TEST <ArrowRight size={21} /></button></div>}<p className="journal-footnote">Your notes stay on this device. No account. No feed. Just evidence of what you tried.</p></section>
}

function Home({ onPlay, onShelf }: { onPlay: () => void, onShelf: () => void }) { return <section className="home page-pad"><div className="eyebrow">A MAKER GAME FOR REAL LIFE <span>✦</span></div><h1>Don't buy a kit.<br /><em>Build with</em><br />what you have.</h1><ObjectDoodle /><button className="big-button yellow" onClick={onPlay}>PLAY <ArrowRight size={25} /></button><button className="text-button" onClick={onShelf}>see my shelf <span>→</span></button><p className="home-note">The screen is the shortest part.</p></section> }
function ObjectDoodle() { return <div className="object-doodle" aria-label="A playful illustration of cardboard, a straw, tape, and pencil"><div className="sun">✦</div><div className="box-shape">NO<br /><small>KIT</small></div><div className="straw-shape" /><div className="tape-shape">○</div><div className="pencil-shape" /></div> }

function Scan({ scanning, error, preview, materials, onScan, onRemove, onToggle, onContinue }: { scanning: boolean, error: string, preview: string, materials: Material[], onScan: (file?: File) => void, onRemove: () => void, onToggle: (m: string) => void, onContinue: () => void }) { return <section className="page-pad scan-page"><div className="step-label">01 / LOOK</div><h2>What do you<br /><span>have?</span></h2><p className="lede">Put a few random things on the floor. We'll figure out what you can build.</p><div className={`camera-box ${scanning ? 'scanning' : ''}`}>{preview && !scanning && <img className="scan-preview" src={preview} alt="Preview of uploaded materials" />}<div className="corner corner-a" /><div className="corner corner-b" />{!preview && <div className="camera-icon"><Camera size={34} /></div>}<strong>{scanning ? 'LOOKING...' : error ? 'SCAN AGAIN' : preview ? 'PHOTO READY' : 'YOUR MATERIALS'}</strong><small>{scanning ? 'COMPRESSING · READING · SORTING' : error || (preview ? 'materials detected below' : 'a little pile of possibilities')}</small>{scanning && <div className="scan-line" />}</div><div className="scan-actions"><label className="outline-button"><Camera size={20} /> TAKE A PHOTO<input type="file" accept="image/*" capture="environment" onChange={(event) => onScan(event.target.files?.[0])} /></label><label className="upload-button">USE A PHOTO<input type="file" accept="image/*" onChange={(event) => onScan(event.target.files?.[0])} /></label></div>{preview && <button className="text-button remove-photo" onClick={onRemove}>remove photo · try again</button>}<div className="detected-head"><span>{scanning ? 'IDENTIFYING...' : 'I SPY'}</span><small>tap to remove · add below</small></div><div className="chips">{materials.map((material) => <button className="chip" key={material.name} title={`${Math.round(material.confidence * 100)}% confidence`} onClick={() => onToggle(material.name)}>{material.name}<span>×</span></button>)}<button className="chip add-chip" onClick={() => { const name = window.prompt('Add a material'); if (name?.trim()) onToggle(name.trim().toLowerCase()) }}>+ add material</button></div><button className="big-button coral" disabled={!materials.length} onClick={onContinue}>FIND A CHALLENGE <ArrowRight size={22} /></button></section> }

function Challenges({ onBuild }: { onBuild: () => void }) { return <section className="page-pad"><div className="step-label">02 / CHALLENGE</div><h2>Pick your<br /><span>mission.</span></h2><p className="lede">Three ways to turn your pile into a real-world experiment.</p><div className="challenge-stack"><article className="challenge-card featured"><div className="card-top"><span className="tag orange">GOOD OUTSIDE</span><span className="dots">•••</span></div><div className="challenge-icon wind-icon"><Wind size={52} /></div><h3>WIND<br />HACKER</h3><p>Build something that can show which way the wind is coming from.</p><div className="card-meta"><span>◷ 15 MIN</span><span>✦ AERODYNAMICS</span></div><button className="card-button" onClick={onBuild}>BUILD THIS <ArrowRight size={18} /></button></article><article className="challenge-card locked"><LockKeyhole size={21} /><strong>MORE MISSIONS<br />ARE HIDING</strong><small>Build one to unlock them</small></article></div></section> }

function Mission({ materials: availableMaterials, onReady }: { materials: Material[], onReady: () => void }) { return <section className="page-pad mission"><div className="step-label">MISSION 01</div><div className="mission-mark">✦</div><h2>Make something<br />that knows<br /><span>the wind.</span></h2><div className="materials-note"><small>YOU HAVE</small><div>{availableMaterials.map((material) => <span key={material.name}>{material.name}</span>)}</div></div><ul className="rules"><li>use only these materials</li><li>no searching tutorials</li><li>test it in the real world</li></ul><button className="big-button yellow" onClick={onReady}>I'M READY <ArrowRight size={25} /></button></section> }

function Build({ hintLevel, onHint, onBuilt, onStuck }: { hintLevel: number, onHint: () => void, onBuilt: () => void, onStuck: () => void }) { const hints = ['What could move when air pushes it?', 'One part needs to catch the breeze. Which part should be bigger?', 'Make the two ends different: a broad tail and a light pointer.']; return <section className="page-pad build"><div className="build-sky"><div className="step-label">03 / BUILD</div><div className="build-time">BUILD TIME <span>⌁</span></div><h2>Put your<br /><span>phone down.</span></h2><p>Try it yourself. You'll know when it feels ready.</p><div className="wind-lines"><i /><i /><i /></div></div><div className="build-panel"><div className="build-status"><span className="status-dot" /> YOU'RE IN THE BUILD ZONE</div>{hintLevel > 0 && <div className="hint-card"><div>HINT {hintLevel} <span>✦</span></div><p>{hints[hintLevel - 1]}</p>{hintLevel < 3 && <button onClick={onHint}>a little more help →</button>}</div>}<button className="big-button coral" onClick={onBuilt}>I BUILT SOMETHING <Check size={22} /></button><button className="stuck-button" onClick={() => { onStuck(); onHint() }}>I'M STUCK <CircleHelp size={19} /></button></div></section> }

function Attempt({ onTest }: { onTest: () => void }) { const [photo, setPhoto] = useState(''); return <section className="page-pad attempt"><div className="step-label">04 / SHOW ME</div><h2>Is it<br /><span>ready?</span></h2><div className={`attempt-frame ${photo ? 'has-photo' : ''}`}>{photo ? <img style={{ width: '100%', height: '100%', objectFit: 'cover' }} src={photo} alt="Preview of the build" /> : <><div className="attempt-object"><div className="pointer" /><div className="tail" /></div><span>YOUR BUILD GOES HERE</span></>}</div><p className="lede">{photo ? 'Nice. Your build is ready to test.' : 'Give it a quick look. Does it have a chance out there?'}</p><button className="big-button yellow" onClick={onTest}>TEST IT OUTSIDE <Compass size={23} /></button><label className="text-button">take a photo instead <Camera size={17} /><input style={{ display: 'none' }} type="file" accept="image/*" capture="environment" onChange={(event) => { const file = event.target.files?.[0]; if (file) setPhoto(URL.createObjectURL(file)) }} /></label></section> }

function Prediction({ value, onChange, onContinue }: { value: string, onChange: (value: string) => void, onContinue: () => void }) { return <section className="page-pad prediction"><div className="step-label">05 / PREDICT</div><h2>What do you<br /><span>think?</span></h2><p className="lede">Make a tiny prediction before the real-world test.</p><div className="journal-prompt"><span>✦</span><p>When the wind reaches your build, what will it do?</p></div><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder="I think it will..." aria-label="Your prediction" /><button className="big-button yellow" onClick={onContinue}>SAVE & GO OUTSIDE <ArrowRight size={22} /></button><button className="text-button" onClick={onContinue}>skip for now <ArrowRight size={16} /></button></section> }

function Outside({ onBack }: { onBack: () => void }) { return <section className="outside"><div className="outside-stars">✦　·　✧</div><div className="step-label">05 / GO</div><h2>GO<br /><span>OUTSIDE.</span></h2><div className="outside-instructions"><p>Find somewhere you can feel the wind.</p><p>Put your build down.<br />Watch what happens.</p></div><div className="pocket">PHONE<br />IN POCKET</div><button className="big-button yellow" onClick={onBack}>I'M BACK <ArrowRight size={23} /></button></section> }

function Result({ result, setResult, observation, onObservation, onRetry, onSuccess }: { result: string | null, setResult: (r: 'worked' | 'moved' | 'still' | 'broke') => void, observation: string, onObservation: (value: string) => void, onRetry: () => void, onSuccess: () => void }) { return <section className="page-pad result"><div className="step-label">06 / OBSERVE</div><h2>What<br /><span>happened?</span></h2><div className="result-options">{[['worked', 'It worked', '✦'], ['moved', "It moved but didn't settle", '↝'], ['still', "It didn't move", '○'], ['broke', 'Something broke', '×']].map(([id, label, icon]) => <button className={result === id ? 'chosen' : ''} key={id} onClick={() => setResult(id as 'worked' | 'moved' | 'still' | 'broke')}><span>{icon}</span>{label}{result === id && <Check size={19} />}</button>)}</div><textarea className="observation-input" value={observation} onChange={(event) => onObservation(event.target.value)} placeholder="I noticed..." aria-label="What you observed" />{result && <div className="result-message">{result === 'worked' ? 'That sounds like a discovery.' : 'Interesting. That is useful information.'}</div>}<button className="big-button coral" disabled={!result} onClick={result === 'worked' ? onSuccess : onRetry}>{result === 'worked' ? 'UNLOCK DISCOVERY' : 'TRY ONE MORE THING'} <ArrowRight size={22} /></button></section> }

function Discovery({ showWhy, onWhy, onShelf }: { showWhy: boolean, onWhy: () => void, onShelf: () => void }) { return <section className="page-pad discovery"><div className="discovery-burst">★</div><div className="step-label">DISCOVERY UNLOCKED</div><h2>You built<br /><span>a wind vane.</span></h2><p className="discovery-copy">The larger tail catches more wind. That force turns the smaller pointer into the wind.</p><div className="concepts"><span>AERODYNAMICS</span><span>FORCES</span><span>DIRECTION</span></div><button className="why-button" onClick={onWhy}>WHY? <ChevronDown size={17} /></button>{showWhy && <div className="why-card">Air pushes harder on the larger surface. The uneven force makes your build rotate until it points into the wind.</div>}<div className="discovery-object"><Wind size={40} /></div><button className="big-button yellow" onClick={onShelf}>PUT IT ON MY SHELF <ArrowRight size={22} /></button></section> }

function Shelf({ onBuild }: { onBuild: () => void }) { return <section className="page-pad shelf"><div className="step-label">YOUR COLLECTION</div><h2>My<br /><span>shelf.</span></h2><p className="lede">Things you've figured out with your own two hands.</p><div className="shelf-card"><div className="sticker-star">★</div><div className="shelf-object"><Wind size={45} /></div><div><span className="tag orange">DISCOVERED</span><h3>WIND VANE</h3><small>wind · force · direction</small></div></div><div className="locked-shelf"><LockKeyhole size={19} /><span>more discoveries<br /><small>waiting in the world</small></span></div><button className="big-button coral" onClick={onBuild}>BUILD SOMETHING ELSE <Sparkles size={21} /></button></section> }

createRoot(document.getElementById('root')!).render(<App />)