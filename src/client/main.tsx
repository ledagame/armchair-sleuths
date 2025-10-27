import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { GameStoreProvider } from './store/gameStore';
import { GameAPIProvider } from './contexts/GameAPIContext';
import { FramerMotionTest } from './components/FramerMotionTest';

// Check for test mode via URL parameter: ?test=framer
const urlParams = new URLSearchParams(window.location.search);
const testMode = urlParams.get('test');

// Render test component if test mode is active
if (testMode === 'framer') {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <FramerMotionTest />
    </StrictMode>
  );
} else {
  // Normal app rendering
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <GameStoreProvider>
        <GameAPIProvider useMock={false}>
          <App />
        </GameAPIProvider>
      </GameStoreProvider>
    </StrictMode>
  );
}
