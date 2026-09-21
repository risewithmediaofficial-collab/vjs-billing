import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Globally prevent mouse wheel scrolling from changing any input[type=number] values in the entire application
window.addEventListener(
  'wheel',
  (e) => {
    if (document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement.type === 'number') {
      document.activeElement.blur();
    }
    if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'number') {
      e.target.blur();
    }
  },
  { capture: true, passive: true }
);

// Extra layer: whenever any number input receives focus, disable mouse wheel on it directly
document.addEventListener(
  'focusin',
  (e) => {
    if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'number') {
      if (!e.target._wheelProtection) {
        e.target._wheelProtection = true;
        e.target.addEventListener(
          'wheel',
          function () {
            this.blur();
          },
          { passive: true }
        );
      }
    }
  },
  { capture: true }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

