import React from 'react';
import { createRoot } from 'react-dom/client';
import HomeApp from '../pages/HomeApp.jsx';
import '../styles/react-ui.css';
createRoot(document.getElementById('root')).render(<React.StrictMode><HomeApp /></React.StrictMode>);
