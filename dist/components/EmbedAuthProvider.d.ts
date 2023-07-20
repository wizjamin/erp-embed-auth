import { PropsWithChildren } from "react";
declare type EventTypes = 'CURRENT_USER' | 'CLEAR_AUTH' | string;
export declare type EmbedAuthUser = {
    id: number;
    username: string;
    roles: number[];
    [k: string]: any;
};
declare type AuthState = 'unknown' | 'authenticated' | 'anonymous' | 'authenticating';
type MessageCallback = (data?: any) => any;
declare type EMBEDCONTEXT = {
    user?: EmbedAuthUser;
    loading: () => boolean;
    setUser: (user?: EmbedAuthUser) => void;
    authState: AuthState;
    requestAuth: (data?: any) => void;
    sendMessage: (name: EventTypes, data?: any) => void;
    setOnRedirectListener: (handler: (route: string) => void) => void;
    addOnMessageListener: (type: EventTypes, callback: MessageCallback) => void;
    removeOnMessageListener: (type: EventTypes, callback: MessageCallback) => void;
};
type EmbedAuthProviderProps = {
    authEndPoint: string;
    targetOrigin: string;
} & PropsWithChildren;
declare const EmbedAuthProvider: ({ children, targetOrigin, authEndPoint }: EmbedAuthProviderProps) => JSX.Element;
export declare const useEmbedAuth: () => EMBEDCONTEXT;
export default EmbedAuthProvider;
