import './App.css'
import { Route, Routes } from 'react-router-dom'
import Admin from './pages/Admin'
import Customer from './pages/Customer'
import Login from './pages/Login'
import { useAuth0 } from '@auth0/auth0-react'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material'


const defaultTheme = createTheme();

function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyles styles={{ ul: { margin: 0, padding: 0, listStyle: 'none' } }} />
      <CssBaseline />
      {!isAuthenticated ? (<>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </>
      ) : (<>
        <Customer />
      </>)}
    </ThemeProvider>
  )
}

export default App
