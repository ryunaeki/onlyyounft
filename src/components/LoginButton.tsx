import Button from '@mui/material/Button';
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <Button variant="outlined" onClick={() => loginWithRedirect()}>ログイン</Button>;
};

export default LoginButton;
