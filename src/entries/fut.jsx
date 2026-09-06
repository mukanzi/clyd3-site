import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/react-ui.css';
async function bootstrap(){
  await import('../../fut/data-core.js');
  await import('../../fut/data-players-01.js');
  await import('../../fut/data-players-02.js');
  await import('../../fut/data-players-03.js');
  await import('../../fut/data-players-04.js');
  await import('../../fut/data-players-05.js');
  await import('../../fut/data-players-06.js');
  await import('../../fut/data-players-07.js');
  await import('../../fut/data-players-08.js');
  await import('../../fut/data-players-09.js');
  await import('../../fut/data-players-10.js');
  await import('../../fut/data-players-11.js');
  const [{default:FutApp},{default:FutPitchPortal}]=await Promise.all([
    import('../pages/FutApp.jsx'),
    import('../components/FutPitchPortal.jsx')
  ]);
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <FutApp data={window.FUT_DATA}/>
      <FutPitchPortal players={window.FUT_DATA.legendsXI}/>
    </React.StrictMode>
  );
}
bootstrap().catch(error=>{console.error(error);document.getElementById('root').innerHTML='<main style="padding:40px;font-family:monospace">Unable to load FUT Club Intelligence.</main>'});
