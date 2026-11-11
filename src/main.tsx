import { createRoot } from 'react-dom/client';
import App from './App';
import { RM, trackVelocity } from './lib/motion';
import { exposeForTesting, startSmoothScroll } from './lib/scroll';
import './styles/tokens.css';
import './styles/app.css';
import './styles/pages.css';
import './styles/mascot.css';

document.documentElement.classList.toggle('rm', RM);
startSmoothScroll();
trackVelocity();
exposeForTesting();

// No StrictMode: its double-mounted effects would replay the one-shot GSAP choreography (loader, drop).
const root = createRoot(document.getElementById('root')!);
// dev only: /?rabbit opens the rabbit lab (every pose and action, for tuning and stills)
if (import.meta.env.DEV && location.search.includes('rabbit')) import('./dev/RabbitLab').then(m => root.render(<m.RabbitLab />));
else root.render(<App />);
