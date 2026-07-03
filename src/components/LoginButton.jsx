import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button type="button" onClick={() => loginWithRedirect()} className="btn btn-primary">
      Iniciar sesión
    </button>
  );
};

export default LoginButton;
