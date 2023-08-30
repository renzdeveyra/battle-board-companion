import React from 'react'
import * as ReactDOMClient from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App'
import './index.css'
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyA4I-wYPkT8T_XYUk69qGP3RXM-zo9Hcgs",
  authDomain: "gog-arbiter-test2.firebaseapp.com",
  projectId: "gog-arbiter-test2",
  storageBucket: "gog-arbiter-test2.appspot.com",
  messagingSenderId: "457324444740",
  appId: "1:457324444740:web:2e10ce41add69670bd1011"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

let container = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!container) {
    const container = document.getElementById('root');
    const root = ReactDOMClient.createRoot(container);
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    );
  } 
});