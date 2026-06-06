const ERROR_CODES = {
  IndexSizeError: 1,
  HierarchyRequestError: 3,
  WrongDocumentError: 4,
  InvalidCharacterError: 5,
  NoModificationAllowedError: 7,
  NotFoundError: 8,
  NotSupportedError: 9,
  InUseAttributeError: 10,
  InvalidStateError: 11,
  SyntaxError: 12,
  InvalidModificationError: 13,
  NamespaceError: 14,
  InvalidAccessError: 15,
  TypeMismatchError: 17,
  SecurityError: 18,
  NetworkError: 19,
  AbortError: 20,
  URLMismatchError: 21,
  QuotaExceededError: 22,
  TimeoutError: 23,
  InvalidNodeTypeError: 24,
  DataCloneError: 25
};

function DOMException(message, name) {
  const error = Error.call(this, message);
  Object.setPrototypeOf(error, DOMException.prototype);
  error.name = name === undefined ? "Error" : String(name);
  error.code = ERROR_CODES[error.name] || 0;
  return error;
}

DOMException.prototype = Object.create(Error.prototype);
DOMException.prototype.constructor = DOMException;

module.exports = DOMException;
