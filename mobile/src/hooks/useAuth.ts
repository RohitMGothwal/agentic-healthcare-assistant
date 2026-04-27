import { useCallback, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<{ username: string } | null>(null);

  const login = useCallback((username: string) => {
    setUser({ username });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
