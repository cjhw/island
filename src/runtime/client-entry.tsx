import { createRoot } from 'react-dom/client';
import { App } from './App';
import siteData from 'island:site-data';

function renderInBrowser() {
  console.log(siteData);

  const containerEl = document.getElementById('root');
  if (!containerEl) {
    throw new Error('#root element not found');
  }
  createRoot(containerEl).render(<App />);
}

renderInBrowser();
