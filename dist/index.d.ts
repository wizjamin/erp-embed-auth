import { PropsWithChildren } from 'react';

declare type EmbedAuthUser = {
    id: number;
    roleId: number;
    username: string;
};
declare type AuthState = 'unknown' | 'authenticated' | 'anonymous' | 'authenticating';
declare type EMBEDCONTEXT = {
    user?: EmbedAuthUser;
    loading: () => boolean;
    setUser: (user?: EmbedAuthUser) => void;
    authState: AuthState;
    requestAuth: (data?: any) => void;
    setOnRedirectListener: (handler: (route: string) => void) => void;
};
type EmbedAuthProviderProps = {
    authEndPoint: string;
    targetOrigin: string;
} & PropsWithChildren;
declare const EmbedAuthProvider: ({ children, targetOrigin, authEndPoint }: EmbedAuthProviderProps) => JSX.Element;
declare const useEmbedAuth: () => EMBEDCONTEXT;

export { EmbedAuthProvider, EmbedAuthUser, useEmbedAuth };
