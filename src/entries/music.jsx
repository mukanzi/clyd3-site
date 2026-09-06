import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/react-ui.css';
async function bootstrap(){
  await import('../../music/atlas-core.js');
  window.ATLAS_DATA.sonic=[];
  // Keep the Love Index chunks deterministic: each file appends the next
  // rank range, so load them in archive order rather than concurrently.
  await import('../../music/atlas-top-01.js');
  await import('../../music/atlas-top-02.js');
  await import('../../music/atlas-top-03.js');
  await import('../../music/atlas-top-04.js');
  await import('../../music/sonic-01.js');
  await import('../../music/sonic-02.js');
  await import('../../music/sonic-rest.js');
  const {default:MusicApp}=await import('../pages/MusicApp.jsx');
  createRoot(document.getElementById('root')).render(<React.StrictMode><MusicApp data={window.ATLAS_DATA}/></React.StrictMode>);
}
bootstrap().catch(error=>{console.error(error);document.getElementById('root').innerHTML='<main style="padding:40px;font-family:monospace">Unable to load Listening Atlas.</main>'});
