import { useAtom } from 'jotai'
import { countAtom } from './atoms'
import './App.css'

function App() {
  const [count, setCount] = useAtom(countAtom)

  return (
    <div>
      <h1>Vite + React + Jotai</h1>
      <button onClick={() => setCount((c) => c + 1)}>
        Count is {count}
      </button>
      <p>Edit <code>src/App.tsx</code> and save to test HMR</p>
    </div>
  )
}

export default App
