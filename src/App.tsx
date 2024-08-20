import { useState } from 'react'
import ParentSize from '@visx/responsive/lib/components/ParentSize';

import Example from './Example';
import './App.css'

function App() {


  return (
    <>
      <ParentSize>{({ width, height }) => <Example width={width} height={height} />}</ParentSize>,
    </>
  )
}

export default App

