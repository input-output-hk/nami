"use strict";

exports.__esModule = true;
exports.parseMessage = exports.errorMessage = void 0;

// parse MessageEvent .data into CoreMessage
var parseMessage = function parseMessage(messageData) {
  var message = {
    event: messageData.event,
    type: messageData.type,
    payload: messageData.payload
  };

  if (typeof messageData.id === 'number') {
    message.id = messageData.id;
  }

  if (typeof messageData.success === 'boolean') {
    message.success = messageData.success;
  }

  return message;
}; // common response used straight from npm index (not from Core)


exports.parseMessage = parseMessage;

var errorMessage = function errorMessage(error) {
  return {
    success: false,
    payload: {
      error: error.message,
      code: error.code
    }
  };
};

exports.errorMessage = errorMessage;