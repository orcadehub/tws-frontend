import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <TonConnectUIProvider manifestUrl='https://coffee-geographical-ape-289.mypinata.cloud/ipfs/QmbbuLAFcHTzDQxt9ApiJo2kEjk1fAM1B1cQ24jUa1GfiA'>
    <App />
  </TonConnectUIProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
