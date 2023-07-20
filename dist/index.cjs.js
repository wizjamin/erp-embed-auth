'use strict';

var React = require('react');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var EmbedAuthContext = React.createContext({});
var _a = new MessageChannel(), _embedAuthPort1 = _a.port1, _embedAuthPort2 = _a.port2;
var EmbedAuthProvider = function (_a) {
    var children = _a.children, targetOrigin = _a.targetOrigin, authEndPoint = _a.authEndPoint;
    var _b = React.useState(), currentUser = _b[0], setCurrentUser = _b[1];
    var _c = React.useState('unknown'), authState = _c[0], setAuthState = _c[1];
    var _onRedirect = React.useRef();
    var _authState = React.useRef(authState);
    var _commINIT = React.useRef(false);
    var _onMessageListeners = React.useRef({});
    var isLoading = function () { return authState === "authenticating"; };
    var setAuthStateInternal = function (state) {
        _authState.current = state;
        setAuthState(state);
    };
    var handleSetUser = function (user) {
        setCurrentUser(user);
        if (!user)
            setAuthStateInternal('anonymous');
        else
            setAuthStateInternal('authenticated');
    };
    var handleOnMessageAdd = function (type, callback) {
        var list = _onMessageListeners.current[type] || [];
        list.filter(function (func) { return func !== callback; });
        list.push(callback);
        _onMessageListeners.current[type] = list;
    };
    var handleOnMessageRemove = function (type, callback) {
        var list = _onMessageListeners.current[type] || [];
        list = list.filter(function (func) { return func !== callback; });
        _onMessageListeners.current[type] = list;
    };
    var _onMessage = React.useRef(function (e) {
        var _a;
        var _b = e.data, type = _b.type, data = __rest(_b, ["type"]);
        var userId = data.userId, username = data.username, redirect = data.redirect;
        function getCurrentUser() {
            return __awaiter(this, void 0, void 0, function () {
                var options, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            options = {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    userId: userId,
                                    username: username
                                })
                            };
                            return [4 /*yield*/, fetch(authEndPoint, options).then(function (r) { return r.json(); })];
                        case 1:
                            result = (_a.sent());
                            if (_authState.current !== 'authenticating')
                                return [2 /*return*/];
                            if (result.user) {
                                handleSetUser(result.user);
                                if (redirect && _onRedirect.current) {
                                    _onRedirect.current(decodeURIComponent(redirect));
                                }
                            }
                            else {
                                handleSetUser(undefined);
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            _a.sent();
                            handleSetUser(undefined);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        if (type === 'CLEAR_AUTH') {
            handleSetUser();
            return;
        }
        else if (type === 'CURRENT_USER') {
            if (_authState.current === "authenticating")
                return;
            if (userId && username) {
                if (!currentUser || userId !== currentUser.id) {
                    setAuthStateInternal("authenticating");
                    void getCurrentUser();
                }
            }
            else
                handleSetUser(undefined);
        }
        else if ((_a = _onMessageListeners.current[type]) === null || _a === void 0 ? void 0 : _a.length) {
            _onMessageListeners.current[type].forEach(function (func) {
                func(data);
            });
        }
    });
    var sendMessage = function (type, data) {
        if (!_commINIT.current) {
            if (window.parent) {
                _embedAuthPort1.onmessage = _onMessage.current;
                window.parent.postMessage(__assign({ type: type }, (data || {})), targetOrigin, [_embedAuthPort2]);
                _commINIT.current = true;
            }
        }
        else
            _embedAuthPort1.postMessage(__assign({ type: type }, (data || {})));
    };
    React.useEffect(function () {
        setTimeout(function () { return sendMessage('CURRENT_USER'); }, 1200);
    }, []);
    return React.createElement(EmbedAuthContext.Provider, { value: {
            user: currentUser,
            authState: authState,
            loading: isLoading,
            setUser: handleSetUser,
            setOnRedirectListener: function (handler) {
                _onRedirect.current = handler;
            },
            requestAuth: function (data) { return sendMessage('CURRENT_USER', data); },
            sendMessage: sendMessage,
            addOnMessageListener: handleOnMessageAdd,
            removeOnMessageListener: handleOnMessageRemove
        } }, children);
};
var useEmbedAuth = function () {
    var ctx = React.useContext(EmbedAuthContext);
    if (!ctx)
        throw new Error('EmbedAuth context not found');
    return ctx;
};

exports.EmbedAuthProvider = EmbedAuthProvider;
exports.useEmbedAuth = useEmbedAuth;
//# sourceMappingURL=index.cjs.js.map
