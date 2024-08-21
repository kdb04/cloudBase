import React from 'react'
import { createRoot } from 'react-dom/client'
import Login from "./Login.jsx"

function Main(){
    return(
        <div>
            <Login />
        </div>
    );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);
