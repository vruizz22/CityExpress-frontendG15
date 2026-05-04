import { useEffect } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { setTokenProvider } from '@/services/api/httpClient';

function TokenWiring({ children }) {
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    setTokenProvider(getAccessTokenSilently);
    return () => setTokenProvider(null);
  }, [getAccessTokenSilently]);

  return children;
}

export default function AppAuthProvider({ children }) {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
    >
      <TokenWiring>{children}</TokenWiring>
    </Auth0Provider>
  );
}
