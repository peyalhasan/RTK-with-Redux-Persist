'use client' 
import { useDispatch, useSelector } from "react-redux";
import {increment, decrement, reset} from '../redux/features/counterSlice'

export default function Home() {


  const dispatch = useDispatch()

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '16px',
      }}
    >
      <h1>Next.js + RTK Persist</h1>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="bg-green-700 border rounded lg  p-2" onClick={() => dispatch(increment())}>Increment</button>
        <button className="bg-red-700 border rounded lg  p-2" onClick={() => dispatch(decrement())}>Decrement</button>
        <button className="bg-yellow-700 border rounded lg  p-2" onClick={() => dispatch(reset())}>Reset</button>
      </div>
    </main>
  );
}
