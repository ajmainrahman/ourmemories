import { createContext, useContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  getGetCurrentUserQueryKey,
  type User,
} from "@workspace/api-client-react";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const meQuery = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      retry: false,
      staleTime: 60_000,
    },
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const login = useCallback(
    async (email: string, password: string) => {
      const user = await loginMutation.mutateAsync({ data: { email, password } });
      queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
      await queryClient.invalidateQueries();
    },
    [loginMutation, queryClient],
  );

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      const user = await registerMutation.mutateAsync({
        data: { email, name, password },
      });
      queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
      await queryClient.invalidateQueries();
    },
    [registerMutation, queryClient],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
    queryClient.clear();
  }, [logoutMutation, queryClient]);

  const value: AuthContextValue = {
    user: meQuery.data ?? null,
    isLoading: meQuery.isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
