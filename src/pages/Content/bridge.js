// This is an example how a wallet app could implement the connection.

import { Messaging } from "../../api/messaging"
import { METHOD, SENDER, TARGET } from "../../config/config"

export function initConnection(iframe, origin) {

  let _debug                  = false // set to true for debug logs.

  let _walletNamespace        = 'nami' // your wallet namespace
  let _initialApiObject       = bridgeInitialApi // CIP0030 initial api object
  let _fullApiObject          = bridgeFullApi // CIP0030 full api object

  let _bridge                 = { type: 'cardano-dapp-connector-bridge', source: null, origin: null }
  let _methodMap              = {

    // Initial 3 methods to establish connection. More endpoints will be added by the wallet.

    connect:                  'connect',
    handshake:                'handshake',

    enable:                   'enable',
    isEnabled:                'isEnabled',
    getNetworkId:             'getNetworkId',

    getBalance:               'getBalance',
    getChangeAddress:         'getChangeAddress',
    getRewardAddresses:       'getRewardAddresses',
    getUnusedAddresses:       'getUnusedAddresses',
    getUsedAddresses:         'getUsedAddresses',
    getUtxos:                 'getUtxos',
    getCollateral:            'getCollateral',

    signData:                 'signData',
    signTx:                   'signTx',
    submitTx:                 'submitTx',
  }

  let _iframe                 = iframe
  let _origin                 = origin

  let _sendResponse           = function (method, uid, data) {

    if(!_iframe) throw new Error('Iframe not initialized.')

    let iframeWindow          = _iframe.contentWindow

    if(iframeWindow && _origin) {

      iframeWindow.postMessage({

        type:                 _bridge.type,
        walletNamespace:      _walletNamespace,

        method:               method,
        uid:                  uid,

        response:             data.response ?? null,
        error:                data.error ?? null

      }, _origin)
    }
  }

  let _sendInitialAPI         = function () {

    if(!_iframe) throw new Error('Iframe not initialized.')

    let iframeWindow          = _iframe.contentWindow

    if(iframeWindow && _origin) {

      iframeWindow.postMessage({

        type:                 _bridge.type,
        walletNamespace:      _walletNamespace,

        method:               _methodMap.connect,

        initialApi:           _initialApiObject,

      }, _origin)
    }
  }

  function isValidMessage(payload) {

    if(!payload.origin || !payload.source || !payload.data)       return false
    if(payload.data.type !== _bridge.type)                        return false
    if(_walletNamespace && payload.data.to !== _walletNamespace)  return false

    return true
  }

  function getArguments(api, args = []) {
    let data = {};
    switch (api) {
      case _methodMap.getUtxos:
        data = { amount: args[0], paginate: args[1] };
        return data;
      case _methodMap.signData:
        data = { address: args[0], payload: args[1] };
        return data;
      case _methodMap.signTx:
        data = { tx: args[0], partialSign: args[1] };
        return data;
      case _methodMap.submitTx:
        data = { tx: args[0] };
        return data;
      default:
        return data;
    }
  }

  async function onAPIMessage (payload) {

    if(!isValidMessage(payload)) return

    if(_debug) {

      console.log('++++++++++++++++++++++++')
      console.log('App: onAPIMessage: got message')
      console.log('App: onAPIMessage: origin:', payload.origin)
      // console.log('App: onAPIMessage: source:', payload.source) // Don't log source, might break browser security rules
      console.log('App: onAPIMessage: data: ',  payload.data)
      console.log('App: onAPIMessage: valid: ', isValidMessage(payload))
      console.log('++++++++++++++++++++++++')
    }

    let uid                   = payload.data?.uid
    let api                   = payload.data?.method

    if(!uid)                  { return }
    if(!api)                  { return }

    const req = {
      id: uid,
      origin: payload.origin,
      sender: SENDER.webpage,
      target: TARGET,
      method: api,
      data: getArguments(api, payload.data.args)
    };
    const handleResponse = (res) => {
      _sendResponse(api, uid, { response: res.data, error: res.error });
    };
    let callback = handleResponse;
  
    switch (api) {
      case _methodMap.enable:
        callback = (response) => {
          if (!response.error) response.data = _fullApiObject;
          handleResponse(response);
        };
        break;
      case _methodMap.getUsedAddresses:
        req.method = METHOD.getAddress;
        callback = (response) => {
          if (response.data) response.data = [response.data];
          handleResponse(response);
        };
        break;
      case _methodMap.getUnusedAddresses:
        req.method = METHOD.isWhitelisted;
        callback = (response) => {
          if (response.data) response.data = [];
          handleResponse(response);
        };
        break;
      case _methodMap.getChangeAddress:
        req.method = METHOD.getAddress;
        callback = handleResponse;
        break;
      case _methodMap.getRewardAddresses:
        req.method = METHOD.getRewardAddress;
        callback = (response) => {
          if (response.data) response.data = [response.data];
          handleResponse(response);
        };
        break;
      default:
        break;
    }

    Messaging.handleMessageFromBrowser(req, callback);
  }

  return new Promise((resolve, reject) => {

    if(!_iframe) return reject('iframe not initialized.')

    let iframeWindow          = _iframe.contentWindow

    if(iframeWindow) {

      if(_debug) { console.log('Wallet: connect') }

      let toId                = setTimeout( () => {

        reject('DApp connection failed (timed out). Please try again later. (slow connection?)')

      }, 1000 * 30)

      try {

        let onMessage         = (payload) => {

          if(!isValidMessage(payload)) return

          if(_debug) {

            console.log('************************')
            console.log('Wallet: onMessage: got message')
            console.log('Wallet: onMessage: origin:', payload.origin)
            // console.log('Wallet: onMessage: source:', payload.source) // Don't log source, might break browser security rules
            console.log('Wallet: onMessage: data: ',  payload.data)
            console.log('Wallet: onMessage: valid: ', isValidMessage(payload))
            console.log('************************')
          }

          clearTimeout(toId)

          window.removeEventListener("message", onMessage, false)
          window.removeEventListener("message", onAPIMessage, false)

          if(_debug) { console.log('Wallet: onMessage: handshake?: ',  (payload.data.method === _methodMap.handshake)) }

          if(payload.data.method === _methodMap.handshake) {

            _iframe           = iframe
            _origin           = payload.origin

            window.addEventListener("message", onAPIMessage, false)

            _sendResponse(payload.data.method, payload.data.uid, { success: true, response: true, error: null })

            resolve(true)

          } else {

            reject('DApp connection to failed (handshake).')
          }
        }

        window.removeEventListener("message", onAPIMessage, false)
        window.addEventListener("message", onMessage, false)

        _sendInitialAPI()

      } catch (e) {

        console.error(e)

        return reject('DApp connection to failed (message).')
      }

    } else {

      return reject('ContentWindow undefined.')
    }
  })
}

let bridgeInitialApi          = {

  isBridge:                   true,

  isEnabled:                  'isEnabled',
  enable:                     'enable',

  apiVersion:                 '0.1.0',
  name:                       'Nami',
  icon:                       "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 486.17 499.86'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%23349ea3;%7D%3C/style%3E%3C/defs%3E%3Cg id='Layer_2' data-name='Layer 2'%3E%3Cg id='Layer_1-2' data-name='Layer 1'%3E%3Cpath id='path16' class='cls-1' d='M73.87,52.15,62.11,40.07A23.93,23.93,0,0,1,41.9,61.87L54,73.09,486.17,476ZM102.4,168.93V409.47a23.76,23.76,0,0,1,32.13-2.14V245.94L395,499.86h44.87Zm303.36-55.58a23.84,23.84,0,0,1-16.64-6.68v162.8L133.46,15.57H84L421.28,345.79V107.6A23.72,23.72,0,0,1,405.76,113.35Z'/%3E%3Cpath id='path18' class='cls-1' d='M38.27,0A38.25,38.25,0,1,0,76.49,38.27v0A38.28,38.28,0,0,0,38.27,0ZM41.9,61.8a22,22,0,0,1-3.63.28A23.94,23.94,0,1,1,62.18,38.13V40A23.94,23.94,0,0,1,41.9,61.8Z'/%3E%3Cpath id='path20' class='cls-1' d='M405.76,51.2a38.24,38.24,0,0,0,0,76.46,37.57,37.57,0,0,0,15.52-3.3A38.22,38.22,0,0,0,405.76,51.2Zm15.52,56.4a23.91,23.91,0,1,1,8.39-18.18A23.91,23.91,0,0,1,421.28,107.6Z'/%3E%3Cpath id='path22' class='cls-1' d='M134.58,390.81A38.25,38.25,0,1,0,157.92,426a38.24,38.24,0,0,0-23.34-35.22Zm-15,59.13A23.91,23.91,0,1,1,143.54,426a23.9,23.9,0,0,1-23.94,23.91Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
}

let bridgeFullApi = {

  getNetworkId:               'getNetworkId',
  getUsedAddresses:           'getUsedAddresses',
  getUnusedAddresses:         'getUnusedAddresses',
  getRewardAddresses:         'getRewardAddresses',
  getChangeAddress:           'getChangeAddress',
  getBalance:                 'getBalance',
  getUtxos:                   'getUtxos',

  signTx:                     'signTx',
  signData:                   'signData',
  submitTx:                   'submitTx',

  getCollateral:              'getCollateral',

  experimental: {

    getCollateral:            'getCollateral'
  }
}
