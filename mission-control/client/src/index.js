import 'react-app-polyfill/ie9';
import { createRoot } from 'react-dom/client';
import App from './app/app';

const container = document.getElementById('root');
const root = createRoot(container); 
root.render(<App/>);

const welcome = () => console.log('Welcome to Mission Control 🕹');
welcome('de529c70-eb80-4dfb-9540-5075db7545bf')