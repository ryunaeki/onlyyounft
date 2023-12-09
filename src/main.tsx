import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Auth0Provider } from '@auth0/auth0-react'
import { BrowserRouter } from 'react-router-dom'
import { Networks, XRPLClient } from '@nice-xrpl/react-xrpl';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <XRPLClient network={Networks.Testnet}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </XRPLClient>
    </Auth0Provider>
  </React.StrictMode>
)
