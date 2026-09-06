import React, { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/fut-pitch.css';

const positions = [
  [50, 88], // GK
  [84, 69], [61, 70], [39, 70], [16, 69], // back four
  [50, 51], [34, 43], [66, 43], // midfield
  [82, 20], [50, 13], [18, 20] // front three
];

export default function FutPitchPortal({ players = [] }) {
  const [target, setTarget] = useState(null);

  useLayoutEffect(() => {
    setTarget(document.querySelector('#hall'));
  }, []);

  if (!target || !players.length) return null;

  return createPortal(
    <article className="module-card c3-legends-panel">
      <div className="module-card-head">
        <div><span>CLUB LEGENDS XI</span><h3>Most-used XI by role</h3></div>
        <small>4–3–3 / USAGE</small>
      </div>
      <div className="c3-pitch" aria-label="Most-used FUT Club Legends XI">
        <span className="c3-pitch-half" aria-hidden="true" />
        <span className="c3-pitch-circle" aria-hidden="true" />
        {players.slice(0, 11).map((player, index) => {
          const [left, top] = positions[index] || [50, 50];
          return (
            <div className="c3-pitch-player" key={`${player.name}-${player.pos}`} style={{ left: `${left}%`, top: `${top}%` }}>
              <div className="c3-pitch-card">
                <div><b>{player.rating}</b><span>{player.pos}</span></div>
                <strong>{player.name}</strong>
                <small>{player.apps} apps</small>
              </div>
            </div>
          );
        })}
      </div>
    </article>,
    target
  );
}
