import React, {createContext, PropsWithChildren, useContext, useEffect, useRef, useState} from "react";
declare type EventTypes = 'CURRENT_USER' | 'CLEAR_AUTH';
export declare type EmbedAuthUser = {
    id: number;
    roleId: number;
    username: string;
}
declare type AuthState = 'unknown' | 'authenticated' | 'anonymous' | 'authenticating';
declare type EMBEDCONTEXT = {
    user?: EmbedAuthUser;
    loading: () => boolean;
    setUser: (user?: EmbedAuthUser) => void;
    authState: AuthState;
    requestAuth: (data?: any) => void;
    setOnRedirectListener: (handler: (route: string) => void) => void
};

type EmbedAuthProviderProps = {
    authEndPoint: string;
    targetOrigin: string;
} & PropsWithChildren

const EmbedAuthContext = createContext({} as EMBEDCONTEXT);

type RedirectHandler = (route: string) => void;

const {port1: _embedAuthPort1, port2: _embedAuthPort2} = new MessageChannel();
const EmbedAuthProvider = ({ children, targetOrigin, authEndPoint }: EmbedAuthProviderProps) => {
    const [currentUser, setCurrentUser] = useState<EmbedAuthUser>();
    const [authState, setAuthState] = useState<AuthState>('unknown');
    const _onRedirect = useRef<RedirectHandler>()
    const _authState = useRef(authState);
    const _commINIT = useRef(false);
    const isLoading = () => authState === "authenticating";
    const setAuthStateInternal = (state: AuthState) => {
        _authState.current = state;
        setAuthState(state);
    }
    const handleSetUser = (user?: EmbedAuthUser) => {
        setCurrentUser(user);
        if (!user)
            setAuthStateInternal('anonymous');
        else
            setAuthStateInternal('authenticated');
    }
    const _onMessage = useRef((e: MessageEvent<{ type: EventTypes, [key: string]: any }>) => {
        if (e.data.type === 'CLEAR_AUTH') {
            handleSetUser()
            return;
        }
        const {userId, username, redirect} = e.data;
        if (_authState.current === "authenticating") return;
        async function getCurrentUser() {
            try {
                const options = {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId, username
                    })
                }
                const result = (await fetch(authEndPoint, options).then(r => r.json()));
                if (_authState.current !== 'authenticating') return;
                if (result.user) {
                    handleSetUser(result.user);
                    if (redirect && _onRedirect.current) {
                        _onRedirect.current(decodeURIComponent(redirect))
                    }
                } else {
                    handleSetUser(undefined);
                }

            } catch (e: any) {
                handleSetUser(undefined);
            }
        }
        if (userId && username) {
            if (!currentUser || userId !== currentUser.id) {
                setAuthStateInternal("authenticating")
                void getCurrentUser();
            }
        } else handleSetUser(undefined);
    })
    const sendMessage = (type: EventTypes, data?: { [key: string]: any }) => {
        if (!_commINIT.current) {
            if (window.parent) {
                _embedAuthPort1.onmessage = _onMessage.current;
                window.parent.postMessage({type, ...(data || {})}, targetOrigin, [_embedAuthPort2])
                _commINIT.current = true;
            }
        } else _embedAuthPort1.postMessage({type, ...(data || {})})
    }
    useEffect(() => {
        setTimeout(() => sendMessage('CURRENT_USER') , 1200)
    }, [])
    return <EmbedAuthContext.Provider value={{
        user: currentUser,
        authState,
        loading: isLoading,
        setUser: handleSetUser,
        setOnRedirectListener: handler => {
            _onRedirect.current = handler;
        },
        requestAuth: (data?: any) => sendMessage('CURRENT_USER', data)
    }}>
        {children}
    </EmbedAuthContext.Provider>
}

export const useEmbedAuth = () => {
    const ctx = useContext<EMBEDCONTEXT>(EmbedAuthContext)
    if (!ctx) throw new Error('EmbedAuth context not found');
    return ctx;
}

export default EmbedAuthProvider