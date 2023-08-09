import React, {createContext, PropsWithChildren, useContext, useEffect, useRef, useState, useCallback} from "react";
declare type EventTypes = 'CURRENT_USER' | 'CLEAR_AUTH' | string;
export declare type EmbedAuthUser = {
    id: number;
    username: string;
    roles: number[];
    [k: string]: any;
}
declare type AuthState = 'unknown' | 'authenticated' | 'anonymous' | 'authenticating';
type MessageCallback = (data?: any) => any
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
    requestData: (type: EventTypes, data?: any) => Promise<any>
};

type EmbedAuthProviderProps = {
    authEndPoint: string;
    targetOrigin: string;
} & PropsWithChildren

const EmbedAuthContext = createContext({} as EMBEDCONTEXT);

type RedirectHandler = (route: string) => void;
type MessageRequest = {[k: string]: MessageRequestData | undefined}
type MessageRequestData = {
    requestID: number;
    resolve: (data?: {[k: string]: any}) => void
    reject: (e: any) => void
}
const {port1: _embedAuthPort1, port2: _embedAuthPort2} = new MessageChannel();
let MESSAGE_REQUEST_INC = 1;
const EmbedAuthProvider = ({ children, targetOrigin, authEndPoint }: EmbedAuthProviderProps) => {
    const [currentUser, setCurrentUser] = useState<EmbedAuthUser>();
    const [authState, setAuthState] = useState<AuthState>('unknown');
    const _onRedirect = useRef<RedirectHandler>()
    const _authState = useRef(authState);
    const _commINIT = useRef(false);
    const _onMessageListeners = useRef<{[k: EventTypes]: MessageCallback[]}>({})
    const _messageRequests = useRef<MessageRequest>({})
    const isLoading = useCallback(() => authState === "authenticating", [authState]);
    const setAuthStateInternal = useCallback((state: AuthState) => {
        _authState.current = state;
        setAuthState(state);
    }, []);
    const handleSetUser = useCallback((user?: EmbedAuthUser) => {
        setCurrentUser(user);
        if (!user) setAuthStateInternal('anonymous');
        else setAuthStateInternal('authenticated');
    }, [setAuthStateInternal]);

    const handleOnMessageAdd = useCallback((type: EventTypes, callback: MessageCallback) => {
        const list = _onMessageListeners.current[type] || []
        _onMessageListeners.current[type] = [...list.filter(func => func !== callback), callback]
    }, []);
    const handleOnMessageRemove = useCallback((type: EventTypes, callback: MessageCallback) => {
        _onMessageListeners.current[type] = (_onMessageListeners.current[type] || []).filter(func => func !== callback);
    }, []);


    const _onMessage = useCallback((e: MessageEvent<{ type: EventTypes, [key: string]: any }>) => {
        const {type, requestID, ...data} = e.data
        const {userId, username, redirect} = data;
        console.log('On Message:: ', type)
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
        if (type === 'CLEAR_AUTH') {
            handleSetUser()
            return;
        } else if (type === 'CURRENT_USER') {
            if (_authState.current === "authenticating") return;
            if (_authState.current === "authenticated" && currentUser?.id === userId) return
            if (userId && username) {
                if (!currentUser || userId !== currentUser.id) {
                    setAuthStateInternal("authenticating")
                    void getCurrentUser();
                }
            } else handleSetUser(undefined);
        }  else if (!!_messageRequests.current[type]) {
            const request = _messageRequests.current[type]!!;
            if (request.requestID === requestID) {
                request.resolve(data);
                _messageRequests.current[type] = undefined
            }
        }

        if (_onMessageListeners.current[type]?.length) {
            _onMessageListeners.current[type].forEach(func => {
                func(data)
            })
        }
    }, [authEndPoint, currentUser, handleSetUser, setAuthStateInternal])
    useEffect(() => {
       if (_commINIT.current){
        _embedAuthPort1.onmessage = _onMessage;
       }
    }, [_onMessage]);
    const requestData = useCallback((type: EventTypes, data?: { [key: string]: any }): Promise<any> => {
        return new Promise<any>((resolve, reject) => {
            _messageRequests.current[type]?.reject(new Error('Canceled'))
            const requestID = MESSAGE_REQUEST_INC++
            _messageRequests.current[type] = {
                requestID, reject, resolve
            }
            sendMessage(type, {requestID, ...(data || {})})
        })
    }, []);
    const sendMessage = useCallback((type: EventTypes, data?: { [key: string]: any }) => {
        if (!_commINIT.current) {
            if (window.parent) {
                _embedAuthPort1.onmessage = _onMessage;
                window.parent.postMessage({type, ...(data || {})}, targetOrigin, [_embedAuthPort2])
                _commINIT.current = true;
            }
        } else _embedAuthPort1.postMessage({type, ...(data || {})})
    }, [_onMessage, targetOrigin]);
    useEffect(() => {
        setTimeout(() => sendMessage('CURRENT_USER') , 1200)
    }, [sendMessage])
    return <EmbedAuthContext.Provider value={{
        user: currentUser,
        authState,
        loading: isLoading,
        setUser: handleSetUser,
        setOnRedirectListener: useCallback(handler => {
            _onRedirect.current = handler;
        }, []),
        requestAuth: useCallback((data?: any) => sendMessage('CURRENT_USER', data), [sendMessage]),
        sendMessage: sendMessage,
        addOnMessageListener: handleOnMessageAdd,
        removeOnMessageListener: handleOnMessageRemove,
        requestData: requestData
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
