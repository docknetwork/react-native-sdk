//
//  WebViewJavaScriptBridge.swift
//  WalletSDKiOS
//
//  Created by Maycon Mellos on 23/06/25.
//

import Foundation

struct WebViewJavaScriptBridge {
    static func createBridgeScript() -> String {
        return """
        (function() {
            console.log('Setting up Toaster bridge...');
            
            if (typeof window.global === 'undefined') {
                window.global = {};
            }
            
            window.global.Toaster = {
                postMessage: function(message) {
                    console.log('Toaster.postMessage called with:', message);
                    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.Toaster) {
                        console.log('Sending message via WebKit handler');
                        window.webkit.messageHandlers.Toaster.postMessage(message);
                    } else {
                        console.error('WebKit Toaster message handler not available');
                        console.log('Available handlers:', window.webkit ? Object.keys(window.webkit.messageHandlers || {}) : 'webkit not available');
                    }
                }
            };
            
            if (typeof global === 'undefined') {
                window.global.global = window.global;
            } else {
                global.Toaster = window.global.Toaster;
            }
            
            window.Toaster = window.global.Toaster;
            
            console.log('Toaster bridge setup complete');
            console.log('global.Toaster available:', typeof window.global.Toaster);
            console.log('window.Toaster available:', typeof window.Toaster);
        })();
        """
    }
    
    static func createPostLoadScript() -> String {
        return """
        (function() {
            console.log('Post-load Toaster bridge check...');
            
            if (typeof global !== 'undefined' && (!global.Toaster || typeof global.Toaster.postMessage !== 'function')) {
                console.log('Fixing global.Toaster after page load');
                global.Toaster = window.global.Toaster;
            }
            
            if (typeof window.global !== 'undefined' && window.global.global && !window.global.global.Toaster) {
                window.global.global.Toaster = window.global.Toaster;
            }
            
            // CSP bypass attempt
            try {
                var metaTags = document.querySelectorAll('meta[http-equiv*="Content-Security-Policy"]');
                metaTags.forEach(function(tag) {
                    console.log('Found CSP meta tag, removing:', tag.getAttribute('content'));
                    tag.remove();
                });
                console.log('CSP bypass attempt completed');
            } catch (e) {
                console.log('CSP bypass failed:', e.message);
            }
            
            // Set up proxy handlers after page load
            if (!window.proxyResponseHandlers) {
                window.proxyResponseHandlers = {};
            }
        })();
        """
    }
    
    static func createConsoleLogScript() -> String {
        return """
        ['log', 'error', 'warn', 'info', 'debug'].forEach(function(method) {
            var original = console[method];
            console[method] = function() {
                var message = Array.prototype.slice.call(arguments).map(function(arg) {
                    return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
                }).join(' ');
                window.webkit.messageHandlers.consoleLog.postMessage('[' + method.toUpperCase() + '] ' + message);
                original.apply(console, arguments);
            };
        });
        
        // Fetch proxy setup
        var originalFetch = window.fetch;
        window.fetch = function(url, options) {
            console.log('FETCH REQUEST:', url, options ? JSON.stringify(options) : 'no options');
            
            if (typeof url === 'string' && (
                url.includes('cheqd.docknode.io') || 
                url.includes('testnet.cheqd') ||
                url.includes('truvera.io') ||
                (url.startsWith('https://') && !url.includes('localhost'))
            )) {
                console.log('Using native network proxy for FETCH:', url);
                
                return new Promise(function(resolve, reject) {
                    try {
                        var requestId = 'proxy-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                        var method = options?.method || 'GET';
                        var body = options?.body || null;
                        var headers = options?.headers || {};
                        var headersObj = {};
                        
                        if (headers instanceof Headers) {
                            headers.forEach(function(value, key) {
                                headersObj[key] = value;
                            });
                        } else if (typeof headers === 'object') {
                            headersObj = headers;
                        }
                        
                        if (!window.proxyResponseHandlers) {
                            window.proxyResponseHandlers = {};
                        }
                        
                        window.proxyResponseHandlers[requestId] = function(data) {
                            console.log('Received proxy response for ID:', requestId, data);
                            
                            if (data.body && data.body.result) {
                                var responseObj = {
                                    ok: true,
                                    status: 200,
                                    statusText: 'OK',
                                    headers: new Headers({'content-type': 'application/json'}),
                                    json: function() { return Promise.resolve(data.body.result); },
                                    text: function() { return Promise.resolve(JSON.stringify(data.body.result)); },
                                    clone: function() { return this; }
                                };
                                console.log('Proxy response created for', url);
                                resolve(responseObj);
                            } else if (data.body && data.body.error) {
                                reject(new Error(data.body.error));
                            } else {
                                reject(new Error('Unknown proxy response format'));
                            }
                        };
                        
                        var proxyMessage = {
                            jsonrpc: "2.0",
                            id: requestId,
                            body: {
                                method: "proxyNetworkRequest",
                                params: { url: url, method: method, body: body, headers: headersObj }
                            }
                        };
                        
                        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.Toaster) {
                            window.webkit.messageHandlers.Toaster.postMessage(JSON.stringify(proxyMessage));
                        } else {
                            reject(new Error('WebKit handler not available'));
                        }
                        
                        setTimeout(function() {
                            if (window.proxyResponseHandlers[requestId]) {
                                delete window.proxyResponseHandlers[requestId];
                                reject(new Error('Network proxy timeout'));
                            }
                        }, 30000);
                        
                    } catch (error) {
                        reject(error);
                    }
                });
            }
            
            return originalFetch.apply(this, arguments)
                .then(function(response) {
                    console.log('FETCH SUCCESS:', url, 'Status:', response.status, response.statusText);
                    return response;
                })
                .catch(function(error) {
                    console.error('FETCH ERROR:', url, error.message || error);
                    throw error;
                });
        };
        """
    }
}