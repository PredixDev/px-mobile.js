(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * assertion-error
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Return a function that will copy properties from
 * one object to another excluding any originally
 * listed. Returned function will create a new `{}`.
 *
 * @param {String} excluded properties ...
 * @return {Function}
 */

function exclude () {
  var excludes = [].slice.call(arguments);

  function excludeProps (res, obj) {
    Object.keys(obj).forEach(function (key) {
      if (!~excludes.indexOf(key)) res[key] = obj[key];
    });
  }

  return function extendExclude () {
    var args = [].slice.call(arguments)
      , i = 0
      , res = {};

    for (; i < args.length; i++) {
      excludeProps(res, args[i]);
    }

    return res;
  };
};

/*!
 * Primary Exports
 */

module.exports = AssertionError;

/**
 * ### AssertionError
 *
 * An extension of the JavaScript `Error` constructor for
 * assertion and validation scenarios.
 *
 * @param {String} message
 * @param {Object} properties to include (optional)
 * @param {callee} start stack function (optional)
 */

function AssertionError (message, _props, ssf) {
  var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')
    , props = extend(_props || {});

  // default values
  this.message = message || 'Unspecified AssertionError';
  this.showDiff = false;

  // copy from properties
  for (var key in props) {
    this[key] = props[key];
  }

  // capture stack trace
  ssf = ssf || arguments.callee;
  if (ssf && Error.captureStackTrace) {
    Error.captureStackTrace(this, ssf);
  } else {
    this.stack = new Error().stack;
  }
}

/*!
 * Inherit from Error.prototype
 */

AssertionError.prototype = Object.create(Error.prototype);

/*!
 * Statically set name
 */

AssertionError.prototype.name = 'AssertionError';

/*!
 * Ensure correct constructor
 */

AssertionError.prototype.constructor = AssertionError;

/**
 * Allow errors to be converted to JSON for static transfer.
 *
 * @param {Boolean} include stack (default: `true`)
 * @return {Object} object that can be `JSON.stringify`
 */

AssertionError.prototype.toJSON = function (stack) {
  var extend = exclude('constructor', 'toJSON', 'stack')
    , props = extend({ name: this.name }, this);

  // include stack if exists and not turned off
  if (false !== stack && this.stack) {
    props.stack = this.stack;
  }

  return props;
};

},{}],2:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],3:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  this.length = 0
  this.parent = undefined

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":2,"ieee754":37,"is-array":38}],4:[function(require,module,exports){
module.exports = require('./lib/chai');

},{"./lib/chai":5}],5:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var used = []
  , exports = module.exports = {};

/*!
 * Chai version
 */

exports.version = '3.4.1';

/*!
 * Assertion Error
 */

exports.AssertionError = require('assertion-error');

/*!
 * Utils for plugins (not exported)
 */

var util = require('./chai/utils');

/**
 * # .use(function)
 *
 * Provides a way to extend the internals of Chai
 *
 * @param {Function}
 * @returns {this} for chaining
 * @api public
 */

exports.use = function (fn) {
  if (!~used.indexOf(fn)) {
    fn(this, util);
    used.push(fn);
  }

  return this;
};

/*!
 * Utility Functions
 */

exports.util = util;

/*!
 * Configuration
 */

var config = require('./chai/config');
exports.config = config;

/*!
 * Primary `Assertion` prototype
 */

var assertion = require('./chai/assertion');
exports.use(assertion);

/*!
 * Core Assertions
 */

var core = require('./chai/core/assertions');
exports.use(core);

/*!
 * Expect interface
 */

var expect = require('./chai/interface/expect');
exports.use(expect);

/*!
 * Should interface
 */

var should = require('./chai/interface/should');
exports.use(should);

/*!
 * Assert interface
 */

var assert = require('./chai/interface/assert');
exports.use(assert);

},{"./chai/assertion":6,"./chai/config":7,"./chai/core/assertions":8,"./chai/interface/assert":9,"./chai/interface/expect":10,"./chai/interface/should":11,"./chai/utils":25,"assertion-error":1}],6:[function(require,module,exports){
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var config = require('./config');

module.exports = function (_chai, util) {
  /*!
   * Module dependencies.
   */

  var AssertionError = _chai.AssertionError
    , flag = util.flag;

  /*!
   * Module export.
   */

  _chai.Assertion = Assertion;

  /*!
   * Assertion Constructor
   *
   * Creates object for chaining.
   *
   * @api private
   */

  function Assertion (obj, msg, stack) {
    flag(this, 'ssfi', stack || arguments.callee);
    flag(this, 'object', obj);
    flag(this, 'message', msg);
  }

  Object.defineProperty(Assertion, 'includeStack', {
    get: function() {
      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
      return config.includeStack;
    },
    set: function(value) {
      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
      config.includeStack = value;
    }
  });

  Object.defineProperty(Assertion, 'showDiff', {
    get: function() {
      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
      return config.showDiff;
    },
    set: function(value) {
      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
      config.showDiff = value;
    }
  });

  Assertion.addProperty = function (name, fn) {
    util.addProperty(this.prototype, name, fn);
  };

  Assertion.addMethod = function (name, fn) {
    util.addMethod(this.prototype, name, fn);
  };

  Assertion.addChainableMethod = function (name, fn, chainingBehavior) {
    util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
  };

  Assertion.overwriteProperty = function (name, fn) {
    util.overwriteProperty(this.prototype, name, fn);
  };

  Assertion.overwriteMethod = function (name, fn) {
    util.overwriteMethod(this.prototype, name, fn);
  };

  Assertion.overwriteChainableMethod = function (name, fn, chainingBehavior) {
    util.overwriteChainableMethod(this.prototype, name, fn, chainingBehavior);
  };

  /**
   * ### .assert(expression, message, negateMessage, expected, actual, showDiff)
   *
   * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
   *
   * @name assert
   * @param {Philosophical} expression to be tested
   * @param {String|Function} message or function that returns message to display if expression fails
   * @param {String|Function} negatedMessage or function that returns negatedMessage to display if negated expression fails
   * @param {Mixed} expected value (remember to check for negation)
   * @param {Mixed} actual (optional) will default to `this.obj`
   * @param {Boolean} showDiff (optional) when set to `true`, assert will display a diff in addition to the message if expression fails
   * @api private
   */

  Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {
    var ok = util.test(this, arguments);
    if (true !== showDiff) showDiff = false;
    if (true !== config.showDiff) showDiff = false;

    if (!ok) {
      var msg = util.getMessage(this, arguments)
        , actual = util.getActual(this, arguments);
      throw new AssertionError(msg, {
          actual: actual
        , expected: expected
        , showDiff: showDiff
      }, (config.includeStack) ? this.assert : flag(this, 'ssfi'));
    }
  };

  /*!
   * ### ._obj
   *
   * Quick reference to stored `actual` value for plugin developers.
   *
   * @api private
   */

  Object.defineProperty(Assertion.prototype, '_obj',
    { get: function () {
        return flag(this, 'object');
      }
    , set: function (val) {
        flag(this, 'object', val);
      }
  });
};

},{"./config":7}],7:[function(require,module,exports){
module.exports = {

  /**
   * ### config.includeStack
   *
   * User configurable property, influences whether stack trace
   * is included in Assertion error message. Default of false
   * suppresses stack trace in the error message.
   *
   *     chai.config.includeStack = true;  // enable stack on error
   *
   * @param {Boolean}
   * @api public
   */

   includeStack: false,

  /**
   * ### config.showDiff
   *
   * User configurable property, influences whether or not
   * the `showDiff` flag should be included in the thrown
   * AssertionErrors. `false` will always be `false`; `true`
   * will be true when the assertion has requested a diff
   * be shown.
   *
   * @param {Boolean}
   * @api public
   */

  showDiff: true,

  /**
   * ### config.truncateThreshold
   *
   * User configurable property, sets length threshold for actual and
   * expected values in assertion errors. If this threshold is exceeded, for
   * example for large data structures, the value is replaced with something
   * like `[ Array(3) ]` or `{ Object (prop1, prop2) }`.
   *
   * Set it to zero if you want to disable truncating altogether.
   *
   * This is especially userful when doing assertions on arrays: having this
   * set to a reasonable large value makes the failure messages readily
   * inspectable.
   *
   *     chai.config.truncateThreshold = 0;  // disable truncating
   *
   * @param {Number}
   * @api public
   */

  truncateThreshold: 40

};

},{}],8:[function(require,module,exports){
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, _) {
  var Assertion = chai.Assertion
    , toString = Object.prototype.toString
    , flag = _.flag;

  /**
   * ### Language Chains
   *
   * The following are provided as chainable getters to
   * improve the readability of your assertions. They
   * do not provide testing capabilities unless they
   * have been overwritten by a plugin.
   *
   * **Chains**
   *
   * - to
   * - be
   * - been
   * - is
   * - that
   * - which
   * - and
   * - has
   * - have
   * - with
   * - at
   * - of
   * - same
   *
   * @name language chains
   * @api public
   */

  [ 'to', 'be', 'been'
  , 'is', 'and', 'has', 'have'
  , 'with', 'that', 'which', 'at'
  , 'of', 'same' ].forEach(function (chain) {
    Assertion.addProperty(chain, function () {
      return this;
    });
  });

  /**
   * ### .not
   *
   * Negates any of assertions following in the chain.
   *
   *     expect(foo).to.not.equal('bar');
   *     expect(goodFn).to.not.throw(Error);
   *     expect({ foo: 'baz' }).to.have.property('foo')
   *       .and.not.equal('bar');
   *
   * @name not
   * @api public
   */

  Assertion.addProperty('not', function () {
    flag(this, 'negate', true);
  });

  /**
   * ### .deep
   *
   * Sets the `deep` flag, later used by the `equal` and
   * `property` assertions.
   *
   *     expect(foo).to.deep.equal({ bar: 'baz' });
   *     expect({ foo: { bar: { baz: 'quux' } } })
   *       .to.have.deep.property('foo.bar.baz', 'quux');
   *
   * `.deep.property` special characters can be escaped
   * by adding two slashes before the `.` or `[]`.
   *
   *     var deepCss = { '.link': { '[target]': 42 }};
   *     expect(deepCss).to.have.deep.property('\\.link.\\[target\\]', 42);
   *
   * @name deep
   * @api public
   */

  Assertion.addProperty('deep', function () {
    flag(this, 'deep', true);
  });

  /**
   * ### .any
   *
   * Sets the `any` flag, (opposite of the `all` flag)
   * later used in the `keys` assertion.
   *
   *     expect(foo).to.have.any.keys('bar', 'baz');
   *
   * @name any
   * @api public
   */

  Assertion.addProperty('any', function () {
    flag(this, 'any', true);
    flag(this, 'all', false)
  });


  /**
   * ### .all
   *
   * Sets the `all` flag (opposite of the `any` flag)
   * later used by the `keys` assertion.
   *
   *     expect(foo).to.have.all.keys('bar', 'baz');
   *
   * @name all
   * @api public
   */

  Assertion.addProperty('all', function () {
    flag(this, 'all', true);
    flag(this, 'any', false);
  });

  /**
   * ### .a(type)
   *
   * The `a` and `an` assertions are aliases that can be
   * used either as language chains or to assert a value's
   * type.
   *
   *     // typeof
   *     expect('test').to.be.a('string');
   *     expect({ foo: 'bar' }).to.be.an('object');
   *     expect(null).to.be.a('null');
   *     expect(undefined).to.be.an('undefined');
   *     expect(new Error).to.be.an('error');
   *     expect(new Promise).to.be.a('promise');
   *     expect(new Float32Array()).to.be.a('float32array');
   *     expect(Symbol()).to.be.a('symbol');
   *
   *     // es6 overrides
   *     expect({[Symbol.toStringTag]:()=>'foo'}).to.be.a('foo');
   *
   *     // language chain
   *     expect(foo).to.be.an.instanceof(Foo);
   *
   * @name a
   * @alias an
   * @param {String} type
   * @param {String} message _optional_
   * @api public
   */

  function an (type, msg) {
    if (msg) flag(this, 'message', msg);
    type = type.toLowerCase();
    var obj = flag(this, 'object')
      , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';

    this.assert(
        type === _.type(obj)
      , 'expected #{this} to be ' + article + type
      , 'expected #{this} not to be ' + article + type
    );
  }

  Assertion.addChainableMethod('an', an);
  Assertion.addChainableMethod('a', an);

  /**
   * ### .include(value)
   *
   * The `include` and `contain` assertions can be used as either property
   * based language chains or as methods to assert the inclusion of an object
   * in an array or a substring in a string. When used as language chains,
   * they toggle the `contains` flag for the `keys` assertion.
   *
   *     expect([1,2,3]).to.include(2);
   *     expect('foobar').to.contain('foo');
   *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');
   *
   * @name include
   * @alias contain
   * @alias includes
   * @alias contains
   * @param {Object|String|Number} obj
   * @param {String} message _optional_
   * @api public
   */

  function includeChainingBehavior () {
    flag(this, 'contains', true);
  }

  function include (val, msg) {
    _.expectTypes(this, ['array', 'object', 'string']);

    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    var expected = false;

    if (_.type(obj) === 'array' && _.type(val) === 'object') {
      for (var i in obj) {
        if (_.eql(obj[i], val)) {
          expected = true;
          break;
        }
      }
    } else if (_.type(val) === 'object') {
      if (!flag(this, 'negate')) {
        for (var k in val) new Assertion(obj).property(k, val[k]);
        return;
      }
      var subset = {};
      for (var k in val) subset[k] = obj[k];
      expected = _.eql(subset, val);
    } else {
      expected = (obj != undefined) && ~obj.indexOf(val);
    }
    this.assert(
        expected
      , 'expected #{this} to include ' + _.inspect(val)
      , 'expected #{this} to not include ' + _.inspect(val));
  }

  Assertion.addChainableMethod('include', include, includeChainingBehavior);
  Assertion.addChainableMethod('contain', include, includeChainingBehavior);
  Assertion.addChainableMethod('contains', include, includeChainingBehavior);
  Assertion.addChainableMethod('includes', include, includeChainingBehavior);

  /**
   * ### .ok
   *
   * Asserts that the target is truthy.
   *
   *     expect('everything').to.be.ok;
   *     expect(1).to.be.ok;
   *     expect(false).to.not.be.ok;
   *     expect(undefined).to.not.be.ok;
   *     expect(null).to.not.be.ok;
   *
   * @name ok
   * @api public
   */

  Assertion.addProperty('ok', function () {
    this.assert(
        flag(this, 'object')
      , 'expected #{this} to be truthy'
      , 'expected #{this} to be falsy');
  });

  /**
   * ### .true
   *
   * Asserts that the target is `true`.
   *
   *     expect(true).to.be.true;
   *     expect(1).to.not.be.true;
   *
   * @name true
   * @api public
   */

  Assertion.addProperty('true', function () {
    this.assert(
        true === flag(this, 'object')
      , 'expected #{this} to be true'
      , 'expected #{this} to be false'
      , this.negate ? false : true
    );
  });

  /**
   * ### .false
   *
   * Asserts that the target is `false`.
   *
   *     expect(false).to.be.false;
   *     expect(0).to.not.be.false;
   *
   * @name false
   * @api public
   */

  Assertion.addProperty('false', function () {
    this.assert(
        false === flag(this, 'object')
      , 'expected #{this} to be false'
      , 'expected #{this} to be true'
      , this.negate ? true : false
    );
  });

  /**
   * ### .null
   *
   * Asserts that the target is `null`.
   *
   *     expect(null).to.be.null;
   *     expect(undefined).to.not.be.null;
   *
   * @name null
   * @api public
   */

  Assertion.addProperty('null', function () {
    this.assert(
        null === flag(this, 'object')
      , 'expected #{this} to be null'
      , 'expected #{this} not to be null'
    );
  });

  /**
   * ### .undefined
   *
   * Asserts that the target is `undefined`.
   *
   *     expect(undefined).to.be.undefined;
   *     expect(null).to.not.be.undefined;
   *
   * @name undefined
   * @api public
   */

  Assertion.addProperty('undefined', function () {
    this.assert(
        undefined === flag(this, 'object')
      , 'expected #{this} to be undefined'
      , 'expected #{this} not to be undefined'
    );
  });

  /**
   * ### .NaN
   * Asserts that the target is `NaN`.
   *
   *     expect('foo').to.be.NaN;
   *     expect(4).not.to.be.NaN;
   *
   * @name NaN
   * @api public
   */

  Assertion.addProperty('NaN', function () {
    this.assert(
        isNaN(flag(this, 'object'))
        , 'expected #{this} to be NaN'
        , 'expected #{this} not to be NaN'
    );
  });

  /**
   * ### .exist
   *
   * Asserts that the target is neither `null` nor `undefined`.
   *
   *     var foo = 'hi'
   *       , bar = null
   *       , baz;
   *
   *     expect(foo).to.exist;
   *     expect(bar).to.not.exist;
   *     expect(baz).to.not.exist;
   *
   * @name exist
   * @api public
   */

  Assertion.addProperty('exist', function () {
    this.assert(
        null != flag(this, 'object')
      , 'expected #{this} to exist'
      , 'expected #{this} to not exist'
    );
  });


  /**
   * ### .empty
   *
   * Asserts that the target's length is `0`. For arrays and strings, it checks
   * the `length` property. For objects, it gets the count of
   * enumerable keys.
   *
   *     expect([]).to.be.empty;
   *     expect('').to.be.empty;
   *     expect({}).to.be.empty;
   *
   * @name empty
   * @api public
   */

  Assertion.addProperty('empty', function () {
    var obj = flag(this, 'object')
      , expected = obj;

    if (Array.isArray(obj) || 'string' === typeof object) {
      expected = obj.length;
    } else if (typeof obj === 'object') {
      expected = Object.keys(obj).length;
    }

    this.assert(
        !expected
      , 'expected #{this} to be empty'
      , 'expected #{this} not to be empty'
    );
  });

  /**
   * ### .arguments
   *
   * Asserts that the target is an arguments object.
   *
   *     function test () {
   *       expect(arguments).to.be.arguments;
   *     }
   *
   * @name arguments
   * @alias Arguments
   * @api public
   */

  function checkArguments () {
    var obj = flag(this, 'object')
      , type = Object.prototype.toString.call(obj);
    this.assert(
        '[object Arguments]' === type
      , 'expected #{this} to be arguments but got ' + type
      , 'expected #{this} to not be arguments'
    );
  }

  Assertion.addProperty('arguments', checkArguments);
  Assertion.addProperty('Arguments', checkArguments);

  /**
   * ### .equal(value)
   *
   * Asserts that the target is strictly equal (`===`) to `value`.
   * Alternately, if the `deep` flag is set, asserts that
   * the target is deeply equal to `value`.
   *
   *     expect('hello').to.equal('hello');
   *     expect(42).to.equal(42);
   *     expect(1).to.not.equal(true);
   *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });
   *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });
   *
   * @name equal
   * @alias equals
   * @alias eq
   * @alias deep.equal
   * @param {Mixed} value
   * @param {String} message _optional_
   * @api public
   */

  function assertEqual (val, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'deep')) {
      return this.eql(val);
    } else {
      this.assert(
          val === obj
        , 'expected #{this} to equal #{exp}'
        , 'expected #{this} to not equal #{exp}'
        , val
        , this._obj
        , true
      );
    }
  }

  Assertion.addMethod('equal', assertEqual);
  Assertion.addMethod('equals', assertEqual);
  Assertion.addMethod('eq', assertEqual);

  /**
   * ### .eql(value)
   *
   * Asserts that the target is deeply equal to `value`.
   *
   *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
   *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);
   *
   * @name eql
   * @alias eqls
   * @param {Mixed} value
   * @param {String} message _optional_
   * @api public
   */

  function assertEql(obj, msg) {
    if (msg) flag(this, 'message', msg);
    this.assert(
        _.eql(obj, flag(this, 'object'))
      , 'expected #{this} to deeply equal #{exp}'
      , 'expected #{this} to not deeply equal #{exp}'
      , obj
      , this._obj
      , true
    );
  }

  Assertion.addMethod('eql', assertEql);
  Assertion.addMethod('eqls', assertEql);

  /**
   * ### .above(value)
   *
   * Asserts that the target is greater than `value`.
   *
   *     expect(10).to.be.above(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *
   * @name above
   * @alias gt
   * @alias greaterThan
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertAbove (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len > n
        , 'expected #{this} to have a length above #{exp} but got #{act}'
        , 'expected #{this} to not have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj > n
        , 'expected #{this} to be above ' + n
        , 'expected #{this} to be at most ' + n
      );
    }
  }

  Assertion.addMethod('above', assertAbove);
  Assertion.addMethod('gt', assertAbove);
  Assertion.addMethod('greaterThan', assertAbove);

  /**
   * ### .least(value)
   *
   * Asserts that the target is greater than or equal to `value`.
   *
   *     expect(10).to.be.at.least(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.least(2);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);
   *
   * @name least
   * @alias gte
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertLeast (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= n
        , 'expected #{this} to have a length at least #{exp} but got #{act}'
        , 'expected #{this} to have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj >= n
        , 'expected #{this} to be at least ' + n
        , 'expected #{this} to be below ' + n
      );
    }
  }

  Assertion.addMethod('least', assertLeast);
  Assertion.addMethod('gte', assertLeast);

  /**
   * ### .below(value)
   *
   * Asserts that the target is less than `value`.
   *
   *     expect(5).to.be.below(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *
   * @name below
   * @alias lt
   * @alias lessThan
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertBelow (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len < n
        , 'expected #{this} to have a length below #{exp} but got #{act}'
        , 'expected #{this} to not have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj < n
        , 'expected #{this} to be below ' + n
        , 'expected #{this} to be at least ' + n
      );
    }
  }

  Assertion.addMethod('below', assertBelow);
  Assertion.addMethod('lt', assertBelow);
  Assertion.addMethod('lessThan', assertBelow);

  /**
   * ### .most(value)
   *
   * Asserts that the target is less than or equal to `value`.
   *
   *     expect(5).to.be.at.most(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.most(4);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);
   *
   * @name most
   * @alias lte
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertMost (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len <= n
        , 'expected #{this} to have a length at most #{exp} but got #{act}'
        , 'expected #{this} to have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj <= n
        , 'expected #{this} to be at most ' + n
        , 'expected #{this} to be above ' + n
      );
    }
  }

  Assertion.addMethod('most', assertMost);
  Assertion.addMethod('lte', assertMost);

  /**
   * ### .within(start, finish)
   *
   * Asserts that the target is within a range.
   *
   *     expect(7).to.be.within(5,10);
   *
   * Can also be used in conjunction with `length` to
   * assert a length range. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * @name within
   * @param {Number} start lowerbound inclusive
   * @param {Number} finish upperbound inclusive
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('within', function (start, finish, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , range = start + '..' + finish;
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= start && len <= finish
        , 'expected #{this} to have a length within ' + range
        , 'expected #{this} to not have a length within ' + range
      );
    } else {
      this.assert(
          obj >= start && obj <= finish
        , 'expected #{this} to be within ' + range
        , 'expected #{this} to not be within ' + range
      );
    }
  });

  /**
   * ### .instanceof(constructor)
   *
   * Asserts that the target is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , Chai = new Tea('chai');
   *
   *     expect(Chai).to.be.an.instanceof(Tea);
   *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);
   *
   * @name instanceof
   * @param {Constructor} constructor
   * @param {String} message _optional_
   * @alias instanceOf
   * @api public
   */

  function assertInstanceOf (constructor, msg) {
    if (msg) flag(this, 'message', msg);
    var name = _.getName(constructor);
    this.assert(
        flag(this, 'object') instanceof constructor
      , 'expected #{this} to be an instance of ' + name
      , 'expected #{this} to not be an instance of ' + name
    );
  };

  Assertion.addMethod('instanceof', assertInstanceOf);
  Assertion.addMethod('instanceOf', assertInstanceOf);

  /**
   * ### .property(name, [value])
   *
   * Asserts that the target has a property `name`, optionally asserting that
   * the value of that property is strictly equal to  `value`.
   * If the `deep` flag is set, you can use dot- and bracket-notation for deep
   * references into objects and arrays.
   *
   *     // simple referencing
   *     var obj = { foo: 'bar' };
   *     expect(obj).to.have.property('foo');
   *     expect(obj).to.have.property('foo', 'bar');
   *
   *     // deep referencing
   *     var deepObj = {
   *         green: { tea: 'matcha' }
   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]
   *     };
   *
   *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');
   *
   * You can also use an array as the starting point of a `deep.property`
   * assertion, or traverse nested arrays.
   *
   *     var arr = [
   *         [ 'chai', 'matcha', 'konacha' ]
   *       , [ { tea: 'chai' }
   *         , { tea: 'matcha' }
   *         , { tea: 'konacha' } ]
   *     ];
   *
   *     expect(arr).to.have.deep.property('[0][1]', 'matcha');
   *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');
   *
   * Furthermore, `property` changes the subject of the assertion
   * to be the value of that property from the original object. This
   * permits for further chainable assertions on that property.
   *
   *     expect(obj).to.have.property('foo')
   *       .that.is.a('string');
   *     expect(deepObj).to.have.property('green')
   *       .that.is.an('object')
   *       .that.deep.equals({ tea: 'matcha' });
   *     expect(deepObj).to.have.property('teas')
   *       .that.is.an('array')
   *       .with.deep.property('[2]')
   *         .that.deep.equals({ tea: 'konacha' });
   *
   * Note that dots and bracket in `name` must be backslash-escaped when
   * the `deep` flag is set, while they must NOT be escaped when the `deep`
   * flag is not set.
   *
   *     // simple referencing
   *     var css = { '.link[target]': 42 };
   *     expect(css).to.have.property('.link[target]', 42);
   *
   *     // deep referencing
   *     var deepCss = { '.link': { '[target]': 42 }};
   *     expect(deepCss).to.have.deep.property('\\.link.\\[target\\]', 42);
   *
   * @name property
   * @alias deep.property
   * @param {String} name
   * @param {Mixed} value (optional)
   * @param {String} message _optional_
   * @returns value of property for chaining
   * @api public
   */

  Assertion.addMethod('property', function (name, val, msg) {
    if (msg) flag(this, 'message', msg);

    var isDeep = !!flag(this, 'deep')
      , descriptor = isDeep ? 'deep property ' : 'property '
      , negate = flag(this, 'negate')
      , obj = flag(this, 'object')
      , pathInfo = isDeep ? _.getPathInfo(name, obj) : null
      , hasProperty = isDeep
        ? pathInfo.exists
        : _.hasProperty(name, obj)
      , value = isDeep
        ? pathInfo.value
        : obj[name];

    if (negate && arguments.length > 1) {
      if (undefined === value) {
        msg = (msg != null) ? msg + ': ' : '';
        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));
      }
    } else {
      this.assert(
          hasProperty
        , 'expected #{this} to have a ' + descriptor + _.inspect(name)
        , 'expected #{this} to not have ' + descriptor + _.inspect(name));
    }

    if (arguments.length > 1) {
      this.assert(
          val === value
        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'
        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'
        , val
        , value
      );
    }

    flag(this, 'object', value);
  });


  /**
   * ### .ownProperty(name)
   *
   * Asserts that the target has an own property `name`.
   *
   *     expect('test').to.have.ownProperty('length');
   *
   * @name ownProperty
   * @alias haveOwnProperty
   * @param {String} name
   * @param {String} message _optional_
   * @api public
   */

  function assertOwnProperty (name, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        obj.hasOwnProperty(name)
      , 'expected #{this} to have own property ' + _.inspect(name)
      , 'expected #{this} to not have own property ' + _.inspect(name)
    );
  }

  Assertion.addMethod('ownProperty', assertOwnProperty);
  Assertion.addMethod('haveOwnProperty', assertOwnProperty);

  /**
   * ### .ownPropertyDescriptor(name[, descriptor[, message]])
   *
   * Asserts that the target has an own property descriptor `name`, that optionally matches `descriptor`.
   *
   *     expect('test').to.have.ownPropertyDescriptor('length');
   *     expect('test').to.have.ownPropertyDescriptor('length', { enumerable: false, configurable: false, writable: false, value: 4 });
   *     expect('test').not.to.have.ownPropertyDescriptor('length', { enumerable: false, configurable: false, writable: false, value: 3 });
   *     expect('test').ownPropertyDescriptor('length').to.have.property('enumerable', false);
   *     expect('test').ownPropertyDescriptor('length').to.have.keys('value');
   *
   * @name ownPropertyDescriptor
   * @alias haveOwnPropertyDescriptor
   * @param {String} name
   * @param {Object} descriptor _optional_
   * @param {String} message _optional_
   * @api public
   */

  function assertOwnPropertyDescriptor (name, descriptor, msg) {
    if (typeof descriptor === 'string') {
      msg = descriptor;
      descriptor = null;
    }
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    var actualDescriptor = Object.getOwnPropertyDescriptor(Object(obj), name);
    if (actualDescriptor && descriptor) {
      this.assert(
          _.eql(descriptor, actualDescriptor)
        , 'expected the own property descriptor for ' + _.inspect(name) + ' on #{this} to match ' + _.inspect(descriptor) + ', got ' + _.inspect(actualDescriptor)
        , 'expected the own property descriptor for ' + _.inspect(name) + ' on #{this} to not match ' + _.inspect(descriptor)
        , descriptor
        , actualDescriptor
        , true
      );
    } else {
      this.assert(
          actualDescriptor
        , 'expected #{this} to have an own property descriptor for ' + _.inspect(name)
        , 'expected #{this} to not have an own property descriptor for ' + _.inspect(name)
      );
    }
    flag(this, 'object', actualDescriptor);
  }

  Assertion.addMethod('ownPropertyDescriptor', assertOwnPropertyDescriptor);
  Assertion.addMethod('haveOwnPropertyDescriptor', assertOwnPropertyDescriptor);

  /**
   * ### .length
   *
   * Sets the `doLength` flag later used as a chain precursor to a value
   * comparison for the `length` property.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * *Deprecation notice:* Using `length` as an assertion will be deprecated
   * in version 2.4.0 and removed in 3.0.0. Code using the old style of
   * asserting for `length` property value using `length(value)` should be
   * switched to use `lengthOf(value)` instead.
   *
   * @name length
   * @api public
   */

  /**
   * ### .lengthOf(value[, message])
   *
   * Asserts that the target's `length` property has
   * the expected value.
   *
   *     expect([ 1, 2, 3]).to.have.lengthOf(3);
   *     expect('foobar').to.have.lengthOf(6);
   *
   * @name lengthOf
   * @param {Number} length
   * @param {String} message _optional_
   * @api public
   */

  function assertLengthChain () {
    flag(this, 'doLength', true);
  }

  function assertLength (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).to.have.property('length');
    var len = obj.length;

    this.assert(
        len == n
      , 'expected #{this} to have a length of #{exp} but got #{act}'
      , 'expected #{this} to not have a length of #{act}'
      , n
      , len
    );
  }

  Assertion.addChainableMethod('length', assertLength, assertLengthChain);
  Assertion.addMethod('lengthOf', assertLength);

  /**
   * ### .match(regexp)
   *
   * Asserts that the target matches a regular expression.
   *
   *     expect('foobar').to.match(/^foo/);
   *
   * @name match
   * @alias matches
   * @param {RegExp} RegularExpression
   * @param {String} message _optional_
   * @api public
   */
  function assertMatch(re, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        re.exec(obj)
      , 'expected #{this} to match ' + re
      , 'expected #{this} not to match ' + re
    );
  }

  Assertion.addMethod('match', assertMatch);
  Assertion.addMethod('matches', assertMatch);

  /**
   * ### .string(string)
   *
   * Asserts that the string target contains another string.
   *
   *     expect('foobar').to.have.string('bar');
   *
   * @name string
   * @param {String} string
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('string', function (str, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('string');

    this.assert(
        ~obj.indexOf(str)
      , 'expected #{this} to contain ' + _.inspect(str)
      , 'expected #{this} to not contain ' + _.inspect(str)
    );
  });


  /**
   * ### .keys(key1, [key2], [...])
   *
   * Asserts that the target contains any or all of the passed-in keys.
   * Use in combination with `any`, `all`, `contains`, or `have` will affect
   * what will pass.
   *
   * When used in conjunction with `any`, at least one key that is passed
   * in must exist in the target object. This is regardless whether or not
   * the `have` or `contain` qualifiers are used. Note, either `any` or `all`
   * should be used in the assertion. If neither are used, the assertion is
   * defaulted to `all`.
   *
   * When both `all` and `contain` are used, the target object must have at
   * least all of the passed-in keys but may have more keys not listed.
   *
   * When both `all` and `have` are used, the target object must both contain
   * all of the passed-in keys AND the number of keys in the target object must
   * match the number of keys passed in (in other words, a target object must
   * have all and only all of the passed-in keys).
   *
   *     expect({ foo: 1, bar: 2 }).to.have.any.keys('foo', 'baz');
   *     expect({ foo: 1, bar: 2 }).to.have.any.keys('foo');
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys('bar', 'baz');
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys(['foo']);
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys({'foo': 6});
   *     expect({ foo: 1, bar: 2 }).to.have.all.keys(['bar', 'foo']);
   *     expect({ foo: 1, bar: 2 }).to.have.all.keys({'bar': 6, 'foo': 7});
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys(['bar', 'foo']);
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys({'bar': 6});
   *
   *
   * @name keys
   * @alias key
   * @param {...String|Array|Object} keys
   * @api public
   */

  function assertKeys (keys) {
    var obj = flag(this, 'object')
      , str
      , ok = true
      , mixedArgsMsg = 'keys must be given single argument of Array|Object|String, or multiple String arguments';

    switch (_.type(keys)) {
      case "array":
        if (arguments.length > 1) throw (new Error(mixedArgsMsg));
        break;
      case "object":
        if (arguments.length > 1) throw (new Error(mixedArgsMsg));
        keys = Object.keys(keys);
        break;
      default:
        keys = Array.prototype.slice.call(arguments);
    }

    if (!keys.length) throw new Error('keys required');

    var actual = Object.keys(obj)
      , expected = keys
      , len = keys.length
      , any = flag(this, 'any')
      , all = flag(this, 'all');

    if (!any && !all) {
      all = true;
    }

    // Has any
    if (any) {
      var intersection = expected.filter(function(key) {
        return ~actual.indexOf(key);
      });
      ok = intersection.length > 0;
    }

    // Has all
    if (all) {
      ok = keys.every(function(key){
        return ~actual.indexOf(key);
      });
      if (!flag(this, 'negate') && !flag(this, 'contains')) {
        ok = ok && keys.length == actual.length;
      }
    }

    // Key string
    if (len > 1) {
      keys = keys.map(function(key){
        return _.inspect(key);
      });
      var last = keys.pop();
      if (all) {
        str = keys.join(', ') + ', and ' + last;
      }
      if (any) {
        str = keys.join(', ') + ', or ' + last;
      }
    } else {
      str = _.inspect(keys[0]);
    }

    // Form
    str = (len > 1 ? 'keys ' : 'key ') + str;

    // Have / include
    str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;

    // Assertion
    this.assert(
        ok
      , 'expected #{this} to ' + str
      , 'expected #{this} to not ' + str
      , expected.slice(0).sort()
      , actual.sort()
      , true
    );
  }

  Assertion.addMethod('keys', assertKeys);
  Assertion.addMethod('key', assertKeys);

  /**
   * ### .throw(constructor)
   *
   * Asserts that the function target will throw a specific error, or specific type of error
   * (as determined using `instanceof`), optionally with a RegExp or string inclusion test
   * for the error's message.
   *
   *     var err = new ReferenceError('This is a bad function.');
   *     var fn = function () { throw err; }
   *     expect(fn).to.throw(ReferenceError);
   *     expect(fn).to.throw(Error);
   *     expect(fn).to.throw(/bad function/);
   *     expect(fn).to.not.throw('good function');
   *     expect(fn).to.throw(ReferenceError, /bad function/);
   *     expect(fn).to.throw(err);
   *
   * Please note that when a throw expectation is negated, it will check each
   * parameter independently, starting with error constructor type. The appropriate way
   * to check for the existence of a type of error but for a message that does not match
   * is to use `and`.
   *
   *     expect(fn).to.throw(ReferenceError)
   *        .and.not.throw(/good function/);
   *
   * @name throw
   * @alias throws
   * @alias Throw
   * @param {ErrorConstructor} constructor
   * @param {String|RegExp} expected error message
   * @param {String} message _optional_
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @returns error for chaining (null if no error)
   * @api public
   */

  function assertThrows (constructor, errMsg, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('function');

    var thrown = false
      , desiredError = null
      , name = null
      , thrownError = null;

    if (arguments.length === 0) {
      errMsg = null;
      constructor = null;
    } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {
      errMsg = constructor;
      constructor = null;
    } else if (constructor && constructor instanceof Error) {
      desiredError = constructor;
      constructor = null;
      errMsg = null;
    } else if (typeof constructor === 'function') {
      name = constructor.prototype.name;
      if (!name || (name === 'Error' && constructor !== Error)) {
        name = constructor.name || (new constructor()).name;
      }
    } else {
      constructor = null;
    }

    try {
      obj();
    } catch (err) {
      // first, check desired error
      if (desiredError) {
        this.assert(
            err === desiredError
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp}'
          , (desiredError instanceof Error ? desiredError.toString() : desiredError)
          , (err instanceof Error ? err.toString() : err)
        );

        flag(this, 'object', err);
        return this;
      }

      // next, check constructor
      if (constructor) {
        this.assert(
            err instanceof constructor
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp} but #{act} was thrown'
          , name
          , (err instanceof Error ? err.toString() : err)
        );

        if (!errMsg) {
          flag(this, 'object', err);
          return this;
        }
      }

      // next, check message
      var message = 'error' === _.type(err) && "message" in err
        ? err.message
        : '' + err;

      if ((message != null) && errMsg && errMsg instanceof RegExp) {
        this.assert(
            errMsg.exec(message)
          , 'expected #{this} to throw error matching #{exp} but got #{act}'
          , 'expected #{this} to throw error not matching #{exp}'
          , errMsg
          , message
        );

        flag(this, 'object', err);
        return this;
      } else if ((message != null) && errMsg && 'string' === typeof errMsg) {
        this.assert(
            ~message.indexOf(errMsg)
          , 'expected #{this} to throw error including #{exp} but got #{act}'
          , 'expected #{this} to throw error not including #{act}'
          , errMsg
          , message
        );

        flag(this, 'object', err);
        return this;
      } else {
        thrown = true;
        thrownError = err;
      }
    }

    var actuallyGot = ''
      , expectedThrown = name !== null
        ? name
        : desiredError
          ? '#{exp}' //_.inspect(desiredError)
          : 'an error';

    if (thrown) {
      actuallyGot = ' but #{act} was thrown'
    }

    this.assert(
        thrown === true
      , 'expected #{this} to throw ' + expectedThrown + actuallyGot
      , 'expected #{this} to not throw ' + expectedThrown + actuallyGot
      , (desiredError instanceof Error ? desiredError.toString() : desiredError)
      , (thrownError instanceof Error ? thrownError.toString() : thrownError)
    );

    flag(this, 'object', thrownError);
  };

  Assertion.addMethod('throw', assertThrows);
  Assertion.addMethod('throws', assertThrows);
  Assertion.addMethod('Throw', assertThrows);

  /**
   * ### .respondTo(method)
   *
   * Asserts that the object or class target will respond to a method.
   *
   *     Klass.prototype.bar = function(){};
   *     expect(Klass).to.respondTo('bar');
   *     expect(obj).to.respondTo('bar');
   *
   * To check if a constructor will respond to a static function,
   * set the `itself` flag.
   *
   *     Klass.baz = function(){};
   *     expect(Klass).itself.to.respondTo('baz');
   *
   * @name respondTo
   * @alias respondsTo
   * @param {String} method
   * @param {String} message _optional_
   * @api public
   */

  function respondTo (method, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , itself = flag(this, 'itself')
      , context = ('function' === _.type(obj) && !itself)
        ? obj.prototype[method]
        : obj[method];

    this.assert(
        'function' === typeof context
      , 'expected #{this} to respond to ' + _.inspect(method)
      , 'expected #{this} to not respond to ' + _.inspect(method)
    );
  }

  Assertion.addMethod('respondTo', respondTo);
  Assertion.addMethod('respondsTo', respondTo);

  /**
   * ### .itself
   *
   * Sets the `itself` flag, later used by the `respondTo` assertion.
   *
   *     function Foo() {}
   *     Foo.bar = function() {}
   *     Foo.prototype.baz = function() {}
   *
   *     expect(Foo).itself.to.respondTo('bar');
   *     expect(Foo).itself.not.to.respondTo('baz');
   *
   * @name itself
   * @api public
   */

  Assertion.addProperty('itself', function () {
    flag(this, 'itself', true);
  });

  /**
   * ### .satisfy(method)
   *
   * Asserts that the target passes a given truth test.
   *
   *     expect(1).to.satisfy(function(num) { return num > 0; });
   *
   * @name satisfy
   * @alias satisfies
   * @param {Function} matcher
   * @param {String} message _optional_
   * @api public
   */

  function satisfy (matcher, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    var result = matcher(obj);
    this.assert(
        result
      , 'expected #{this} to satisfy ' + _.objDisplay(matcher)
      , 'expected #{this} to not satisfy' + _.objDisplay(matcher)
      , this.negate ? false : true
      , result
    );
  }

  Assertion.addMethod('satisfy', satisfy);
  Assertion.addMethod('satisfies', satisfy);

  /**
   * ### .closeTo(expected, delta)
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     expect(1.5).to.be.closeTo(1, 0.5);
   *
   * @name closeTo
   * @alias approximately
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message _optional_
   * @api public
   */

  function closeTo(expected, delta, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');

    new Assertion(obj, msg).is.a('number');
    if (_.type(expected) !== 'number' || _.type(delta) !== 'number') {
      throw new Error('the arguments to closeTo or approximately must be numbers');
    }

    this.assert(
        Math.abs(obj - expected) <= delta
      , 'expected #{this} to be close to ' + expected + ' +/- ' + delta
      , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta
    );
  }

  Assertion.addMethod('closeTo', closeTo);
  Assertion.addMethod('approximately', closeTo);

  function isSubsetOf(subset, superset, cmp) {
    return subset.every(function(elem) {
      if (!cmp) return superset.indexOf(elem) !== -1;

      return superset.some(function(elem2) {
        return cmp(elem, elem2);
      });
    })
  }

  /**
   * ### .members(set)
   *
   * Asserts that the target is a superset of `set`,
   * or that the target and `set` have the same strictly-equal (===) members.
   * Alternately, if the `deep` flag is set, set members are compared for deep
   * equality.
   *
   *     expect([1, 2, 3]).to.include.members([3, 2]);
   *     expect([1, 2, 3]).to.not.include.members([3, 2, 8]);
   *
   *     expect([4, 2]).to.have.members([2, 4]);
   *     expect([5, 2]).to.not.have.members([5, 2, 1]);
   *
   *     expect([{ id: 1 }]).to.deep.include.members([{ id: 1 }]);
   *
   * @name members
   * @param {Array} set
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('members', function (subset, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');

    new Assertion(obj).to.be.an('array');
    new Assertion(subset).to.be.an('array');

    var cmp = flag(this, 'deep') ? _.eql : undefined;

    if (flag(this, 'contains')) {
      return this.assert(
          isSubsetOf(subset, obj, cmp)
        , 'expected #{this} to be a superset of #{act}'
        , 'expected #{this} to not be a superset of #{act}'
        , obj
        , subset
      );
    }

    this.assert(
        isSubsetOf(obj, subset, cmp) && isSubsetOf(subset, obj, cmp)
        , 'expected #{this} to have the same members as #{act}'
        , 'expected #{this} to not have the same members as #{act}'
        , obj
        , subset
    );
  });

  /**
   * ### .oneOf(list)
   *
   * Assert that a value appears somewhere in the top level of array `list`.
   *
   *     expect('a').to.be.oneOf(['a', 'b', 'c']);
   *     expect(9).to.not.be.oneOf(['z']);
   *     expect([3]).to.not.be.oneOf([1, 2, [3]]);
   *
   *     var three = [3];
   *     // for object-types, contents are not compared
   *     expect(three).to.not.be.oneOf([1, 2, [3]]);
   *     // comparing references works
   *     expect(three).to.be.oneOf([1, 2, three]);
   *
   * @name oneOf
   * @param {Array<*>} list
   * @param {String} message _optional_
   * @api public
   */

  function oneOf (list, msg) {
    if (msg) flag(this, 'message', msg);
    var expected = flag(this, 'object');
    new Assertion(list).to.be.an('array');

    this.assert(
        list.indexOf(expected) > -1
      , 'expected #{this} to be one of #{exp}'
      , 'expected #{this} to not be one of #{exp}'
      , list
      , expected
    );
  }

  Assertion.addMethod('oneOf', oneOf);


  /**
   * ### .change(function)
   *
   * Asserts that a function changes an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val += 3 };
   *     var noChangeFn = function() { return 'foo' + 'bar'; }
   *     expect(fn).to.change(obj, 'val');
   *     expect(noChangFn).to.not.change(obj, 'val')
   *
   * @name change
   * @alias changes
   * @alias Change
   * @param {String} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  function assertChanges (object, prop, msg) {
    if (msg) flag(this, 'message', msg);
    var fn = flag(this, 'object');
    new Assertion(object, msg).to.have.property(prop);
    new Assertion(fn).is.a('function');

    var initial = object[prop];
    fn();

    this.assert(
      initial !== object[prop]
      , 'expected .' + prop + ' to change'
      , 'expected .' + prop + ' to not change'
    );
  }

  Assertion.addChainableMethod('change', assertChanges);
  Assertion.addChainableMethod('changes', assertChanges);

  /**
   * ### .increase(function)
   *
   * Asserts that a function increases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 15 };
   *     expect(fn).to.increase(obj, 'val');
   *
   * @name increase
   * @alias increases
   * @alias Increase
   * @param {String} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  function assertIncreases (object, prop, msg) {
    if (msg) flag(this, 'message', msg);
    var fn = flag(this, 'object');
    new Assertion(object, msg).to.have.property(prop);
    new Assertion(fn).is.a('function');

    var initial = object[prop];
    fn();

    this.assert(
      object[prop] - initial > 0
      , 'expected .' + prop + ' to increase'
      , 'expected .' + prop + ' to not increase'
    );
  }

  Assertion.addChainableMethod('increase', assertIncreases);
  Assertion.addChainableMethod('increases', assertIncreases);

  /**
   * ### .decrease(function)
   *
   * Asserts that a function decreases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 5 };
   *     expect(fn).to.decrease(obj, 'val');
   *
   * @name decrease
   * @alias decreases
   * @alias Decrease
   * @param {String} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  function assertDecreases (object, prop, msg) {
    if (msg) flag(this, 'message', msg);
    var fn = flag(this, 'object');
    new Assertion(object, msg).to.have.property(prop);
    new Assertion(fn).is.a('function');

    var initial = object[prop];
    fn();

    this.assert(
      object[prop] - initial < 0
      , 'expected .' + prop + ' to decrease'
      , 'expected .' + prop + ' to not decrease'
    );
  }

  Assertion.addChainableMethod('decrease', assertDecreases);
  Assertion.addChainableMethod('decreases', assertDecreases);

  /**
   * ### .extensible
   *
   * Asserts that the target is extensible (can have new properties added to
   * it).
   *
   *     var nonExtensibleObject = Object.preventExtensions({});
   *     var sealedObject = Object.seal({});
   *     var frozenObject = Object.freeze({});
   *
   *     expect({}).to.be.extensible;
   *     expect(nonExtensibleObject).to.not.be.extensible;
   *     expect(sealedObject).to.not.be.extensible;
   *     expect(frozenObject).to.not.be.extensible;
   *
   * @name extensible
   * @api public
   */

  Assertion.addProperty('extensible', function() {
    var obj = flag(this, 'object');

    // In ES5, if the argument to this method is not an object (a primitive), then it will cause a TypeError.
    // In ES6, a non-object argument will be treated as if it was a non-extensible ordinary object, simply return false.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isExtensible
    // The following provides ES6 behavior when a TypeError is thrown under ES5.

    var isExtensible;

    try {
      isExtensible = Object.isExtensible(obj);
    } catch (err) {
      if (err instanceof TypeError) isExtensible = false;
      else throw err;
    }

    this.assert(
      isExtensible
      , 'expected #{this} to be extensible'
      , 'expected #{this} to not be extensible'
    );
  });

  /**
   * ### .sealed
   *
   * Asserts that the target is sealed (cannot have new properties added to it
   * and its existing properties cannot be removed).
   *
   *     var sealedObject = Object.seal({});
   *     var frozenObject = Object.freeze({});
   *
   *     expect(sealedObject).to.be.sealed;
   *     expect(frozenObject).to.be.sealed;
   *     expect({}).to.not.be.sealed;
   *
   * @name sealed
   * @api public
   */

  Assertion.addProperty('sealed', function() {
    var obj = flag(this, 'object');

    // In ES5, if the argument to this method is not an object (a primitive), then it will cause a TypeError.
    // In ES6, a non-object argument will be treated as if it was a sealed ordinary object, simply return true.
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isSealed
    // The following provides ES6 behavior when a TypeError is thrown under ES5.

    var isSealed;

    try {
      isSealed = Object.isSealed(obj);
    } catch (err) {
      if (err instanceof TypeError) isSealed = true;
      else throw err;
    }

    this.assert(
      isSealed
      , 'expected #{this} to be sealed'
      , 'expected #{this} to not be sealed'
    );
  });

  /**
   * ### .frozen
   *
   * Asserts that the target is frozen (cannot have new properties added to it
   * and its existing properties cannot be modified).
   *
   *     var frozenObject = Object.freeze({});
   *
   *     expect(frozenObject).to.be.frozen;
   *     expect({}).to.not.be.frozen;
   *
   * @name frozen
   * @api public
   */

  Assertion.addProperty('frozen', function() {
    var obj = flag(this, 'object');

    // In ES5, if the argument to this method is not an object (a primitive), then it will cause a TypeError.
    // In ES6, a non-object argument will be treated as if it was a frozen ordinary object, simply return true.
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isFrozen
    // The following provides ES6 behavior when a TypeError is thrown under ES5.

    var isFrozen;

    try {
      isFrozen = Object.isFrozen(obj);
    } catch (err) {
      if (err instanceof TypeError) isFrozen = true;
      else throw err;
    }

    this.assert(
      isFrozen
      , 'expected #{this} to be frozen'
      , 'expected #{this} to not be frozen'
    );
  });
};

},{}],9:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */


module.exports = function (chai, util) {

  /*!
   * Chai dependencies.
   */

  var Assertion = chai.Assertion
    , flag = util.flag;

  /*!
   * Module export.
   */

  /**
   * ### assert(expression, message)
   *
   * Write your own test expressions.
   *
   *     assert('foo' !== 'bar', 'foo is not bar');
   *     assert(Array.isArray([]), 'empty arrays are arrays');
   *
   * @param {Mixed} expression to test for truthiness
   * @param {String} message to display on error
   * @name assert
   * @api public
   */

  var assert = chai.assert = function (express, errmsg) {
    var test = new Assertion(null, null, chai.assert);
    test.assert(
        express
      , errmsg
      , '[ negation message unavailable ]'
    );
  };

  /**
   * ### .fail(actual, expected, [message], [operator])
   *
   * Throw a failure. Node.js `assert` module-compatible.
   *
   * @name fail
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @param {String} operator
   * @api public
   */

  assert.fail = function (actual, expected, message, operator) {
    message = message || 'assert.fail()';
    throw new chai.AssertionError(message, {
        actual: actual
      , expected: expected
      , operator: operator
    }, assert.fail);
  };

  /**
   * ### .isOk(object, [message])
   *
   * Asserts that `object` is truthy.
   *
   *     assert.isOk('everything', 'everything is ok');
   *     assert.isOk(false, 'this will fail');
   *
   * @name isOk
   * @alias ok
   * @param {Mixed} object to test
   * @param {String} message
   * @api public
   */

  assert.isOk = function (val, msg) {
    new Assertion(val, msg).is.ok;
  };

  /**
   * ### .isNotOk(object, [message])
   *
   * Asserts that `object` is falsy.
   *
   *     assert.isNotOk('everything', 'this will fail');
   *     assert.isNotOk(false, 'this will pass');
   *
   * @name isNotOk
   * @alias notOk
   * @param {Mixed} object to test
   * @param {String} message
   * @api public
   */

  assert.isNotOk = function (val, msg) {
    new Assertion(val, msg).is.not.ok;
  };

  /**
   * ### .equal(actual, expected, [message])
   *
   * Asserts non-strict equality (`==`) of `actual` and `expected`.
   *
   *     assert.equal(3, '3', '== coerces values to strings');
   *
   * @name equal
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.equal = function (act, exp, msg) {
    var test = new Assertion(act, msg, assert.equal);

    test.assert(
        exp == flag(test, 'object')
      , 'expected #{this} to equal #{exp}'
      , 'expected #{this} to not equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .notEqual(actual, expected, [message])
   *
   * Asserts non-strict inequality (`!=`) of `actual` and `expected`.
   *
   *     assert.notEqual(3, 4, 'these numbers are not equal');
   *
   * @name notEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notEqual = function (act, exp, msg) {
    var test = new Assertion(act, msg, assert.notEqual);

    test.assert(
        exp != flag(test, 'object')
      , 'expected #{this} to not equal #{exp}'
      , 'expected #{this} to equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .strictEqual(actual, expected, [message])
   *
   * Asserts strict equality (`===`) of `actual` and `expected`.
   *
   *     assert.strictEqual(true, true, 'these booleans are strictly equal');
   *
   * @name strictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.strictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.equal(exp);
  };

  /**
   * ### .notStrictEqual(actual, expected, [message])
   *
   * Asserts strict inequality (`!==`) of `actual` and `expected`.
   *
   *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');
   *
   * @name notStrictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notStrictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.equal(exp);
  };

  /**
   * ### .deepEqual(actual, expected, [message])
   *
   * Asserts that `actual` is deeply equal to `expected`.
   *
   *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });
   *
   * @name deepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.deepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.eql(exp);
  };

  /**
   * ### .notDeepEqual(actual, expected, [message])
   *
   * Assert that `actual` is not deeply equal to `expected`.
   *
   *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });
   *
   * @name notDeepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notDeepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.eql(exp);
  };

   /**
   * ### .isAbove(valueToCheck, valueToBeAbove, [message])
   *
   * Asserts `valueToCheck` is strictly greater than (>) `valueToBeAbove`
   *
   *     assert.isAbove(5, 2, '5 is strictly greater than 2');
   *
   * @name isAbove
   * @param {Mixed} valueToCheck
   * @param {Mixed} valueToBeAbove
   * @param {String} message
   * @api public
   */

  assert.isAbove = function (val, abv, msg) {
    new Assertion(val, msg).to.be.above(abv);
  };

   /**
   * ### .isAtLeast(valueToCheck, valueToBeAtLeast, [message])
   *
   * Asserts `valueToCheck` is greater than or equal to (>=) `valueToBeAtLeast`
   *
   *     assert.isAtLeast(5, 2, '5 is greater or equal to 2');
   *     assert.isAtLeast(3, 3, '3 is greater or equal to 3');
   *
   * @name isAtLeast
   * @param {Mixed} valueToCheck
   * @param {Mixed} valueToBeAtLeast
   * @param {String} message
   * @api public
   */

  assert.isAtLeast = function (val, atlst, msg) {
    new Assertion(val, msg).to.be.least(atlst);
  };

   /**
   * ### .isBelow(valueToCheck, valueToBeBelow, [message])
   *
   * Asserts `valueToCheck` is strictly less than (<) `valueToBeBelow`
   *
   *     assert.isBelow(3, 6, '3 is strictly less than 6');
   *
   * @name isBelow
   * @param {Mixed} valueToCheck
   * @param {Mixed} valueToBeBelow
   * @param {String} message
   * @api public
   */

  assert.isBelow = function (val, blw, msg) {
    new Assertion(val, msg).to.be.below(blw);
  };

   /**
   * ### .isAtMost(valueToCheck, valueToBeAtMost, [message])
   *
   * Asserts `valueToCheck` is less than or equal to (<=) `valueToBeAtMost`
   *
   *     assert.isAtMost(3, 6, '3 is less than or equal to 6');
   *     assert.isAtMost(4, 4, '4 is less than or equal to 4');
   *
   * @name isAtMost
   * @param {Mixed} valueToCheck
   * @param {Mixed} valueToBeAtMost
   * @param {String} message
   * @api public
   */

  assert.isAtMost = function (val, atmst, msg) {
    new Assertion(val, msg).to.be.most(atmst);
  };

  /**
   * ### .isTrue(value, [message])
   *
   * Asserts that `value` is true.
   *
   *     var teaServed = true;
   *     assert.isTrue(teaServed, 'the tea has been served');
   *
   * @name isTrue
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isTrue = function (val, msg) {
    new Assertion(val, msg).is['true'];
  };

  /**
   * ### .isNotTrue(value, [message])
   *
   * Asserts that `value` is not true.
   *
   *     var tea = 'tasty chai';
   *     assert.isNotTrue(tea, 'great, time for tea!');
   *
   * @name isNotTrue
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotTrue = function (val, msg) {
    new Assertion(val, msg).to.not.equal(true);
  };

  /**
   * ### .isFalse(value, [message])
   *
   * Asserts that `value` is false.
   *
   *     var teaServed = false;
   *     assert.isFalse(teaServed, 'no tea yet? hmm...');
   *
   * @name isFalse
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isFalse = function (val, msg) {
    new Assertion(val, msg).is['false'];
  };

  /**
   * ### .isNotFalse(value, [message])
   *
   * Asserts that `value` is not false.
   *
   *     var tea = 'tasty chai';
   *     assert.isNotFalse(tea, 'great, time for tea!');
   *
   * @name isNotFalse
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotFalse = function (val, msg) {
    new Assertion(val, msg).to.not.equal(false);
  };

  /**
   * ### .isNull(value, [message])
   *
   * Asserts that `value` is null.
   *
   *     assert.isNull(err, 'there was no error');
   *
   * @name isNull
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNull = function (val, msg) {
    new Assertion(val, msg).to.equal(null);
  };

  /**
   * ### .isNotNull(value, [message])
   *
   * Asserts that `value` is not null.
   *
   *     var tea = 'tasty chai';
   *     assert.isNotNull(tea, 'great, time for tea!');
   *
   * @name isNotNull
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotNull = function (val, msg) {
    new Assertion(val, msg).to.not.equal(null);
  };

  /**
   * ### .isNaN
   * Asserts that value is NaN
   *
   *    assert.isNaN('foo', 'foo is NaN');
   *
   * @name isNaN
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNaN = function (val, msg) {
    new Assertion(val, msg).to.be.NaN;
  };

  /**
   * ### .isNotNaN
   * Asserts that value is not NaN
   *
   *    assert.isNotNaN(4, '4 is not NaN');
   *
   * @name isNotNaN
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */
  assert.isNotNaN = function (val, msg) {
    new Assertion(val, msg).not.to.be.NaN;
  };

  /**
   * ### .isUndefined(value, [message])
   *
   * Asserts that `value` is `undefined`.
   *
   *     var tea;
   *     assert.isUndefined(tea, 'no tea defined');
   *
   * @name isUndefined
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isUndefined = function (val, msg) {
    new Assertion(val, msg).to.equal(undefined);
  };

  /**
   * ### .isDefined(value, [message])
   *
   * Asserts that `value` is not `undefined`.
   *
   *     var tea = 'cup of chai';
   *     assert.isDefined(tea, 'tea has been defined');
   *
   * @name isDefined
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isDefined = function (val, msg) {
    new Assertion(val, msg).to.not.equal(undefined);
  };

  /**
   * ### .isFunction(value, [message])
   *
   * Asserts that `value` is a function.
   *
   *     function serveTea() { return 'cup of tea'; };
   *     assert.isFunction(serveTea, 'great, we can have tea now');
   *
   * @name isFunction
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isFunction = function (val, msg) {
    new Assertion(val, msg).to.be.a('function');
  };

  /**
   * ### .isNotFunction(value, [message])
   *
   * Asserts that `value` is _not_ a function.
   *
   *     var serveTea = [ 'heat', 'pour', 'sip' ];
   *     assert.isNotFunction(serveTea, 'great, we have listed the steps');
   *
   * @name isNotFunction
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotFunction = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('function');
  };

  /**
   * ### .isObject(value, [message])
   *
   * Asserts that `value` is an object (as revealed by
   * `Object.prototype.toString`).
   *
   *     var selection = { name: 'Chai', serve: 'with spices' };
   *     assert.isObject(selection, 'tea selection is an object');
   *
   * @name isObject
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isObject = function (val, msg) {
    new Assertion(val, msg).to.be.a('object');
  };

  /**
   * ### .isNotObject(value, [message])
   *
   * Asserts that `value` is _not_ an object.
   *
   *     var selection = 'chai'
   *     assert.isNotObject(selection, 'tea selection is not an object');
   *     assert.isNotObject(null, 'null is not an object');
   *
   * @name isNotObject
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotObject = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('object');
  };

  /**
   * ### .isArray(value, [message])
   *
   * Asserts that `value` is an array.
   *
   *     var menu = [ 'green', 'chai', 'oolong' ];
   *     assert.isArray(menu, 'what kind of tea do we want?');
   *
   * @name isArray
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isArray = function (val, msg) {
    new Assertion(val, msg).to.be.an('array');
  };

  /**
   * ### .isNotArray(value, [message])
   *
   * Asserts that `value` is _not_ an array.
   *
   *     var menu = 'green|chai|oolong';
   *     assert.isNotArray(menu, 'what kind of tea do we want?');
   *
   * @name isNotArray
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotArray = function (val, msg) {
    new Assertion(val, msg).to.not.be.an('array');
  };

  /**
   * ### .isString(value, [message])
   *
   * Asserts that `value` is a string.
   *
   *     var teaOrder = 'chai';
   *     assert.isString(teaOrder, 'order placed');
   *
   * @name isString
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isString = function (val, msg) {
    new Assertion(val, msg).to.be.a('string');
  };

  /**
   * ### .isNotString(value, [message])
   *
   * Asserts that `value` is _not_ a string.
   *
   *     var teaOrder = 4;
   *     assert.isNotString(teaOrder, 'order placed');
   *
   * @name isNotString
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotString = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('string');
  };

  /**
   * ### .isNumber(value, [message])
   *
   * Asserts that `value` is a number.
   *
   *     var cups = 2;
   *     assert.isNumber(cups, 'how many cups');
   *
   * @name isNumber
   * @param {Number} value
   * @param {String} message
   * @api public
   */

  assert.isNumber = function (val, msg) {
    new Assertion(val, msg).to.be.a('number');
  };

  /**
   * ### .isNotNumber(value, [message])
   *
   * Asserts that `value` is _not_ a number.
   *
   *     var cups = '2 cups please';
   *     assert.isNotNumber(cups, 'how many cups');
   *
   * @name isNotNumber
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotNumber = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('number');
  };

  /**
   * ### .isBoolean(value, [message])
   *
   * Asserts that `value` is a boolean.
   *
   *     var teaReady = true
   *       , teaServed = false;
   *
   *     assert.isBoolean(teaReady, 'is the tea ready');
   *     assert.isBoolean(teaServed, 'has tea been served');
   *
   * @name isBoolean
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isBoolean = function (val, msg) {
    new Assertion(val, msg).to.be.a('boolean');
  };

  /**
   * ### .isNotBoolean(value, [message])
   *
   * Asserts that `value` is _not_ a boolean.
   *
   *     var teaReady = 'yep'
   *       , teaServed = 'nope';
   *
   *     assert.isNotBoolean(teaReady, 'is the tea ready');
   *     assert.isNotBoolean(teaServed, 'has tea been served');
   *
   * @name isNotBoolean
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotBoolean = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('boolean');
  };

  /**
   * ### .typeOf(value, name, [message])
   *
   * Asserts that `value`'s type is `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');
   *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');
   *     assert.typeOf('tea', 'string', 'we have a string');
   *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');
   *     assert.typeOf(null, 'null', 'we have a null');
   *     assert.typeOf(undefined, 'undefined', 'we have an undefined');
   *
   * @name typeOf
   * @param {Mixed} value
   * @param {String} name
   * @param {String} message
   * @api public
   */

  assert.typeOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.a(type);
  };

  /**
   * ### .notTypeOf(value, name, [message])
   *
   * Asserts that `value`'s type is _not_ `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.notTypeOf('tea', 'number', 'strings are not numbers');
   *
   * @name notTypeOf
   * @param {Mixed} value
   * @param {String} typeof name
   * @param {String} message
   * @api public
   */

  assert.notTypeOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.a(type);
  };

  /**
   * ### .instanceOf(object, constructor, [message])
   *
   * Asserts that `value` is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new Tea('chai');
   *
   *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');
   *
   * @name instanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @api public
   */

  assert.instanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.instanceOf(type);
  };

  /**
   * ### .notInstanceOf(object, constructor, [message])
   *
   * Asserts `value` is not an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new String('chai');
   *
   *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');
   *
   * @name notInstanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @api public
   */

  assert.notInstanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.instanceOf(type);
  };

  /**
   * ### .include(haystack, needle, [message])
   *
   * Asserts that `haystack` includes `needle`. Works
   * for strings and arrays.
   *
   *     assert.include('foobar', 'bar', 'foobar contains string "bar"');
   *     assert.include([ 1, 2, 3 ], 3, 'array contains value');
   *
   * @name include
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @api public
   */

  assert.include = function (exp, inc, msg) {
    new Assertion(exp, msg, assert.include).include(inc);
  };

  /**
   * ### .notInclude(haystack, needle, [message])
   *
   * Asserts that `haystack` does not include `needle`. Works
   * for strings and arrays.
   *
   *     assert.notInclude('foobar', 'baz', 'string not include substring');
   *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');
   *
   * @name notInclude
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @api public
   */

  assert.notInclude = function (exp, inc, msg) {
    new Assertion(exp, msg, assert.notInclude).not.include(inc);
  };

  /**
   * ### .match(value, regexp, [message])
   *
   * Asserts that `value` matches the regular expression `regexp`.
   *
   *     assert.match('foobar', /^foo/, 'regexp matches');
   *
   * @name match
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @api public
   */

  assert.match = function (exp, re, msg) {
    new Assertion(exp, msg).to.match(re);
  };

  /**
   * ### .notMatch(value, regexp, [message])
   *
   * Asserts that `value` does not match the regular expression `regexp`.
   *
   *     assert.notMatch('foobar', /^foo/, 'regexp does not match');
   *
   * @name notMatch
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @api public
   */

  assert.notMatch = function (exp, re, msg) {
    new Assertion(exp, msg).to.not.match(re);
  };

  /**
   * ### .property(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`.
   *
   *     assert.property({ tea: { green: 'matcha' }}, 'tea');
   *
   * @name property
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.property = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.property(prop);
  };

  /**
   * ### .notProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`.
   *
   *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');
   *
   * @name notProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.notProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.property(prop);
  };

  /**
   * ### .deepProperty(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`, which can be a
   * string using dot- and bracket-notation for deep reference.
   *
   *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');
   *
   * @name deepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.deepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop);
  };

  /**
   * ### .notDeepProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`, which
   * can be a string using dot- and bracket-notation for deep reference.
   *
   *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');
   *
   * @name notDeepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.notDeepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop);
  };

  /**
   * ### .propertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`.
   *
   *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');
   *
   * @name propertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.propertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.property(prop, val);
  };

  /**
   * ### .propertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`.
   *
   *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');
   *
   * @name propertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.propertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.property(prop, val);
  };

  /**
   * ### .deepPropertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`. `property` can use dot- and bracket-notation for deep
   * reference.
   *
   *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');
   *
   * @name deepPropertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.deepPropertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop, val);
  };

  /**
   * ### .deepPropertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`. `property` can use dot- and
   * bracket-notation for deep reference.
   *
   *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');
   *
   * @name deepPropertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.deepPropertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop, val);
  };

  /**
   * ### .lengthOf(object, length, [message])
   *
   * Asserts that `object` has a `length` property with the expected value.
   *
   *     assert.lengthOf([1,2,3], 3, 'array has length of 3');
   *     assert.lengthOf('foobar', 6, 'string has length of 6');
   *
   * @name lengthOf
   * @param {Mixed} object
   * @param {Number} length
   * @param {String} message
   * @api public
   */

  assert.lengthOf = function (exp, len, msg) {
    new Assertion(exp, msg).to.have.length(len);
  };

  /**
   * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])
   *
   * Asserts that `function` will throw an error that is an instance of
   * `constructor`, or alternately that it will throw an error with message
   * matching `regexp`.
   *
   *     assert.throws(fn, 'function throws a reference error');
   *     assert.throws(fn, /function throws a reference error/);
   *     assert.throws(fn, ReferenceError);
   *     assert.throws(fn, ReferenceError, 'function throws a reference error');
   *     assert.throws(fn, ReferenceError, /function throws a reference error/);
   *
   * @name throws
   * @alias throw
   * @alias Throw
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  assert.throws = function (fn, errt, errs, msg) {
    if ('string' === typeof errt || errt instanceof RegExp) {
      errs = errt;
      errt = null;
    }

    var assertErr = new Assertion(fn, msg).to.throw(errt, errs);
    return flag(assertErr, 'object');
  };

  /**
   * ### .doesNotThrow(function, [constructor/regexp], [message])
   *
   * Asserts that `function` will _not_ throw an error that is an instance of
   * `constructor`, or alternately that it will not throw an error with message
   * matching `regexp`.
   *
   *     assert.doesNotThrow(fn, Error, 'function does not throw');
   *
   * @name doesNotThrow
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  assert.doesNotThrow = function (fn, type, msg) {
    if ('string' === typeof type) {
      msg = type;
      type = null;
    }

    new Assertion(fn, msg).to.not.Throw(type);
  };

  /**
   * ### .operator(val1, operator, val2, [message])
   *
   * Compares two values using `operator`.
   *
   *     assert.operator(1, '<', 2, 'everything is ok');
   *     assert.operator(1, '>', 2, 'this will fail');
   *
   * @name operator
   * @param {Mixed} val1
   * @param {String} operator
   * @param {Mixed} val2
   * @param {String} message
   * @api public
   */

  assert.operator = function (val, operator, val2, msg) {
    var ok;
    switch(operator) {
      case '==':
        ok = val == val2;
        break;
      case '===':
        ok = val === val2;
        break;
      case '>':
        ok = val > val2;
        break;
      case '>=':
        ok = val >= val2;
        break;
      case '<':
        ok = val < val2;
        break;
      case '<=':
        ok = val <= val2;
        break;
      case '!=':
        ok = val != val2;
        break;
      case '!==':
        ok = val !== val2;
        break;
      default:
        throw new Error('Invalid operator "' + operator + '"');
    }
    var test = new Assertion(ok, msg);
    test.assert(
        true === flag(test, 'object')
      , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)
      , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );
  };

  /**
   * ### .closeTo(actual, expected, delta, [message])
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');
   *
   * @name closeTo
   * @param {Number} actual
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message
   * @api public
   */

  assert.closeTo = function (act, exp, delta, msg) {
    new Assertion(act, msg).to.be.closeTo(exp, delta);
  };

  /**
   * ### .approximately(actual, expected, delta, [message])
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     assert.approximately(1.5, 1, 0.5, 'numbers are close');
   *
   * @name approximately
   * @param {Number} actual
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message
   * @api public
   */

  assert.approximately = function (act, exp, delta, msg) {
    new Assertion(act, msg).to.be.approximately(exp, delta);
  };

  /**
   * ### .sameMembers(set1, set2, [message])
   *
   * Asserts that `set1` and `set2` have the same members.
   * Order is not taken into account.
   *
   *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');
   *
   * @name sameMembers
   * @param {Array} set1
   * @param {Array} set2
   * @param {String} message
   * @api public
   */

  assert.sameMembers = function (set1, set2, msg) {
    new Assertion(set1, msg).to.have.same.members(set2);
  }

  /**
   * ### .sameDeepMembers(set1, set2, [message])
   *
   * Asserts that `set1` and `set2` have the same members - using a deep equality checking.
   * Order is not taken into account.
   *
   *     assert.sameDeepMembers([ {b: 3}, {a: 2}, {c: 5} ], [ {c: 5}, {b: 3}, {a: 2} ], 'same deep members');
   *
   * @name sameDeepMembers
   * @param {Array} set1
   * @param {Array} set2
   * @param {String} message
   * @api public
   */

  assert.sameDeepMembers = function (set1, set2, msg) {
    new Assertion(set1, msg).to.have.same.deep.members(set2);
  }

  /**
   * ### .includeMembers(superset, subset, [message])
   *
   * Asserts that `subset` is included in `superset`.
   * Order is not taken into account.
   *
   *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');
   *
   * @name includeMembers
   * @param {Array} superset
   * @param {Array} subset
   * @param {String} message
   * @api public
   */

  assert.includeMembers = function (superset, subset, msg) {
    new Assertion(superset, msg).to.include.members(subset);
  }

  /**
   * ### .oneOf(inList, list, [message])
   *
   * Asserts that non-object, non-array value `inList` appears in the flat array `list`.
   *
   *     assert.oneOf(1, [ 2, 1 ], 'Not found in list');
   *
   * @name oneOf
   * @param {*} inList
   * @param {Array<*>} list
   * @param {String} message
   * @api public
   */

  assert.oneOf = function (inList, list, msg) {
    new Assertion(inList, msg).to.be.oneOf(list);
  }

   /**
   * ### .changes(function, object, property)
   *
   * Asserts that a function changes the value of a property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 22 };
   *     assert.changes(fn, obj, 'val');
   *
   * @name changes
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.changes = function (fn, obj, prop) {
    new Assertion(fn).to.change(obj, prop);
  }

   /**
   * ### .doesNotChange(function, object, property)
   *
   * Asserts that a function does not changes the value of a property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { console.log('foo'); };
   *     assert.doesNotChange(fn, obj, 'val');
   *
   * @name doesNotChange
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.doesNotChange = function (fn, obj, prop) {
    new Assertion(fn).to.not.change(obj, prop);
  }

   /**
   * ### .increases(function, object, property)
   *
   * Asserts that a function increases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 13 };
   *     assert.increases(fn, obj, 'val');
   *
   * @name increases
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.increases = function (fn, obj, prop) {
    new Assertion(fn).to.increase(obj, prop);
  }

   /**
   * ### .doesNotIncrease(function, object, property)
   *
   * Asserts that a function does not increase object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 8 };
   *     assert.doesNotIncrease(fn, obj, 'val');
   *
   * @name doesNotIncrease
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.doesNotIncrease = function (fn, obj, prop) {
    new Assertion(fn).to.not.increase(obj, prop);
  }

   /**
   * ### .decreases(function, object, property)
   *
   * Asserts that a function decreases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 5 };
   *     assert.decreases(fn, obj, 'val');
   *
   * @name decreases
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.decreases = function (fn, obj, prop) {
    new Assertion(fn).to.decrease(obj, prop);
  }

   /**
   * ### .doesNotDecrease(function, object, property)
   *
   * Asserts that a function does not decreases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 15 };
   *     assert.doesNotDecrease(fn, obj, 'val');
   *
   * @name doesNotDecrease
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.doesNotDecrease = function (fn, obj, prop) {
    new Assertion(fn).to.not.decrease(obj, prop);
  }

  /*!
   * ### .ifError(object)
   *
   * Asserts if value is not a false value, and throws if it is a true value.
   * This is added to allow for chai to be a drop-in replacement for Node's
   * assert class.
   *
   *     var err = new Error('I am a custom error');
   *     assert.ifError(err); // Rethrows err!
   *
   * @name ifError
   * @param {Object} object
   * @api public
   */

  assert.ifError = function (val) {
    if (val) {
      throw(val);
    }
  };

  /**
   * ### .isExtensible(object)
   *
   * Asserts that `object` is extensible (can have new properties added to it).
   *
   *     assert.isExtensible({});
   *
   * @name isExtensible
   * @alias extensible
   * @param {Object} object
   * @param {String} message _optional_
   * @api public
   */

  assert.isExtensible = function (obj, msg) {
    new Assertion(obj, msg).to.be.extensible;
  };

  /**
   * ### .isNotExtensible(object)
   *
   * Asserts that `object` is _not_ extensible.
   *
   *     var nonExtensibleObject = Object.preventExtensions({});
   *     var sealedObject = Object.seal({});
   *     var frozenObject = Object.freese({});
   *
   *     assert.isNotExtensible(nonExtensibleObject);
   *     assert.isNotExtensible(sealedObject);
   *     assert.isNotExtensible(frozenObject);
   *
   * @name isNotExtensible
   * @alias notExtensible
   * @param {Object} object
   * @param {String} message _optional_
   * @api public
   */

  assert.isNotExtensible = function (obj, msg) {
    new Assertion(obj, msg).to.not.be.extensible;
  };

  /**
   * ### .isSealed(object)
   *
   * Asserts that `object` is sealed (cannot have new properties added to it
   * and its existing properties cannot be removed).
   *
   *     var sealedObject = Object.seal({});
   *     var frozenObject = Object.seal({});
   *
   *     assert.isSealed(sealedObject);
   *     assert.isSealed(frozenObject);
   *
   * @name isSealed
   * @alias sealed
   * @param {Object} object
   * @param {String} message _optional_
   * @api public
   */

  assert.isSealed = function (obj, msg) {
    new Assertion(obj, msg).to.be.sealed;
  };

  /**
   * ### .isNotSealed(object)
   *
   * Asserts that `object` is _not_ sealed.
   *
   *     assert.isNotSealed({});
   *
   * @name isNotSealed
   * @alias notSealed
   * @param {Object} object
   * @param {String} message _optional_
   * @api public
   */

  assert.isNotSealed = function (obj, msg) {
    new Assertion(obj, msg).to.not.be.sealed;
  };

  /**
   * ### .isFrozen(object)
   *
   * Asserts that `object` is frozen (cannot have new properties added to it
   * and its existing properties cannot be modified).
   *
   *     var frozenObject = Object.freeze({});
   *     assert.frozen(frozenObject);
   *
   * @name isFrozen
   * @alias frozen
   * @param {Object} object
   * @param {String} message _optional_
   * @api public
   */

  assert.isFrozen = function (obj, msg) {
    new Assertion(obj, msg).to.be.frozen;
  };

  /**
   * ### .isNotFrozen(object)
   *
   * Asserts that `object` is _not_ frozen.
   *
   *     assert.isNotFrozen({});
   *
   * @name isNotFrozen
   * @alias notFrozen
   * @param {Object} object
   * @param {String} message _optional_
   * @api public
   */

  assert.isNotFrozen = function (obj, msg) {
    new Assertion(obj, msg).to.not.be.frozen;
  };

  /*!
   * Aliases.
   */

  (function alias(name, as){
    assert[as] = assert[name];
    return alias;
  })
  ('isOk', 'ok')
  ('isNotOk', 'notOk')
  ('throws', 'throw')
  ('throws', 'Throw')
  ('isExtensible', 'extensible')
  ('isNotExtensible', 'notExtensible')
  ('isSealed', 'sealed')
  ('isNotSealed', 'notSealed')
  ('isFrozen', 'frozen')
  ('isNotFrozen', 'notFrozen');
};

},{}],10:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  chai.expect = function (val, message) {
    return new chai.Assertion(val, message);
  };

  /**
   * ### .fail(actual, expected, [message], [operator])
   *
   * Throw a failure.
   *
   * @name fail
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @param {String} operator
   * @api public
   */

  chai.expect.fail = function (actual, expected, message, operator) {
    message = message || 'expect.fail()';
    throw new chai.AssertionError(message, {
        actual: actual
      , expected: expected
      , operator: operator
    }, chai.expect.fail);
  };
};

},{}],11:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  var Assertion = chai.Assertion;

  function loadShould () {
    // explicitly define this method as function as to have it's name to include as `ssfi`
    function shouldGetter() {
      if (this instanceof String || this instanceof Number || this instanceof Boolean ) {
        return new Assertion(this.valueOf(), null, shouldGetter);
      }
      return new Assertion(this, null, shouldGetter);
    }
    function shouldSetter(value) {
      // See https://github.com/chaijs/chai/issues/86: this makes
      // `whatever.should = someValue` actually set `someValue`, which is
      // especially useful for `global.should = require('chai').should()`.
      //
      // Note that we have to use [[DefineProperty]] instead of [[Put]]
      // since otherwise we would trigger this very setter!
      Object.defineProperty(this, 'should', {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
    // modify Object.prototype to have `should`
    Object.defineProperty(Object.prototype, 'should', {
      set: shouldSetter
      , get: shouldGetter
      , configurable: true
    });

    var should = {};

    /**
     * ### .fail(actual, expected, [message], [operator])
     *
     * Throw a failure.
     *
     * @name fail
     * @param {Mixed} actual
     * @param {Mixed} expected
     * @param {String} message
     * @param {String} operator
     * @api public
     */

    should.fail = function (actual, expected, message, operator) {
      message = message || 'should.fail()';
      throw new chai.AssertionError(message, {
          actual: actual
        , expected: expected
        , operator: operator
      }, should.fail);
    };

    should.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.equal(val2);
    };

    should.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.Throw(errt, errs);
    };

    should.exist = function (val, msg) {
      new Assertion(val, msg).to.exist;
    }

    // negation
    should.not = {}

    should.not.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.not.equal(val2);
    };

    should.not.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.not.Throw(errt, errs);
    };

    should.not.exist = function (val, msg) {
      new Assertion(val, msg).to.not.exist;
    }

    should['throw'] = should['Throw'];
    should.not['throw'] = should.not['Throw'];

    return should;
  };

  chai.should = loadShould;
  chai.Should = loadShould;
};

},{}],12:[function(require,module,exports){
/*!
 * Chai - addChainingMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var transferFlags = require('./transferFlags');
var flag = require('./flag');
var config = require('../config');

/*!
 * Module variables
 */

// Check whether `__proto__` is supported
var hasProtoSupport = '__proto__' in Object;

// Without `__proto__` support, this module will need to add properties to a function.
// However, some Function.prototype methods cannot be overwritten,
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).
var excludeNames = /^(?:length|name|arguments|caller)$/;

// Cache `Function` properties
var call  = Function.prototype.call,
    apply = Function.prototype.apply;

/**
 * ### addChainableMethod (ctx, name, method, chainingBehavior)
 *
 * Adds a method to an object, such that the method can also be chained.
 *
 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);
 *
 * The result can then be used as both a method assertion, executing both `method` and
 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.
 *
 *     expect(fooStr).to.be.foo('bar');
 *     expect(fooStr).to.be.foo.equal('foo');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for `name`, when called
 * @param {Function} chainingBehavior function to be called every time the property is accessed
 * @name addChainableMethod
 * @api public
 */

module.exports = function (ctx, name, method, chainingBehavior) {
  if (typeof chainingBehavior !== 'function') {
    chainingBehavior = function () { };
  }

  var chainableBehavior = {
      method: method
    , chainingBehavior: chainingBehavior
  };

  // save the methods so we can overwrite them later, if we need to.
  if (!ctx.__methods) {
    ctx.__methods = {};
  }
  ctx.__methods[name] = chainableBehavior;

  Object.defineProperty(ctx, name,
    { get: function () {
        chainableBehavior.chainingBehavior.call(this);

        var assert = function assert() {
          var old_ssfi = flag(this, 'ssfi');
          if (old_ssfi && config.includeStack === false)
            flag(this, 'ssfi', assert);
          var result = chainableBehavior.method.apply(this, arguments);
          return result === undefined ? this : result;
        };

        // Use `__proto__` if available
        if (hasProtoSupport) {
          // Inherit all properties from the object by replacing the `Function` prototype
          var prototype = assert.__proto__ = Object.create(this);
          // Restore the `call` and `apply` methods from `Function`
          prototype.call = call;
          prototype.apply = apply;
        }
        // Otherwise, redefine all properties (slow!)
        else {
          var asserterNames = Object.getOwnPropertyNames(ctx);
          asserterNames.forEach(function (asserterName) {
            if (!excludeNames.test(asserterName)) {
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
              Object.defineProperty(assert, asserterName, pd);
            }
          });
        }

        transferFlags(this, assert);
        return assert;
      }
    , configurable: true
  });
};

},{"../config":7,"./flag":16,"./transferFlags":32}],13:[function(require,module,exports){
/*!
 * Chai - addMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var config = require('../config');

/**
 * ### .addMethod (ctx, name, method)
 *
 * Adds a method to the prototype of an object.
 *
 *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(fooStr).to.be.foo('bar');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for name
 * @name addMethod
 * @api public
 */
var flag = require('./flag');

module.exports = function (ctx, name, method) {
  ctx[name] = function () {
    var old_ssfi = flag(this, 'ssfi');
    if (old_ssfi && config.includeStack === false)
      flag(this, 'ssfi', ctx[name]);
    var result = method.apply(this, arguments);
    return result === undefined ? this : result;
  };
};

},{"../config":7,"./flag":16}],14:[function(require,module,exports){
/*!
 * Chai - addProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var config = require('../config');
var flag = require('./flag');

/**
 * ### addProperty (ctx, name, getter)
 *
 * Adds a property to the prototype of an object.
 *
 *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.instanceof(Foo);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.foo;
 *
 * @param {Object} ctx object to which the property is added
 * @param {String} name of property to add
 * @param {Function} getter function to be used for name
 * @name addProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  Object.defineProperty(ctx, name,
    { get: function addProperty() {
        var old_ssfi = flag(this, 'ssfi');
        if (old_ssfi && config.includeStack === false)
          flag(this, 'ssfi', addProperty);

        var result = getter.call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

},{"../config":7,"./flag":16}],15:[function(require,module,exports){
/*!
 * Chai - expectTypes utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### expectTypes(obj, types)
 *
 * Ensures that the object being tested against is of a valid type.
 *
 *     utils.expectTypes(this, ['array', 'object', 'string']);
 *
 * @param {Mixed} obj constructed Assertion
 * @param {Array} type A list of allowed types for this assertion
 * @name expectTypes
 * @api public
 */

var AssertionError = require('assertion-error');
var flag = require('./flag');
var type = require('type-detect');

module.exports = function (obj, types) {
  var obj = flag(obj, 'object');
  types = types.map(function (t) { return t.toLowerCase(); });
  types.sort();

  // Transforms ['lorem', 'ipsum'] into 'a lirum, or an ipsum'
  var str = types.map(function (t, index) {
    var art = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(t.charAt(0)) ? 'an' : 'a';
    var or = types.length > 1 && index === types.length - 1 ? 'or ' : '';
    return or + art + ' ' + t;
  }).join(', ');

  if (!types.some(function (expected) { return type(obj) === expected; })) {
    throw new AssertionError(
      'object tested must be ' + str + ', but ' + type(obj) + ' given'
    );
  }
};

},{"./flag":16,"assertion-error":1,"type-detect":41}],16:[function(require,module,exports){
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### flag(object, key, [value])
 *
 * Get or set a flag value on an object. If a
 * value is provided it will be set, else it will
 * return the currently set value or `undefined` if
 * the value is not set.
 *
 *     utils.flag(this, 'foo', 'bar'); // setter
 *     utils.flag(this, 'foo'); // getter, returns `bar`
 *
 * @param {Object} object constructed Assertion
 * @param {String} key
 * @param {Mixed} value (optional)
 * @name flag
 * @api private
 */

module.exports = function (obj, key, value) {
  var flags = obj.__flags || (obj.__flags = Object.create(null));
  if (arguments.length === 3) {
    flags[key] = value;
  } else {
    return flags[key];
  }
};

},{}],17:[function(require,module,exports){
/*!
 * Chai - getActual utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getActual(object, [actual])
 *
 * Returns the `actual` value for an Assertion
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 */

module.exports = function (obj, args) {
  return args.length > 4 ? args[4] : obj._obj;
};

},{}],18:[function(require,module,exports){
/*!
 * Chai - getEnumerableProperties utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getEnumerableProperties(object)
 *
 * This allows the retrieval of enumerable property names of an object,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @name getEnumerableProperties
 * @api public
 */

module.exports = function getEnumerableProperties(object) {
  var result = [];
  for (var name in object) {
    result.push(name);
  }
  return result;
};

},{}],19:[function(require,module,exports){
/*!
 * Chai - message composition utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('./flag')
  , getActual = require('./getActual')
  , inspect = require('./inspect')
  , objDisplay = require('./objDisplay');

/**
 * ### .getMessage(object, message, negateMessage)
 *
 * Construct the error message based on flags
 * and template tags. Template tags will return
 * a stringified inspection of the object referenced.
 *
 * Message template tags:
 * - `#{this}` current asserted object
 * - `#{act}` actual value
 * - `#{exp}` expected value
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 * @name getMessage
 * @api public
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , val = flag(obj, 'object')
    , expected = args[3]
    , actual = getActual(obj, args)
    , msg = negate ? args[2] : args[1]
    , flagMsg = flag(obj, 'message');

  if(typeof msg === "function") msg = msg();
  msg = msg || '';
  msg = msg
    .replace(/#{this}/g, objDisplay(val))
    .replace(/#{act}/g, objDisplay(actual))
    .replace(/#{exp}/g, objDisplay(expected));

  return flagMsg ? flagMsg + ': ' + msg : msg;
};

},{"./flag":16,"./getActual":17,"./inspect":26,"./objDisplay":27}],20:[function(require,module,exports){
/*!
 * Chai - getName utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getName(func)
 *
 * Gets the name of a function, in a cross-browser way.
 *
 * @param {Function} a function (usually a constructor)
 */

module.exports = function (func) {
  if (func.name) return func.name;

  var match = /^\s?function ([^(]*)\(/.exec(func);
  return match && match[1] ? match[1] : "";
};

},{}],21:[function(require,module,exports){
/*!
 * Chai - getPathInfo utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var hasProperty = require('./hasProperty');

/**
 * ### .getPathInfo(path, object)
 *
 * This allows the retrieval of property info in an
 * object given a string path.
 *
 * The path info consists of an object with the
 * following properties:
 *
 * * parent - The parent object of the property referenced by `path`
 * * name - The name of the final property, a number if it was an array indexer
 * * value - The value of the property, if it exists, otherwise `undefined`
 * * exists - Whether the property exists or not
 *
 * @param {String} path
 * @param {Object} object
 * @returns {Object} info
 * @name getPathInfo
 * @api public
 */

module.exports = function getPathInfo(path, obj) {
  var parsed = parsePath(path),
      last = parsed[parsed.length - 1];

  var info = {
    parent: parsed.length > 1 ? _getPathValue(parsed, obj, parsed.length - 1) : obj,
    name: last.p || last.i,
    value: _getPathValue(parsed, obj)
  };
  info.exists = hasProperty(info.name, info.parent);

  return info;
};


/*!
 * ## parsePath(path)
 *
 * Helper function used to parse string object
 * paths. Use in conjunction with `_getPathValue`.
 *
 *      var parsed = parsePath('myobject.property.subprop');
 *
 * ### Paths:
 *
 * * Can be as near infinitely deep and nested
 * * Arrays are also valid using the formal `myobject.document[3].property`.
 * * Literal dots and brackets (not delimiter) must be backslash-escaped.
 *
 * @param {String} path
 * @returns {Object} parsed
 * @api private
 */

function parsePath (path) {
  var str = path.replace(/([^\\])\[/g, '$1.[')
    , parts = str.match(/(\\\.|[^.]+?)+/g);
  return parts.map(function (value) {
    var re = /^\[(\d+)\]$/
      , mArr = re.exec(value);
    if (mArr) return { i: parseFloat(mArr[1]) };
    else return { p: value.replace(/\\([.\[\]])/g, '$1') };
  });
}


/*!
 * ## _getPathValue(parsed, obj)
 *
 * Helper companion function for `.parsePath` that returns
 * the value located at the parsed address.
 *
 *      var value = getPathValue(parsed, obj);
 *
 * @param {Object} parsed definition from `parsePath`.
 * @param {Object} object to search against
 * @param {Number} object to search against
 * @returns {Object|Undefined} value
 * @api private
 */

function _getPathValue (parsed, obj, index) {
  var tmp = obj
    , res;

  index = (index === undefined ? parsed.length : index);

  for (var i = 0, l = index; i < l; i++) {
    var part = parsed[i];
    if (tmp) {
      if ('undefined' !== typeof part.p)
        tmp = tmp[part.p];
      else if ('undefined' !== typeof part.i)
        tmp = tmp[part.i];
      if (i == (l - 1)) res = tmp;
    } else {
      res = undefined;
    }
  }
  return res;
}

},{"./hasProperty":24}],22:[function(require,module,exports){
/*!
 * Chai - getPathValue utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * @see https://github.com/logicalparadox/filtr
 * MIT Licensed
 */

var getPathInfo = require('./getPathInfo');

/**
 * ### .getPathValue(path, object)
 *
 * This allows the retrieval of values in an
 * object given a string path.
 *
 *     var obj = {
 *         prop1: {
 *             arr: ['a', 'b', 'c']
 *           , str: 'Hello'
 *         }
 *       , prop2: {
 *             arr: [ { nested: 'Universe' } ]
 *           , str: 'Hello again!'
 *         }
 *     }
 *
 * The following would be the results.
 *
 *     getPathValue('prop1.str', obj); // Hello
 *     getPathValue('prop1.att[2]', obj); // b
 *     getPathValue('prop2.arr[0].nested', obj); // Universe
 *
 * @param {String} path
 * @param {Object} object
 * @returns {Object} value or `undefined`
 * @name getPathValue
 * @api public
 */
module.exports = function(path, obj) {
  var info = getPathInfo(path, obj);
  return info.value;
}; 

},{"./getPathInfo":21}],23:[function(require,module,exports){
/*!
 * Chai - getProperties utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getProperties(object)
 *
 * This allows the retrieval of property names of an object, enumerable or not,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @name getProperties
 * @api public
 */

module.exports = function getProperties(object) {
  var result = Object.getOwnPropertyNames(object);

  function addProperty(property) {
    if (result.indexOf(property) === -1) {
      result.push(property);
    }
  }

  var proto = Object.getPrototypeOf(object);
  while (proto !== null) {
    Object.getOwnPropertyNames(proto).forEach(addProperty);
    proto = Object.getPrototypeOf(proto);
  }

  return result;
};

},{}],24:[function(require,module,exports){
/*!
 * Chai - hasProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var type = require('type-detect');

/**
 * ### .hasProperty(object, name)
 *
 * This allows checking whether an object has
 * named property or numeric array index.
 *
 * Basically does the same thing as the `in`
 * operator but works properly with natives
 * and null/undefined values.
 *
 *     var obj = {
 *         arr: ['a', 'b', 'c']
 *       , str: 'Hello'
 *     }
 *
 * The following would be the results.
 *
 *     hasProperty('str', obj);  // true
 *     hasProperty('constructor', obj);  // true
 *     hasProperty('bar', obj);  // false
 *     
 *     hasProperty('length', obj.str); // true
 *     hasProperty(1, obj.str);  // true
 *     hasProperty(5, obj.str);  // false
 *
 *     hasProperty('length', obj.arr);  // true
 *     hasProperty(2, obj.arr);  // true
 *     hasProperty(3, obj.arr);  // false
 *
 * @param {Objuect} object
 * @param {String|Number} name
 * @returns {Boolean} whether it exists
 * @name getPathInfo
 * @api public
 */

var literals = {
    'number': Number
  , 'string': String
};

module.exports = function hasProperty(name, obj) {
  var ot = type(obj);

  // Bad Object, obviously no props at all
  if(ot === 'null' || ot === 'undefined')
    return false;

  // The `in` operator does not work with certain literals
  // box these before the check
  if(literals[ot] && typeof obj !== 'object')
    obj = new literals[ot](obj);

  return name in obj;
};

},{"type-detect":41}],25:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Main exports
 */

var exports = module.exports = {};

/*!
 * test utility
 */

exports.test = require('./test');

/*!
 * type utility
 */

exports.type = require('type-detect');

/*!
 * expectTypes utility
 */
exports.expectTypes = require('./expectTypes');

/*!
 * message utility
 */

exports.getMessage = require('./getMessage');

/*!
 * actual utility
 */

exports.getActual = require('./getActual');

/*!
 * Inspect util
 */

exports.inspect = require('./inspect');

/*!
 * Object Display util
 */

exports.objDisplay = require('./objDisplay');

/*!
 * Flag utility
 */

exports.flag = require('./flag');

/*!
 * Flag transferring utility
 */

exports.transferFlags = require('./transferFlags');

/*!
 * Deep equal utility
 */

exports.eql = require('deep-eql');

/*!
 * Deep path value
 */

exports.getPathValue = require('./getPathValue');

/*!
 * Deep path info
 */

exports.getPathInfo = require('./getPathInfo');

/*!
 * Check if a property exists
 */

exports.hasProperty = require('./hasProperty');

/*!
 * Function name
 */

exports.getName = require('./getName');

/*!
 * add Property
 */

exports.addProperty = require('./addProperty');

/*!
 * add Method
 */

exports.addMethod = require('./addMethod');

/*!
 * overwrite Property
 */

exports.overwriteProperty = require('./overwriteProperty');

/*!
 * overwrite Method
 */

exports.overwriteMethod = require('./overwriteMethod');

/*!
 * Add a chainable method
 */

exports.addChainableMethod = require('./addChainableMethod');

/*!
 * Overwrite chainable method
 */

exports.overwriteChainableMethod = require('./overwriteChainableMethod');

},{"./addChainableMethod":12,"./addMethod":13,"./addProperty":14,"./expectTypes":15,"./flag":16,"./getActual":17,"./getMessage":19,"./getName":20,"./getPathInfo":21,"./getPathValue":22,"./hasProperty":24,"./inspect":26,"./objDisplay":27,"./overwriteChainableMethod":28,"./overwriteMethod":29,"./overwriteProperty":30,"./test":31,"./transferFlags":32,"deep-eql":33,"type-detect":41}],26:[function(require,module,exports){
// This is (almost) directly from Node.js utils
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js

var getName = require('./getName');
var getProperties = require('./getProperties');
var getEnumerableProperties = require('./getEnumerableProperties');

module.exports = inspect;

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
 *    properties of objects.
 * @param {Number} depth Depth in which to descend in object. Default is 2.
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
 *    output. Default is false (no coloring).
 */
function inspect(obj, showHidden, depth, colors) {
  var ctx = {
    showHidden: showHidden,
    seen: [],
    stylize: function (str) { return str; }
  };
  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));
}

// Returns true if object is a DOM element.
var isDOMElement = function (object) {
  if (typeof HTMLElement === 'object') {
    return object instanceof HTMLElement;
  } else {
    return object &&
      typeof object === 'object' &&
      object.nodeType === 1 &&
      typeof object.nodeName === 'string';
  }
};

function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (value && typeof value.inspect === 'function' &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (typeof ret !== 'string') {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // If this is a DOM element, try to get the outer HTML.
  if (isDOMElement(value)) {
    if ('outerHTML' in value) {
      return value.outerHTML;
      // This value does not have an outerHTML attribute,
      //   it could still be an XML element
    } else {
      // Attempt to serialize it
      try {
        if (document.xmlVersion) {
          var xmlSerializer = new XMLSerializer();
          return xmlSerializer.serializeToString(value);
        } else {
          // Firefox 11- do not support outerHTML
          //   It does, however, support innerHTML
          //   Use the following to render the element
          var ns = "http://www.w3.org/1999/xhtml";
          var container = document.createElementNS(ns, '_');

          container.appendChild(value.cloneNode(false));
          html = container.innerHTML
            .replace('><', '>' + value.innerHTML + '<');
          container.innerHTML = '';
          return html;
        }
      } catch (err) {
        // This could be a non-native DOM implementation,
        //   continue with the normal flow:
        //   printing the element as if it is an object.
      }
    }
  }

  // Look up the keys of the object.
  var visibleKeys = getEnumerableProperties(value);
  var keys = ctx.showHidden ? getProperties(value) : visibleKeys;

  // Some type of object without properties can be shortcutted.
  // In IE, errors have a single `stack` property, or if they are vanilla `Error`,
  // a `stack` plus `description` property; ignore those for consistency.
  if (keys.length === 0 || (isError(value) && (
      (keys.length === 1 && keys[0] === 'stack') ||
      (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')
     ))) {
    if (typeof value === 'function') {
      var name = getName(value);
      var nameSuffix = name ? ': ' + name : '';
      return ctx.stylize('[Function' + nameSuffix + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (typeof value === 'function') {
    var name = getName(value);
    var nameSuffix = name ? ': ' + name : '';
    base = ' [Function' + nameSuffix + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    return formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  switch (typeof value) {
    case 'undefined':
      return ctx.stylize('undefined', 'undefined');

    case 'string':
      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                               .replace(/'/g, "\\'")
                                               .replace(/\\"/g, '"') + '\'';
      return ctx.stylize(simple, 'string');

    case 'number':
      if (value === 0 && (1/value) === -Infinity) {
        return ctx.stylize('-0', 'number');
      }
      return ctx.stylize('' + value, 'number');

    case 'boolean':
      return ctx.stylize('' + value, 'boolean');
  }
  // For some reason typeof null is "object", so special case here.
  if (value === null) {
    return ctx.stylize('null', 'null');
  }
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (Object.prototype.hasOwnProperty.call(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str;
  if (value.__lookupGetter__) {
    if (value.__lookupGetter__(key)) {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Getter/Setter]', 'special');
      } else {
        str = ctx.stylize('[Getter]', 'special');
      }
    } else {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Setter]', 'special');
      }
    }
  }
  if (visibleKeys.indexOf(key) < 0) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(value[key]) < 0) {
      if (recurseTimes === null) {
        str = formatValue(ctx, value[key], null);
      } else {
        str = formatValue(ctx, value[key], recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (typeof name === 'undefined') {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

function isArray(ar) {
  return Array.isArray(ar) ||
         (typeof ar === 'object' && objectToString(ar) === '[object Array]');
}

function isRegExp(re) {
  return typeof re === 'object' && objectToString(re) === '[object RegExp]';
}

function isDate(d) {
  return typeof d === 'object' && objectToString(d) === '[object Date]';
}

function isError(e) {
  return typeof e === 'object' && objectToString(e) === '[object Error]';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

},{"./getEnumerableProperties":18,"./getName":20,"./getProperties":23}],27:[function(require,module,exports){
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var inspect = require('./inspect');
var config = require('../config');

/**
 * ### .objDisplay (object)
 *
 * Determines if an object or an array matches
 * criteria to be inspected in-line for error
 * messages or should be truncated.
 *
 * @param {Mixed} javascript object to inspect
 * @name objDisplay
 * @api public
 */

module.exports = function (obj) {
  var str = inspect(obj)
    , type = Object.prototype.toString.call(obj);

  if (config.truncateThreshold && str.length >= config.truncateThreshold) {
    if (type === '[object Function]') {
      return !obj.name || obj.name === ''
        ? '[Function]'
        : '[Function: ' + obj.name + ']';
    } else if (type === '[object Array]') {
      return '[ Array(' + obj.length + ') ]';
    } else if (type === '[object Object]') {
      var keys = Object.keys(obj)
        , kstr = keys.length > 2
          ? keys.splice(0, 2).join(', ') + ', ...'
          : keys.join(', ');
      return '{ Object (' + kstr + ') }';
    } else {
      return str;
    }
  } else {
    return str;
  }
};

},{"../config":7,"./inspect":26}],28:[function(require,module,exports){
/*!
 * Chai - overwriteChainableMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteChainableMethod (ctx, name, method, chainingBehavior)
 *
 * Overwites an already existing chainable method
 * and provides access to the previous function or
 * property.  Must return functions to be used for
 * name.
 *
 *     utils.overwriteChainableMethod(chai.Assertion.prototype, 'length',
 *       function (_super) {
 *       }
 *     , function (_super) {
 *       }
 *     );
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteChainableMethod('foo', fn, fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.have.length(3);
 *     expect(myFoo).to.have.length.above(3);
 *
 * @param {Object} ctx object whose method / property is to be overwritten
 * @param {String} name of method / property to overwrite
 * @param {Function} method function that returns a function to be used for name
 * @param {Function} chainingBehavior function that returns a function to be used for property
 * @name overwriteChainableMethod
 * @api public
 */

module.exports = function (ctx, name, method, chainingBehavior) {
  var chainableBehavior = ctx.__methods[name];

  var _chainingBehavior = chainableBehavior.chainingBehavior;
  chainableBehavior.chainingBehavior = function () {
    var result = chainingBehavior(_chainingBehavior).call(this);
    return result === undefined ? this : result;
  };

  var _method = chainableBehavior.method;
  chainableBehavior.method = function () {
    var result = method(_method).apply(this, arguments);
    return result === undefined ? this : result;
  };
};

},{}],29:[function(require,module,exports){
/*!
 * Chai - overwriteMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteMethod (ctx, name, fn)
 *
 * Overwites an already existing method and provides
 * access to previous function. Must return function
 * to be used for name.
 *
 *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {
 *       return function (str) {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.value).to.equal(str);
 *         } else {
 *           _super.apply(this, arguments);
 *         }
 *       }
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.equal('bar');
 *
 * @param {Object} ctx object whose method is to be overwritten
 * @param {String} name of method to overwrite
 * @param {Function} method function that returns a function to be used for name
 * @name overwriteMethod
 * @api public
 */

module.exports = function (ctx, name, method) {
  var _method = ctx[name]
    , _super = function () { return this; };

  if (_method && 'function' === typeof _method)
    _super = _method;

  ctx[name] = function () {
    var result = method(_super).apply(this, arguments);
    return result === undefined ? this : result;
  }
};

},{}],30:[function(require,module,exports){
/*!
 * Chai - overwriteProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteProperty (ctx, name, fn)
 *
 * Overwites an already existing property getter and provides
 * access to previous value. Must return function to use as getter.
 *
 *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {
 *       return function () {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.name).to.equal('bar');
 *         } else {
 *           _super.call(this);
 *         }
 *       }
 *     });
 *
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.ok;
 *
 * @param {Object} ctx object whose property is to be overwritten
 * @param {String} name of property to overwrite
 * @param {Function} getter function that returns a getter function to be used for name
 * @name overwriteProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  var _get = Object.getOwnPropertyDescriptor(ctx, name)
    , _super = function () {};

  if (_get && 'function' === typeof _get.get)
    _super = _get.get

  Object.defineProperty(ctx, name,
    { get: function () {
        var result = getter(_super).call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

},{}],31:[function(require,module,exports){
/*!
 * Chai - test utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('./flag');

/**
 * # test(object, expression)
 *
 * Test and object for expression.
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , expr = args[0];
  return negate ? !expr : expr;
};

},{"./flag":16}],32:[function(require,module,exports){
/*!
 * Chai - transferFlags utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### transferFlags(assertion, object, includeAll = true)
 *
 * Transfer all the flags for `assertion` to `object`. If
 * `includeAll` is set to `false`, then the base Chai
 * assertion flags (namely `object`, `ssfi`, and `message`)
 * will not be transferred.
 *
 *
 *     var newAssertion = new Assertion();
 *     utils.transferFlags(assertion, newAssertion);
 *
 *     var anotherAsseriton = new Assertion(myObj);
 *     utils.transferFlags(assertion, anotherAssertion, false);
 *
 * @param {Assertion} assertion the assertion to transfer the flags from
 * @param {Object} object the object to transfer the flags to; usually a new assertion
 * @param {Boolean} includeAll
 * @name transferFlags
 * @api private
 */

module.exports = function (assertion, object, includeAll) {
  var flags = assertion.__flags || (assertion.__flags = Object.create(null));

  if (!object.__flags) {
    object.__flags = Object.create(null);
  }

  includeAll = arguments.length === 3 ? includeAll : true;

  for (var flag in flags) {
    if (includeAll ||
        (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {
      object.__flags[flag] = flags[flag];
    }
  }
};

},{}],33:[function(require,module,exports){
module.exports = require('./lib/eql');

},{"./lib/eql":34}],34:[function(require,module,exports){
/*!
 * deep-eql
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var type = require('type-detect');

/*!
 * Buffer.isBuffer browser shim
 */

var Buffer;
try { Buffer = require('buffer').Buffer; }
catch(ex) {
  Buffer = {};
  Buffer.isBuffer = function() { return false; }
}

/*!
 * Primary Export
 */

module.exports = deepEqual;

/**
 * Assert super-strict (egal) equality between
 * two objects of any type.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @param {Array} memoised (optional)
 * @return {Boolean} equal match
 */

function deepEqual(a, b, m) {
  if (sameValue(a, b)) {
    return true;
  } else if ('date' === type(a)) {
    return dateEqual(a, b);
  } else if ('regexp' === type(a)) {
    return regexpEqual(a, b);
  } else if (Buffer.isBuffer(a)) {
    return bufferEqual(a, b);
  } else if ('arguments' === type(a)) {
    return argumentsEqual(a, b, m);
  } else if (!typeEqual(a, b)) {
    return false;
  } else if (('object' !== type(a) && 'object' !== type(b))
  && ('array' !== type(a) && 'array' !== type(b))) {
    return sameValue(a, b);
  } else {
    return objectEqual(a, b, m);
  }
}

/*!
 * Strict (egal) equality test. Ensures that NaN always
 * equals NaN and `-0` does not equal `+0`.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} equal match
 */

function sameValue(a, b) {
  if (a === b) return a !== 0 || 1 / a === 1 / b;
  return a !== a && b !== b;
}

/*!
 * Compare the types of two given objects and
 * return if they are equal. Note that an Array
 * has a type of `array` (not `object`) and arguments
 * have a type of `arguments` (not `array`/`object`).
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function typeEqual(a, b) {
  return type(a) === type(b);
}

/*!
 * Compare two Date objects by asserting that
 * the time values are equal using `saveValue`.
 *
 * @param {Date} a
 * @param {Date} b
 * @return {Boolean} result
 */

function dateEqual(a, b) {
  if ('date' !== type(b)) return false;
  return sameValue(a.getTime(), b.getTime());
}

/*!
 * Compare two regular expressions by converting them
 * to string and checking for `sameValue`.
 *
 * @param {RegExp} a
 * @param {RegExp} b
 * @return {Boolean} result
 */

function regexpEqual(a, b) {
  if ('regexp' !== type(b)) return false;
  return sameValue(a.toString(), b.toString());
}

/*!
 * Assert deep equality of two `arguments` objects.
 * Unfortunately, these must be sliced to arrays
 * prior to test to ensure no bad behavior.
 *
 * @param {Arguments} a
 * @param {Arguments} b
 * @param {Array} memoize (optional)
 * @return {Boolean} result
 */

function argumentsEqual(a, b, m) {
  if ('arguments' !== type(b)) return false;
  a = [].slice.call(a);
  b = [].slice.call(b);
  return deepEqual(a, b, m);
}

/*!
 * Get enumerable properties of a given object.
 *
 * @param {Object} a
 * @return {Array} property names
 */

function enumerable(a) {
  var res = [];
  for (var key in a) res.push(key);
  return res;
}

/*!
 * Simple equality for flat iterable objects
 * such as Arrays or Node.js buffers.
 *
 * @param {Iterable} a
 * @param {Iterable} b
 * @return {Boolean} result
 */

function iterableEqual(a, b) {
  if (a.length !==  b.length) return false;

  var i = 0;
  var match = true;

  for (; i < a.length; i++) {
    if (a[i] !== b[i]) {
      match = false;
      break;
    }
  }

  return match;
}

/*!
 * Extension to `iterableEqual` specifically
 * for Node.js Buffers.
 *
 * @param {Buffer} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function bufferEqual(a, b) {
  if (!Buffer.isBuffer(b)) return false;
  return iterableEqual(a, b);
}

/*!
 * Block for `objectEqual` ensuring non-existing
 * values don't get in.
 *
 * @param {Mixed} object
 * @return {Boolean} result
 */

function isValue(a) {
  return a !== null && a !== undefined;
}

/*!
 * Recursively check the equality of two objects.
 * Once basic sameness has been established it will
 * defer to `deepEqual` for each enumerable key
 * in the object.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function objectEqual(a, b, m) {
  if (!isValue(a) || !isValue(b)) {
    return false;
  }

  if (a.prototype !== b.prototype) {
    return false;
  }

  var i;
  if (m) {
    for (i = 0; i < m.length; i++) {
      if ((m[i][0] === a && m[i][1] === b)
      ||  (m[i][0] === b && m[i][1] === a)) {
        return true;
      }
    }
  } else {
    m = [];
  }

  try {
    var ka = enumerable(a);
    var kb = enumerable(b);
  } catch (ex) {
    return false;
  }

  ka.sort();
  kb.sort();

  if (!iterableEqual(ka, kb)) {
    return false;
  }

  m.push([ a, b ]);

  var key;
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], m)) {
      return false;
    }
  }

  return true;
}

},{"buffer":3,"type-detect":35}],35:[function(require,module,exports){
module.exports = require('./lib/type');

},{"./lib/type":36}],36:[function(require,module,exports){
/*!
 * type-detect
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Primary Exports
 */

var exports = module.exports = getType;

/*!
 * Detectable javascript natives
 */

var natives = {
    '[object Array]': 'array'
  , '[object RegExp]': 'regexp'
  , '[object Function]': 'function'
  , '[object Arguments]': 'arguments'
  , '[object Date]': 'date'
};

/**
 * ### typeOf (obj)
 *
 * Use several different techniques to determine
 * the type of object being tested.
 *
 *
 * @param {Mixed} object
 * @return {String} object type
 * @api public
 */

function getType (obj) {
  var str = Object.prototype.toString.call(obj);
  if (natives[str]) return natives[str];
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (obj === Object(obj)) return 'object';
  return typeof obj;
}

exports.Library = Library;

/**
 * ### Library
 *
 * Create a repository for custom type detection.
 *
 * ```js
 * var lib = new type.Library;
 * ```
 *
 */

function Library () {
  this.tests = {};
}

/**
 * #### .of (obj)
 *
 * Expose replacement `typeof` detection to the library.
 *
 * ```js
 * if ('string' === lib.of('hello world')) {
 *   // ...
 * }
 * ```
 *
 * @param {Mixed} object to test
 * @return {String} type
 */

Library.prototype.of = getType;

/**
 * #### .define (type, test)
 *
 * Add a test to for the `.test()` assertion.
 *
 * Can be defined as a regular expression:
 *
 * ```js
 * lib.define('int', /^[0-9]+$/);
 * ```
 *
 * ... or as a function:
 *
 * ```js
 * lib.define('bln', function (obj) {
 *   if ('boolean' === lib.of(obj)) return true;
 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];
 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();
 *   return !! ~blns.indexOf(obj);
 * });
 * ```
 *
 * @param {String} type
 * @param {RegExp|Function} test
 * @api public
 */

Library.prototype.define = function (type, test) {
  if (arguments.length === 1) return this.tests[type];
  this.tests[type] = test;
  return this;
};

/**
 * #### .test (obj, test)
 *
 * Assert that an object is of type. Will first
 * check natives, and if that does not pass it will
 * use the user defined custom tests.
 *
 * ```js
 * assert(lib.test('1', 'int'));
 * assert(lib.test('yes', 'bln'));
 * ```
 *
 * @param {Mixed} object
 * @param {String} type
 * @return {Boolean} result
 * @api public
 */

Library.prototype.test = function (obj, type) {
  if (type === getType(obj)) return true;
  var test = this.tests[type];

  if (test && 'regexp' === getType(test)) {
    return test.test(obj);
  } else if (test && 'function' === getType(test)) {
    return test(obj);
  } else {
    throw new ReferenceError('Type test "' + type + '" not defined or invalid.');
  }
};

},{}],37:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],38:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],39:[function(require,module,exports){
/*
 * A noop version in case your tests are browserified (eg, when using
 * testling).
 */

module.exports = function () {}

},{}],40:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],41:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"./lib/type":42,"dup":35}],42:[function(require,module,exports){
/*!
 * type-detect
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Primary Exports
 */

var exports = module.exports = getType;

/**
 * ### typeOf (obj)
 *
 * Use several different techniques to determine
 * the type of object being tested.
 *
 *
 * @param {Mixed} object
 * @return {String} object type
 * @api public
 */
var objectTypeRegexp = /^\[object (.*)\]$/;

function getType(obj) {
  var type = Object.prototype.toString.call(obj).match(objectTypeRegexp)[1].toLowerCase();
  // Let "new String('')" return 'object'
  if (typeof Promise === 'function' && obj instanceof Promise) return 'promise';
  // PhantomJS has type "DOMWindow" for null
  if (obj === null) return 'null';
  // PhantomJS has type "DOMWindow" for undefined
  if (obj === undefined) return 'undefined';
  return type;
}

exports.Library = Library;

/**
 * ### Library
 *
 * Create a repository for custom type detection.
 *
 * ```js
 * var lib = new type.Library;
 * ```
 *
 */

function Library() {
  if (!(this instanceof Library)) return new Library();
  this.tests = {};
}

/**
 * #### .of (obj)
 *
 * Expose replacement `typeof` detection to the library.
 *
 * ```js
 * if ('string' === lib.of('hello world')) {
 *   // ...
 * }
 * ```
 *
 * @param {Mixed} object to test
 * @return {String} type
 */

Library.prototype.of = getType;

/**
 * #### .define (type, test)
 *
 * Add a test to for the `.test()` assertion.
 *
 * Can be defined as a regular expression:
 *
 * ```js
 * lib.define('int', /^[0-9]+$/);
 * ```
 *
 * ... or as a function:
 *
 * ```js
 * lib.define('bln', function (obj) {
 *   if ('boolean' === lib.of(obj)) return true;
 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];
 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();
 *   return !! ~blns.indexOf(obj);
 * });
 * ```
 *
 * @param {String} type
 * @param {RegExp|Function} test
 * @api public
 */

Library.prototype.define = function(type, test) {
  if (arguments.length === 1) return this.tests[type];
  this.tests[type] = test;
  return this;
};

/**
 * #### .test (obj, test)
 *
 * Assert that an object is of type. Will first
 * check natives, and if that does not pass it will
 * use the user defined custom tests.
 *
 * ```js
 * assert(lib.test('1', 'int'));
 * assert(lib.test('yes', 'bln'));
 * ```
 *
 * @param {Mixed} object
 * @param {String} type
 * @return {Boolean} result
 * @api public
 */

Library.prototype.test = function(obj, type) {
  if (type === getType(obj)) return true;
  var test = this.tests[type];

  if (test && 'regexp' === getType(test)) {
    return test.test(obj);
  } else if (test && 'function' === getType(test)) {
    return test(obj);
  } else {
    throw new ReferenceError('Type test "' + type + '" not defined or invalid.');
  }
};

},{}],43:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsUtils = require('./utils/utils');

var utils = _interopRequireWildcard(_utilsUtils);

var _utilsLog = require('./utils/log');

var _utilsLog2 = _interopRequireDefault(_utilsLog);

var _corePubsub = require('./core/pubsub');

var _corePubsub2 = _interopRequireDefault(_corePubsub);

var BaseClass = (function () {
	function BaseClass(name, options) {
		_classCallCheck(this, BaseClass);

		this.utils = utils;
		this._id = name || utils.uuid();
		this.log = new _utilsLog2['default'](name, {
			colors: {
				debug: 'color:blue'
			}
		});
		this.mixin(new _corePubsub2['default'](name, options));
		this.mixin(options);
		return this;
	}

	_createClass(BaseClass, [{
		key: 'mixin',
		value: function mixin(klass) {
			this.utils.addMixin(klass, this);
		}
	}], [{
		key: 'extend',
		value: function extend(obj) {
			return utils.extendClass(obj, this);
		}
	}]);

	return BaseClass;
})();

exports['default'] = BaseClass;
module.exports = exports['default'];
},{"./core/pubsub":46,"./utils/log":67,"./utils/utils":68}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _coreCore = require('../core/core');

var _coreCore2 = _interopRequireDefault(_coreCore);

var _coreServiceLocator = require('../core/service-locator');

var _coreServiceLocator2 = _interopRequireDefault(_coreServiceLocator);

var _instance = null;

var App = (function (_Core) {
	_inherits(App, _Core);

	_createClass(App, null, [{
		key: 'getInstance',
		value: function getInstance() {
			if (_instance === null) {
				_instance = new App();
			}
			return _instance;
		}
	}]);

	function App(name, options) {
		_classCallCheck(this, App);

		_get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this, name, options);
		this.modules = {};
		this.session = {};

		this.services = new _coreServiceLocator2['default'](name, options);

		this.params = {

			cache: true,
			cacheIgnore: [],
			cacheIgnoreGetParameters: false,
			cacheDuration: 1000 * 60 * 10,
			preloadPreviousPage: true,
			uniqueHistory: false,
			uniqueHistoryIgnoreGetParameters: false,
			dynamicPageUrl: 'content-{{index}}',
			allowDuplicateUrls: false,
			router: true,

			pushState: false,
			pushStateRoot: undefined,
			pushStateNoAnimation: false,
			pushStateSeparator: '#!/',
			pushStatePreventOnLoad: true,

			fastClicks: true,
			fastClicksDistanceThreshold: 10,
			fastClicksDelayBetweenClicks: 50,

			tapHold: false,
			tapHoldDelay: 750,
			tapHoldPreventClicks: true,

			activeState: true,
			activeStateElements: 'a, button, label, span',

			animateNavBackIcon: false,

			swipeBackPage: true,
			swipeBackPageThreshold: 0,
			swipeBackPageActiveArea: 30,
			swipeBackPageAnimateShadow: true,
			swipeBackPageAnimateOpacity: true,

			ajaxLinks: undefined,
			externalLinks: '.external',
			sortable: true,

			hideNavbarOnPageScroll: false,
			hideToolbarOnPageScroll: false,
			hideTabbarOnPageScroll: false,
			showBarsOnPageScrollEnd: true,
			showBarsOnPageScrollTop: true,

			scrollTopOnNavbarClick: false,
			scrollTopOnStatusbarClick: false,

			modalButtonOk: 'OK',
			modalButtonCancel: 'Cancel',
			modalUsernamePlaceholder: 'Username',
			modalPasswordPlaceholder: 'Password',
			modalTitle: 'App',
			modalCloseByOutside: false,
			actionsCloseByOutside: true,
			popupCloseByOutside: true,
			modalPreloaderTitle: 'Loading... ',
			modalStack: true,

			imagesLazyLoadThreshold: 0,
			imagesLazyLoadSequential: true,

			viewClass: 'pxm-view',
			viewMainClass: 'pxm-view-main',
			viewsClass: 'pxm-views',

			animatePages: true,

			templates: {},
			templateData: {},
			templatePages: false,
			precompileTemplates: false,

			init: true
		};

		for (var param in options) {
			this.params[param] = options[param];
		}
	}

	_createClass(App, [{
		key: 'configureRouter',
		value: function configureRouter(config, router) {
			config.title = 'App';
			config.map([{
				route: ['', 'welcome'],
				name: 'welcome',
				moduleId: 'welcome',
				nav: true,
				title: 'Welcome'
			}]);

			this.router = router;
		}
	}, {
		key: 'start',
		value: function start() {
			this.log.logApi('start', this);
			return Promise.all(this.services.startAll());
		}
	}, {
		key: 'bootstrap',
		value: function bootstrap(cb) {
			this.log.logApi('bootstrap', this);
			cb(this);
		}
	}, {
		key: 'run',
		value: function run(cb) {
			this.log.logApi('run', this);
			this.start();
			cb(this);
		}
	}]);

	return App;
})(_coreCore2['default']);

exports['default'] = App;
module.exports = exports['default'];
},{"../core/core":45,"../core/service-locator":49}],45:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var extensions = {};

var Core = (function (_BaseClass) {
	_inherits(Core, _BaseClass);

	function Core(name, options) {
		_classCallCheck(this, Core);

		_get(Object.getPrototypeOf(Core.prototype), 'constructor', this).call(this, name, options);
		this.modules = {};
		this.messages = {
			'!start': 'Could not start the given module, its either already started or is not registered: ',
			'!stop': 'Could not stop the given module, its either already stopped or is not registered: ',
			'!!module': 'Cant register an already registered module: ',
			'!!listen': 'Theres already an listen handler to the notification: '
		};
		return this;
	}

	_createClass(Core, [{
		key: 'register',
		value: function register(module, constructor) {
			if (this.modules[module]) {
				this.helpers.err('!!module', module);
				return false;
			}
			this.modules[module] = {
				constructor: constructor,
				instance: null
			};
		}
	}, {
		key: 'moduleCheck',
		value: function moduleCheck(module, destroy) {
			if (destroy) {
				return !module || !module.instance;
			}

			return !module || module.instance;
		}
	}, {
		key: 'start',
		value: function start(module) {
			if (!module) {
				return this.startAll();
			}

			var cModule = this.modules[module],
			    el = this.getElement(module);

			if (this.moduleCheck(cModule)) {
				this.helpers.err('!start', module);
				return false;
			}

			cModule.instance = new cModule.constructor(new this.Sandbox(module));

			cModule.instance.el = el;

			if (cModule.instance.init) {
				return cModule.instance.init();
			}
		}
	}, {
		key: 'stop',
		value: function stop(module) {
			if (!module) {
				return this.stopAll();
			}

			var cModule = this.modules[module],
			    stopReturn;

			if (this.moduleCheck(cModule, true)) {
				this.helpers.err('!stop', module);
				return false;
			}

			if (cModule.instance.destroy) {
				stopReturn = cModule.instance.destroy();
			}

			cModule.instance = null;

			this.Sandbox.clearNotifications(module);

			return stopReturn;
		}
	}, {
		key: 'stopAll',
		value: function stopAll() {
			this.xAll('stop');
		}
	}, {
		key: 'startAll',
		value: function startAll() {
			this.xAll('start');
		}
	}, {
		key: 'xAll',
		value: function xAll(method) {
			for (var module in this.modules) {
				if (this.modules.hasOwnProperty(module)) {
					this[method](module);
				}
			}
		}
	}, {
		key: 'getElement',
		value: function getElement(id) {
			var el = document.getElementById(id);

			return el && el.id === id && el.parentElement ? el : null;
		}
	}, {
		key: 'err',
		value: (function (_err) {
			function err(_x, _x2) {
				return _err.apply(this, arguments);
			}

			err.toString = function () {
				return _err.toString();
			};

			return err;
		})(function (error, message) {
			this.helpers.log(err.messages[error] + ' - ' + message);
		})
	}], [{
		key: 'extend',
		value: function extend(name, implementation) {
			extensions[name] = implementation;
		}
	}, {
		key: 'getExtension',
		value: function getExtension(extension) {
			return extensions[extension] || null;
		}
	}]);

	return Core;
})(_base2['default']);

exports['default'] = Core;
module.exports = exports['default'];
},{"../base":43}],46:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _utilsLog = require('../utils/log');

var _utilsLog2 = _interopRequireDefault(_utilsLog);

var _utilsDom = require('../utils/dom');

var _utilsDom2 = _interopRequireDefault(_utilsDom);

var PubSub = (function () {
	function PubSub() {
		var name = arguments.length <= 0 || arguments[0] === undefined ? 'pubsub' : arguments[0];
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		_classCallCheck(this, PubSub);

		this.log = new _utilsLog2['default'](name, {
			colors: {
				debug: 'color:orange'
			}
		});

		this.topics = {};

		this.subUid = -1;
		return this;
	}

	_createClass(PubSub, [{
		key: 'start',
		value: function start() {}
	}, {
		key: 'publish',
		value: function publish(topic, args) {
			var topics = this.topics;

			if (!topics[topic]) {
				return false;
			}

			var subscribers = topics[topic],
			    len = subscribers ? subscribers.length : 0;

			while (len--) {
				subscribers[len].func(topic, args);
			}

			return this;
		}
	}, {
		key: 'subscribe',
		value: function subscribe(topic, fn) {
			var topics = this.topics;

			if (!topics[topic]) {
				topics[topic] = [];
			}

			var token = (++this.subUid).toString();

			this.topics[topic].push({
				token: token,
				func: fn
			});
			return token;
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(token) {
			var topics = this.topics;
			for (var m in topics) {
				if (topics[m]) {
					for (var i = 0, j = topics[m].length; i < j; i++) {
						if (topics[m][i].token === token) {
							topics[m].splice(i, 1);
							return token;
						}
					}
				}
			}
			return this;
		}
	}], [{
		key: 'emit',
		value: function emit(event, data) {
			return (0, _utilsDom2['default'])('*body').trigger(event, data);
		}
	}, {
		key: 'on',
		value: function on(event, cb) {
			return (0, _utilsDom2['default'])('*body').on(event, cb);
		}
	}]);

	return PubSub;
})();

exports['default'] = PubSub;
module.exports = exports['default'];
},{"../base":43,"../utils/dom":64,"../utils/log":67}],47:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var routeStripper = /^[#\/]|\s+$/g;

var rootStripper = /^\/+|\/+$/g;

var pathStripper = /#.*$/;

var RouterHistory = (function (_BaseClass) {
	_inherits(RouterHistory, _BaseClass);

	function RouterHistory(name) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {
			root: '/'
		} : arguments[1];

		_classCallCheck(this, RouterHistory);

		_get(Object.getPrototypeOf(RouterHistory.prototype), 'constructor', this).call(this, name, options);
		this.root = ('/' + this.root + '/').replace(rootStripper, '#/');

		if (typeof window !== 'undefined') {
			this.location = window.location;
			this.history = window.history;
		}
		this.pushState = options.pushState || false;
		return this;
	}

	_createClass(RouterHistory, [{
		key: 'go',
		value: function go(route, options) {
			if (this.pushState) {
				this.history.pushState(options, document.title, route);
			} else {
				this.location.hash = route;
			}
		}
	}, {
		key: 'state',
		value: function state() {
			return this.history.state;
		}
	}, {
		key: 'back',
		value: function back() {
			return this.history.back();
		}
	}, {
		key: 'forward',
		value: function forward() {
			return this.history.forward();
		}
	}, {
		key: 'atRoot',
		value: function atRoot() {
			var path = this.location.pathname.replace(/[^\/]$/, '$&/');
			return path === this.root && !this.getSearch();
		}
	}, {
		key: 'matchRoot',
		value: function matchRoot() {
			var path = this.decodeFragment(this.location.pathname);
			var root = path.slice(0, this.root.length - 1) + '/';
			return root === this.root;
		}
	}, {
		key: 'decodeFragment',
		value: function decodeFragment(fragment) {
			return decodeURI(fragment.replace(/%25/g, '%2525'));
		}
	}, {
		key: 'getSearch',
		value: function getSearch() {
			var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
			return match ? match[0] : '';
		}
	}, {
		key: 'getHash',
		value: function getHash(window) {
			var match = (window || this).location.href.match(/#(.*)$/);
			return match ? match[1] : '';
		}
	}, {
		key: 'getPath',
		value: function getPath() {
			var path = this.decodeFragment(this.location.pathname + this.getSearch()).slice(this.root.length - 1);
			return path.charAt(0) === '/' ? path.slice(1) : path;
		}
	}, {
		key: 'getFragment',
		value: function getFragment(fragment) {
			if (fragment === null) {
				if (this._usePushState || !this._wantsHashChange) {
					fragment = this.getPath();
				} else {
					fragment = this.getHash();
				}
			} else {
				fragment = this.getHash();
			}
			return fragment.replace(routeStripper, '');
		}
	}]);

	return RouterHistory;
})(_base2['default']);

exports['default'] = RouterHistory;
module.exports = exports['default'];
},{"../base":43}],48:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pubsub = require('./pubsub');

var _pubsub2 = _interopRequireDefault(_pubsub);

var _routerHistory = require('./router-history');

var _routerHistory2 = _interopRequireDefault(_routerHistory);

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _instance = null;
var optionalParam = /\((.*?)\)/g;
var namedParam = /(\(\?)?:\w+/g;
var splatParam = /\*\w+/g;
var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

var Router = (function (_BaseClass) {
	_inherits(Router, _BaseClass);

	_createClass(Router, null, [{
		key: 'getInstance',
		value: function getInstance() {
			if (_instance == null) {
				_instance = new Router();
			}

			return _instance;
		}
	}]);

	function Router(name, options) {
		_classCallCheck(this, Router);

		name = name + '.Router';
		_get(Object.getPrototypeOf(Router.prototype), 'constructor', this).call(this, name, options);

		this.history = new _routerHistory2['default']();

		this.routes = {};

		this.urlPrefix = '#';
		this.mixin(options);
		this.started = false;
		this._setRegexRoutes();

		return this;
	}

	_createClass(Router, [{
		key: 'listen',
		value: function listen() {
			var self = this;
			var current = this.history.getFragment();
			var fn = function fn() {
				if (current !== self.history.getFragment()) {
					current = self.history.getFragment();
					self.check(current);
				}
			};
			clearInterval(this.interval);
			this.interval = setInterval(fn, 50);
			return this;
		}
	}, {
		key: 'check',
		value: function check(f) {
			var fragment = f || this.history.getFragment();

			for (var i = 0; i < this.routesRegex.length; i++) {
				var match = fragment.match(this.routesRegex[i].regexp);
				if (match) {
					match.shift();
					this.routesRegex[i].success.apply({}, match);
					return this;
				}
			}
			return this;
		}
	}, {
		key: 'start',
		value: function start() {
			var _this2 = this;

			this.log.logApi('2. start', this);
			if ('onhashchange' in window) {
				this.log.logApi('3. onhashchange', 'The browser supports the hashchange event!');
				this.started = true;
				window.addEventListener('hashchange', function (e) {
					_this2._handleRoute(e);
				}, this);
			} else {}
			return this;
		}
	}, {
		key: 'execute',
		value: function execute(callback, args, name) {
			this.log.logApi('execute =>' + name, args);
			if (callback) {
				callback.apply(this, args);
			}
			return this;
		}
	}, {
		key: 'navigate',
		value: function navigate(route, options) {
			this.log.logApi('navigate =>' + route, options);

			this.history.go(route, options);

			return this;
		}
	}, {
		key: 'on',
		value: function on(route, options) {
			this.subscribe(route, options);
			this.log.logApi('5. on -' + route, options);
			this.routes[route] = options;
			this._setRegexRoutes();
			return this;
		}
	}, {
		key: 'when',
		value: function when(route) {
			this.log.logApi('4. when', route);
			var _this = this;
			return new Promise(function (resolve, reject) {
				_this.on(route, {
					callback: function callback(req, res) {
						resolve(req, res);
					}
				});
			});
		}
	}, {
		key: 'route',
		value: function route(_route2, name, callback) {
			this.log.logApi('route', _route2);
			return this;
		}
	}, {
		key: '_handleRoute',
		value: function _handleRoute(e) {
			var _this = this;
			this.log.logApi('_handleRoute', e);
			var _hash = location.hash.replace(/^#\/|\/$/gi, '/');
			var parser = document.createElement('a');
			parser.href = _hash;
			var _routeObj = null;
			var res = {};
			var req = {
				hostname: parser.hostname,
				host: parser.host,
				port: parser.port,
				protocol: parser.protocol,
				pathname: parser.pathname,
				hash: parser.hash,
				url: parser.href,
				query: parser.search,
				params: {},
				data: {} };

			req.query = this._getUrlQuery(parser.href);

			for (var i = 0; i < this.routesRegex.length; i++) {
				_routeObj = this.routesRegex[i];

				if (_routeObj.regexp.test(_hash)) {
					_routeObj.current = _hash;

					_routeObj = this._setRouteParams(_routeObj);

					req.params = _routeObj.params;

					this.log.logApi(_hash, _routeObj);

					_this.publish('route:change', {
						_routeObj: _routeObj, req: req, res: res
					});

					this.execute(_routeObj.success, [req, res], _hash);
				} else {

					this.execute(_routeObj.error, [req, res], _hash);
				}
			}
		}
	}, {
		key: '_setRegexRoutes',
		value: function _setRegexRoutes() {
			var _out = [],
			    _routeParams = [],
			    _reg,
			    _routeObj;

			var routeHandler = null;
			var routeErrorHandler = function routeErrorHandler() {};
			var routeSuccessHandler = function routeSuccessHandler() {};
			var routeResolver = null;

			this.log.logApi('1. registerRoutes', this.routes);
			for (var _route in this.routes) {
				if (this.utils.type(this.routes[_route]) === 'function') {
					routeSuccessHandler = this.routes[_route];
				}

				if (this.utils.type(this.routes[_route]) === 'object') {

					if (this.routes[_route].error) {
						routeErrorHandler.bind(this.routes[_route].error);
					}
					if (this.routes[_route].success) {
						routeSuccessHandler.bind(this.routes[_route].success);
					}

					console.warn('Found route callback');

					if (this.routes[_route].resolve) {
						routeSuccessHandler = this.routes[_route].resolve;
						console.warn('Found route resolver');
					}
				}

				_routeParams = _route.replace('/', '').split('/');
				_reg = this._regexRoute(_route, _routeParams);
				_routeObj = {
					regexp: _reg,
					route: _route,
					success: routeSuccessHandler,
					error: routeErrorHandler
				};
				_out.push(_routeObj);
			}
			this.routesRegex = _out;
			return _out;
		}
	}, {
		key: '_setRouteParams',
		value: function _setRouteParams(routeObj) {
			var normalized = routeObj.route.replace(/\:/g, '');
			var m1 = routeObj.regexp.exec(normalized);
			var m2 = routeObj.regexp.exec(routeObj.current);
			var params = {};
			for (var i = 1; i < m1.length; i++) {
				params[m1[i]] = m2[i];
			}
			routeObj.params = params;
			return routeObj;
		}
	}, {
		key: '_getUrlQuery',
		value: function _getUrlQuery(url) {
			var re = /(?:\?|&(?:amp;)?)([^=&#]+)(?:=?([^&#]*))/g,
			    match,
			    params = {};

			if (typeof url === 'undefined') {
				url = window.location.href;
			}
			var decode = function decode(s) {
				return decodeURIComponent(s.replace(/\+/g, ' '));
			};
			while (match = re.exec(url)) {
				params[decode(match[1])] = decode(match[2]);
			}

			this.log.logApi('getUrlQuery', url);
			return params;
		}
	}, {
		key: '_regexRoute',
		value: function _regexRoute(path, keys, sensitive, strict) {
			if (path instanceof RegExp) {
				return path;
			}
			if (path instanceof Array) {
				path = '(' + path.join('|') + ')';
			}
			path = path.concat(strict ? '' : '/?').replace(/\/\(/g, '(?:/').replace(/\+/g, '__plus__').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function (_, slash, format, key, capture, optional) {
				keys.push({
					name: key,
					optional: !!optional
				});
				slash = slash || '';
				return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || format && '([^/.]+?)' || '([^/]+?)') + ')' + (optional || '');
			}).replace(/([\/.])/g, '\\$1').replace(/__plus__/g, '(.+)').replace(/\*/g, '(.*)');

			return new RegExp('^' + path + '$', sensitive ? '' : 'i');
		}
	}]);

	return Router;
})(_base2['default']);

exports['default'] = Router;
module.exports = exports['default'];
},{"../base":43,"./pubsub":46,"./router-history":47}],49:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _instance = null;
var _services = {};

var ServiceLocator = (function () {
	function ServiceLocator(options) {
		_classCallCheck(this, ServiceLocator);

		this.services = _services;
		this.options = options || {};
		return this;
	}

	_createClass(ServiceLocator, [{
		key: 'register',
		value: function register(key, service) {
			_services[key] = service;
			return this;
		}
	}, {
		key: 'resolve',
		value: function resolve(key) {
			return _services[key];
		}
	}, {
		key: 'start',
		value: function start(key) {
			var service = _services[key];
			console.warn('Starting service', key, service);
			return service.start();
		}
	}, {
		key: 'startAll',
		value: function startAll() {
			var all = [];
			console.warn('startAll', _services);
			for (var service in _services) {
				console.warn('Starting service', service);
				all.push(this.start(service));
			}
			return all;
		}
	}, {
		key: 'reset',
		value: function reset() {
			_services = {};
			return this;
		}
	}], [{
		key: 'getInstance',
		value: function getInstance() {
			if (_instance == null) {
				_instance = new ServiceLocator();
			}
			return _instance;
		}
	}]);

	return ServiceLocator;
})();

exports['default'] = ServiceLocator;
module.exports = exports['default'];
},{}],50:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var SimpleRouter = (function (_BaseClass) {
	_inherits(SimpleRouter, _BaseClass);

	function SimpleRouter(name) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {
			mode: 'hash',
			root: '/',
			urlPrefix: '!#'
		} : arguments[1];

		_classCallCheck(this, SimpleRouter);

		name = name + '.Router';
		_get(Object.getPrototypeOf(SimpleRouter.prototype), 'constructor', this).call(this, name, options);

		this._routes = [];
		this.routes = [];

		this.routeMap = new Map();

		this.mode = options.hash;

		this.root = options.root || window.location.href;
		this.debug = options.debug || true;

		this.urlPrefix = options.urlPrefix || '#';

		this.mixin(options);

		this.config(options);

		return this;
	}

	_createClass(SimpleRouter, [{
		key: 'config',
		value: function config(options) {
			this.mode = options && options.mode && options.mode === 'history' && !!history.pushState ? 'history' : 'hash';
			this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
			if (options && options.routes) {
				for (var route in options.routes) {
					this.add(route, options.routes[route]);
				}
			}
			return this;
		}
	}, {
		key: 'clearSlashes',
		value: function clearSlashes(path) {
			return path.toString().replace(/\/$/, '').replace(/^\//, '');
		}
	}, {
		key: 'getFragment',
		value: function getFragment() {
			var fragment = '';
			if (this.mode === 'history') {
				fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
				fragment = fragment.replace(/\?(.*)$/, '');
				fragment = this.root !== '/' ? fragment.replace(this.root, '') : fragment;
			} else {
				var match = window.location.href.match(/#(.*)$/);
				fragment = match ? match[1] : '';
			}
			return this.clearSlashes(fragment);
		}
	}, {
		key: 'add',
		value: function add(re, handler) {
			if (typeof re === 'function') {
				handler = re;
				re = '';
			}

			this._routes.push({
				re: re,
				handler: handler
			});
			this.subscribe(re, handler);

			return this;
		}
	}, {
		key: 'remove',
		value: function remove(param) {
			for (var i = 0, r; i < this.routes.length, r = this.routes[i]; i++) {
				if (r.handler === param || r.re.toString() === param.toString()) {
					this._routes.splice(i, 1);
					return this;
				}
			}
			return this;
		}
	}, {
		key: 'flush',
		value: function flush() {
			this._routes = [];
			this.mode = null;
			this.root = '/';
			return this;
		}
	}, {
		key: 'check',
		value: function check(f) {
			var fragment = f || this.getFragment();
			for (var i = 0; i < this._routes.length; i++) {
				var match = fragment.match(this._routes[i].re);
				if (match) {
					match.shift();
					this._routes[i].handler.apply({}, match);
					return this;
				}
			}
			return this;
		}
	}, {
		key: 'listen',
		value: function listen() {
			var self = this;
			var current = self.getFragment();
			var fn = function fn() {
				if (current !== self.getFragment()) {
					current = self.getFragment();
					self.check(current);
				}
			};
			clearInterval(this.interval);
			this.interval = setInterval(fn, 100);
			this.listening = true;
			return this;
		}
	}, {
		key: 'navigate',
		value: function navigate(path) {
			path = path ? path : '';
			this.publish(path);
			if (this.mode === 'history') {
				history.pushState(null, null, this.root + this.clearSlashes(path));
			} else {
				window.location.href.match(/#(.*)$/);
				window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
			}
			return this;
		}
	}, {
		key: 'regexRoute',
		value: function regexRoute(path, keys, sensitive, strict) {
			if (path instanceof RegExp) {
				return path;
			}
			if (path instanceof Array) {
				path = '(' + path.join('|') + ')';
			}
			path = path.concat(strict ? '' : '/?').replace(/\/\(/g, '(?:/').replace(/\+/g, '__plus__').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function (_, slash, format, key, capture, optional) {
				keys.push({
					name: key,
					optional: !!optional
				});
				slash = slash || '';
				return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || format && '([^/.]+?)' || '([^/]+?)') + ')' + (optional || '');
			}).replace(/([\/.])/g, '\\$1').replace(/__plus__/g, '(.+)').replace(/\*/g, '(.*)');

			return new RegExp('^' + path + '$', sensitive ? '' : 'i');
		}
	}, {
		key: 'start',
		value: function start() {
			return this.listen();
		}
	}]);

	return SimpleRouter;
})(_base2['default']);

exports['default'] = SimpleRouter;
module.exports = exports['default'];
},{"../base":43}],51:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _http = require('./http');

var _http2 = _interopRequireDefault(_http);

var defaults = {
	baseUrl: '/default',
	idField: '_id',
	model: {},
	models: [],
	params: {
		limit: 25,
		startkey: null,
		endkey: null
	}
};

var Collection = (function (_BaseClass) {
	_inherits(Collection, _BaseClass);

	function Collection(name) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? defaults : arguments[1];

		_classCallCheck(this, Collection);

		_get(Object.getPrototypeOf(Collection.prototype), 'constructor', this).call(this, name, options);

		this.model = options.model;
		this.models = options.models;
		this.baseUrl = options.baseUrl;

		this.idField = options.idField || '_id';
		this.params = options.params || {
			startkey: '',
			endkey: '',
			limit: 25
		};
		this.lastResponse = null;

		this.adapter = options.adapter || _http2['default'];
		this.adapter = new this.adapter(name, options);

		return this;
	}

	_createClass(Collection, [{
		key: 'parse',
		value: function parse(resp) {
			return resp;
		}
	}, {
		key: 'add',
		value: function add(model) {
			return this.models.push(model);
		}
	}, {
		key: 'fetch',
		value: function fetch(params) {
			var self = this;
			return self.adapter.get(params).then(function (resp) {
				self.lastResponse = resp;
				self.models = resp.data.rows;
				return resp;
			});
		}
	}, {
		key: 'remove',
		value: function remove(model) {
			this.log.logApi('Find model by', model);
			if (this.utils.type(model) === 'string') {
				this.log.logApi('Find by _id', model);
			}
			if (this.utils.type(model) === 'number') {
				this.log.logApi('Find by index', model);
			}
			if (this.utils.type(model) === 'object') {
				this.log.logApi('Find by model', model);
			}
		}
	}, {
		key: 'where',
		value: function where(filter) {
			return this.models.filter(filter);
		}
	}, {
		key: 'find',
		value: function find(filter) {
			return this.models.filter(filter);
		}
	}, {
		key: 'get',
		value: function get(id) {
			this.log.logApi('get', id);
		}
	}, {
		key: 'toJSON',
		value: function toJSON() {
			return JSON.stringify(this.models);
		}
	}]);

	return Collection;
})(_base2['default']);

exports['default'] = Collection;
module.exports = exports['default'];
},{"../base":43,"./http":53}],52:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _http = require('./http');

var _http2 = _interopRequireDefault(_http);

var DB = (function (_BaseClass) {
	_inherits(DB, _BaseClass);

	function DB() {
		var name = arguments.length <= 0 || arguments[0] === undefined ? 'db' : arguments[0];
		var options = arguments.length <= 1 || arguments[1] === undefined ? {
			baseUrl: '/default'
		} : arguments[1];

		_classCallCheck(this, DB);

		_get(Object.getPrototypeOf(DB.prototype), 'constructor', this).call(this, name, options);

		if (!options.baseUrl) {
			this.log.logApi('[DB] - Using default baseUrl - /default');
		}

		var adapter = options.adapter || new _http2['default'](name, options);
		this.adapter = adapter;

		return this;
	}

	_createClass(DB, [{
		key: 'info',
		value: function info() {
			return this.adapter.get('');
		}
	}, {
		key: 'allDocs',
		value: function allDocs(options) {
			this.log.logApi('allDocs', options);
			return this.adapter.get('/_all_docs', {
				params: options
			});
		}
	}, {
		key: 'get',
		value: function get(docId, options) {
			this.log.logApi('get', docId);
			if (!docId) {
				throw new Error('db.get(docId) - Must provide a document _id!');
			}
			return this.adapter.get('/' + docId, options);
		}
	}, {
		key: 'put',
		value: function put(doc, options) {
			this.log.logApi('put', doc);
			if (!doc) {
				throw new Error('db.put(doc) - Must provide a document object!');
			}
			if (!doc._id) {
				throw new Error('db.put(doc) - Must provide a _id on the document object!');
			}
			if (doc._rev) {
				options = options || {
					params: {
						rev: doc._rev
					}
				};
			}
			return this.adapter.put('/' + doc._id, doc, options);
		}
	}, {
		key: 'post',
		value: function post(doc) {
			if (!doc) {
				throw new Error('db.put(doc) - Must provide a document object!');
			}
			doc._id = this.utils.uuid();
			return this.put(doc);
		}
	}, {
		key: 'remove',
		value: function remove(id, rev) {
			this.log.logApi('remove', {
				id: id,
				rev: rev
			});
			if (!id) {
				throw new Error('db.remove(id, rev) - Must provide a id!');
			}
			if (!rev) {
				throw new Error('db.remove(id, rev) - Must provide a rev!');
			}
			return this.adapter['delete']('/' + id, {
				params: {
					rev: rev
				}
			});
		}
	}, {
		key: 'getAttachment',
		value: function getAttachment(id, attachmentId, contentType) {
			this.log.logApi('getAttachment', {
				id: id,
				attachment: attachmentId
			});
			if (!id) {
				throw new Error('db.getAttachment(id, attachmentId) - Must provide a document _id!');
			}
			if (!attachmentId) {
				throw new Error('db.getAttachment(id, attachmentId) - Must provide a document attachment!');
			}
			return this.adapter.request(id + '/' + attachmentId, {
				method: 'GET',
				headers: {
					'Content-Type': contentType || 'application/octet-stream'
				}
			});
		}
	}, {
		key: 'saveAttachment',
		value: function saveAttachment(id, rev, filename, type, file) {
			this.log.logApi('saveAttachment', file);
			return this.adapter.request(id + '/' + filename, {
				method: 'PUT',
				headers: {
					'Content-Type': type || 'application/octet-stream'
				},
				params: {
					rev: rev
				},
				body: file
			});
		}
	}, {
		key: 'bulkDocs',
		value: function bulkDocs(docs) {
			if (!docs) {
				throw new Error('bulkDocs - Must provide an array of documents!');
			}
			this.log.logApi('bulkDocs', docs);
			return this.adapter.post('/_bulk_docs', {
				docs: docs
			});
		}
	}, {
		key: 'changes',
		value: function changes(options) {
			var self = this;
			var defaults = {
				live: false,
				include_docs: false,
				conflicts: false,
				attachments: false,
				binary: false,
				descending: false,
				since: 0,
				limit: null,
				heartbeat: 1000
			};

			options = this.utils.extend(defaults, options);

			self.log.logApi('changes', options);

			var _fetchChanges = function _fetchChanges() {
				self.log.logApi('_fetchChanges', options);

				return self.adapter.get('/_changes', {
					params: options
				}).then(self.adapter.parseJSON).then(function (resp) {
					options.since = resp.data.last_seq;

					if (_callbacks.change) {
						if (resp.data.results) {
							resp.data.results.forEach(function (change) {
								_callbacks.change(change);
								self.log.logApi('change', change);
							});
						}
					}

					if (resp.data.results.length === 0) {
						if (_callbacks.complete) {
							_callbacks.complete(resp);
						}
						self.log.logApi('complete', resp);
					}

					return resp;
				})['catch'](function (err) {
					if (_callbacks.error) {
						_callbacks.error(err);
					}
					return err;
				});
			};

			var _callbacks = {};

			var _feed = setInterval(function () {
				self.log.logApi('_feed', options);
				_fetchChanges();
			}, options.heartbeat);

			return {
				on: function on(e, cb) {
					_callbacks[e] = cb;
					self.log.logApi('on', options);
					return this;
				},
				cancel: function cancel() {
					self.log.logApi('cancel', options);
					clearInterval(_feed);
					return this;
				}
			};
		}
	}]);

	return DB;
})(_base2['default']);

exports['default'] = DB;
module.exports = exports['default'];
},{"../base":43,"./http":53}],53:[function(require,module,exports){

'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x14, _x15, _x16) { var _again = true; _function: while (_again) { var object = _x14, property = _x15, receiver = _x16; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x14 = parent; _x15 = property; _x16 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var HTTP = (function (_BaseClass) {
	_inherits(HTTP, _BaseClass);

	function HTTP() {
		var name = arguments.length <= 0 || arguments[0] === undefined ? 'http' : arguments[0];
		var options = arguments.length <= 1 || arguments[1] === undefined ? {
			baseUrl: '/default'
		} : arguments[1];

		_classCallCheck(this, HTTP);

		_get(Object.getPrototypeOf(HTTP.prototype), 'constructor', this).call(this, name, options);

		if (!options.baseUrl) {
			this.log.logApi('[HTTP] - Using default baseUrl - /default');
		}

		return this;
	}

	_createClass(HTTP, [{
		key: 'checkStatus',
		value: function checkStatus(response) {
			return new Promise(function (resolve, reject) {
				if (response.status >= 200 && response.status < 300) {
					resolve(response);
				} else {
					reject(response);
				}
			});
		}
	}, {
		key: 'parseJSON',
		value: function parseJSON(response) {
			return new Promise(function (resolve, reject) {
				if (!response) {
					throw new Error('Must pass a response object to parseJSON!');
				}
				if (response.status >= 200 && response.status < 300) {
					if (response.headers.get('Content-Type') !== 'text/html') {
						response.json().then(function (json) {
							response.data = json;
							resolve(response);
						});
					} else {
						resolve(response);
					}
				} else {
					reject(response);
				}
			});
		}
	}, {
		key: 'getJSON',
		value: function getJSON() {
			var url = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			return fetch(url, options || {
				method: 'GET'
			}).then(this.checkStatus).then(this.parseJSON);
		}
	}, {
		key: 'request',
		value: function request(url, options) {
			var _this2 = this;

			var _this = this;
			var config = this.utils.extend({
				data: null,
				params: null,
				body: null,
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}, options);

			if (options.data) {
				config.body = JSON.stringify(options.data);
				delete config.data;
			}

			url = this.utils.resolveURL(this.baseUrl, url);

			if (options.params) {
				url = this.utils.resolveURL(url, options.params);
				delete options.params;
			}

			this.log.logHttp(config.method, url);

			var benchmark = this.log.logTime('request');
			return new Promise(function (resolve, reject) {
				fetch(url, config).then(function (resp) {
					_this2.log.logHttp(resp.headers.get('Content-Type') + ' ' + resp.status + ' ' + benchmark.end(), resp, true);
					if (config.method === 'HEAD') {
						_this2.checkStatus(resp).then(resolve, reject);
					} else {
						_this2.parseJSON(resp).then(resolve, reject);
					}
				}, reject);
			});
		}
	}, {
		key: 'get',
		value: function get(url) {
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			this.log.logApi('get', options);
			return this.request(url, options);
		}
	}, {
		key: 'put',
		value: function put(url) {
			var data = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			this.log.logApi('put', data);
			return this.request(url, this.utils.extend({
				method: 'PUT',
				data: data
			}, options));
		}
	}, {
		key: 'post',
		value: function post(url) {
			var data = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			return this.request(url, this.utils.extend({
				method: 'POST',
				data: data
			}, options));
		}
	}, {
		key: 'delete',
		value: function _delete() {
			var url = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			return this.request(url, this.utils.extend({
				method: 'DELETE'
			}, options));
		}
	}, {
		key: 'head',
		value: function head() {
			var url = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			return this.request(url, this.utils.extend({
				method: 'HEAD'
			}, options));
		}
	}]);

	return HTTP;
})(_base2['default']);

exports['default'] = HTTP;
module.exports = exports['default'];
},{"../base":43}],54:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _http = require('./http');

var _http2 = _interopRequireDefault(_http);

var _utilsUtils = require('../utils/utils');

var utils = _interopRequireWildcard(_utilsUtils);

var _utilsLog = require('../utils/log');

var _utilsLog2 = _interopRequireDefault(_utilsLog);

var Model = (function (_BaseClass) {
	_inherits(Model, _BaseClass);

	function Model(id, options) {
		_classCallCheck(this, Model);

		id = id || utils.uuid();
		options = options || {};

		_get(Object.getPrototypeOf(Model.prototype), 'constructor', this).call(this, id, options);

		this.uuid = utils.uuid();
		this.baseUrl = options.baseUrl || '/default';
		this.defaults = options.defaults || {};
		this.idField = options.idField || '_id';
		this.scope = options.data || {};
		this.scope[options.idField] = id;

		this.adapter = options.adapter || _http2['default'];
		this.adapter = new this.adapter(id, options);

		this.log = new _utilsLog2['default']('Model:' + id, {
			colors: {
				debug: 'color:blue'
			}
		});
		this.log.logApi('constructor', options);
	}

	_createClass(Model, [{
		key: 'url',
		value: function url() {
			var url = '/' + encodeURIComponent(this.get('_id'));

			if (this.get('_rev')) {
				url += '?rev=' + this.get('_rev');
			}
			this.log.logApi('url()', url);
			return url;
		}
	}, {
		key: 'has',
		value: function has(attribute) {
			return this.scope.hasOwnProperty(attribute);
		}
	}, {
		key: 'get',
		value: function get(attribute) {
			if (this.has(attribute)) {
				return this.scope[attribute];
			} else {
				return false;
			}
		}
	}, {
		key: 'set',
		value: function set(attributes) {
			var force = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

			for (var key in attributes) {
				if (force) {
					this.scope[key] = attributes[key];
				}
				if (this.has(key)) {
					this.scope[key] = attributes[key];
				}
			}
			return this;
		}
	}, {
		key: 'toJSON',
		value: function toJSON() {
			this.log.logApi('toJSON', this.scope);
			return JSON.stringify(this.scope);
		}
	}, {
		key: 'clone',
		value: function clone() {
			return new this.constructor(this.options);
		}
	}, {
		key: 'parse',
		value: function parse(resp) {
			this.log.logApi('parse', resp);
			if (resp.data) {
				this.scope = resp.data;
			}
			return resp;
		}
	}, {
		key: 'fetch',
		value: function fetch(options) {
			var self = this;
			this.log.logApi('fetch', options);
			return this.adapter.get(this.url(), options || {}).then(function (resp) {
				return self.parse(resp);
			});
		}
	}, {
		key: 'save',
		value: function save(options) {
			this.log.logApi('save', options);
			return this.adapter.put('' + this.url(), this.scope);
		}
	}, {
		key: 'destroy',
		value: function destroy(rev) {
			this.log.logApi('destroy', rev);
			return this.adapter['delete']('' + this.url());
		}
	}, {
		key: 'sync',
		value: function sync(options) {
			this.log.logApi('sync', options);
		}
	}], [{
		key: 'extend',
		value: function extend(obj) {
			return _get(Object.getPrototypeOf(Model), 'extend', this).call(this, this, obj);
		}
	}]);

	return Model;
})(_base2['default']);

exports['default'] = Model;
module.exports = exports['default'];
},{"../base":43,"../utils/log":67,"../utils/utils":68,"./http":53}],55:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsLog = require('../utils/log');

var _utilsLog2 = _interopRequireDefault(_utilsLog);

var _utilsUtils = require('../utils/utils');

var utils = _interopRequireWildcard(_utilsUtils);

var pmPage = (function () {
  function pmPage() {
    _classCallCheck(this, pmPage);
  }

  _createClass(pmPage, [{
    key: 'createdCallback',
    value: function createdCallback() {
      var logger = new _utilsLog2['default'](this.localName, {
        colors: {
          debug: 'color:orange'
        }
      });
      utils.addMixin(logger, this);

      this.properties = {
        title: {
          type: String,
          value: 'Page Title'
        },

        backText: {
          type: String,
          value: null
        },

        backLink: {
          type: String,
          value: null
        },

        href: {
          type: String,
          notify: true,
          value: null,
          observer: '_tmplChanged'
        },

        active: {
          type: Boolean,
          value: false
        },

        modal: {
          type: Boolean,
          value: false
        },

        query: {
          type: Object
        },

        context: {
          type: Object
        },

        view: {
          type: Object
        },

        fromPage: {
          type: Object
        },
        route: {
          type: String
        },

        url: {
          type: String
        },

        container: {
          type: String
        }
      };

      this.createShadowRoot().innerHTML = '\n\t\t\t\t\t<style>\n\t\t\t\t\t\t:host {\n\t\t\t\t\t    display: block;\n\t\t\t\t\t    box-sizing: border-box;\n\t\t\t\t\t    -webkit-transition: all 0.4s ease-out;\n\t\t\t\t\t    transition: all 0.4s ease-out;\n\t\t\t\t\t  }\n\t\t\t\t\t\t:host header{\n\t\t\t\t\t\t  padding: 10px;\n\t\t\t\t\t\t}\n\t\t\t\t\t  :host .close-btn{\n\t\t\t\t\t    cursor: pointer;\n\t\t\t\t\t    position: absolute;\n\t\t\t\t\t    right: .1em;\n\t\t\t\t\t    top: .2em;\n\t\t\t\t\t    width: 44px;\n\t\t\t\t\t    height: 44px;\n\t\t\t\t\t    display: block;\n\t\t\t\t\t  }\n\t\t\t\t    :host .hamburger {\n\t\t\t\t      width: 20px;\n\t\t\t\t      height: 2px;\n\t\t\t\t      background: #000;\n\t\t\t\t      display: block;\n\t\t\t\t      position: absolute;\n\t\t\t\t      top: 50%;\n\t\t\t\t      left: 15%;\n\t\t\t\t      transition: transform 300ms;\n\t\t\t\t    }\n\t\t\t\t\t  :host .hamburger-1 {\n\t\t\t\t\t    transform: translate3d(0, 0, 0) rotate(45deg);\n\t\t\t\t\t  }\n\t\t\t\t\t  :host .hamburger-2 {\n\t\t\t\t\t    transform: translate3d(0, 0, 0) rotate(-45deg);\n\t\t\t\t\t  }\n\t\t\t\t\t</style>\n\t\t\t\t\t<div class="page-content overthrow">\n\t\t\t\t\t\t<content></content>\n\t\t\t\t\t</div>\n\t\t\t\t\t';

      this.logApi('created', this.id);
    }
  }, {
    key: 'ready',
    value: function ready() {
      this.logApi('ready', this.id);
      if (this.modal) {
        this.toggleClass('modal');
      }
    }
  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {}
  }, {
    key: 'detachedCallback',
    value: function detachedCallback() {}
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(prop, oldVal, newVal) {}
  }, {
    key: 'show',
    value: function show() {
      this.logApi('show view', this.id);
      this.toggleClass('current', false, this);
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.logApi('hide view', this.id);
      this.toggleClass('hidden', true, this);
    }
  }, {
    key: 'update',
    value: function update() {
      this.logApi('update view', this.id);
    }
  }, {
    key: 'currentView',
    value: function currentView() {
      this.logApi('current view', this.id);
      this.child()[0].toggleClass('current', true, this);
    }
  }, {
    key: 'nextView',
    value: function nextView() {
      this.logApi('next view', this.id);
      this.toggleClass('next', true, this);
    }
  }, {
    key: 'previousView',
    value: function previousView() {
      this.logApi('previous view', this.id);
      this.toggleClass('previous', true, this);
    }
  }, {
    key: 'contextChanged',
    value: function contextChanged(newContext, oldContext) {
      this.logApi('contextChanged', newContext, oldContext);
    }
  }, {
    key: '_tmplChanged',
    value: function _tmplChanged(newVal, oldVal) {
      var _this = this,
          html = '';
      if (newVal) {
        this.logApi(this.id, 'Load remote html', newVal);
        this.importHref(newVal, function (e) {
          html = e.target['import'].body.innerHTML;
          _this.logApi('inject html', _this.id);
          _this.logApi('inject px-view html', _this.id);
          _this.html(html);
        }, function (e) {
          _this.logApi('Error loading page', e);
        });
      }
    }
  }, {
    key: 'showMenu',
    value: function showMenu() {
      px.mobile.dom('pxm-app').toggleClass('show-menu');
    }
  }, {
    key: 'open',
    value: function open() {
      this.logApi('open', this);
      this.addClass('active');
    }
  }, {
    key: 'close',
    value: function close() {
      this.logApi('close', this);
      this.removeClass('active');
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      this.logApi('toggle', this);
      this.toggleClass('active');
    }
  }]);

  return pmPage;
})();

exports['default'] = pmPage;
module.exports = exports['default'];
},{"../utils/log":67,"../utils/utils":68}],56:[function(require,module,exports){

'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _coreCore = require('./core/core');

var _coreCore2 = _interopRequireDefault(_coreCore);

var _coreRouterHistory = require('./core/router-history');

var _coreRouterHistory2 = _interopRequireDefault(_coreRouterHistory);

var _coreRouter = require('./core/router');

var _coreRouter2 = _interopRequireDefault(_coreRouter);

var _coreSimpleRouter = require('./core/simple-router');

var _coreSimpleRouter2 = _interopRequireDefault(_coreSimpleRouter);

var _corePubsub = require('./core/pubsub');

var _corePubsub2 = _interopRequireDefault(_corePubsub);

var _dsCollection = require('./ds/collection');

var _dsCollection2 = _interopRequireDefault(_dsCollection);

var _dsHttp = require('./ds/http');

var _dsHttp2 = _interopRequireDefault(_dsHttp);

var _dsDb = require('./ds/db');

var _dsDb2 = _interopRequireDefault(_dsDb);

var _dsModel = require('./ds/model');

var _dsModel2 = _interopRequireDefault(_dsModel);

var _elementsPmPage = require('./elements/pm-page');

var _elementsPmPage2 = _interopRequireDefault(_elementsPmPage);

var _coreApp = require('./core/app');

var _coreApp2 = _interopRequireDefault(_coreApp);

var _uiElement = require('./ui/element');

var _uiElement2 = _interopRequireDefault(_uiElement);

var _uiElements = require('./ui/elements');

var _uiElements2 = _interopRequireDefault(_uiElements);

var _uiPage = require('./ui/page');

var _uiPage2 = _interopRequireDefault(_uiPage);

var _uiPages = require('./ui/pages');

var _uiPages2 = _interopRequireDefault(_uiPages);

var _uiViews = require('./ui/views');

var _uiViews2 = _interopRequireDefault(_uiViews);

var _uiView = require('./ui/view');

var _uiView2 = _interopRequireDefault(_uiView);

var _uiComponent = require('./ui/component');

var _uiComponent2 = _interopRequireDefault(_uiComponent);

var _utilsUtils = require('./utils/utils');

var utils = _interopRequireWildcard(_utilsUtils);

var _utilsInterface = require('./utils/interface');

var _utilsInterface2 = _interopRequireDefault(_utilsInterface);

var _utilsInterfaces = require('./utils/interfaces');

var _utilsInterfaces2 = _interopRequireDefault(_utilsInterfaces);

var _utilsLog = require('./utils/log');

var _utilsLog2 = _interopRequireDefault(_utilsLog);

var _utilsDom = require('./utils/dom');

var _utilsDom2 = _interopRequireDefault(_utilsDom);

var pxMobile = {
	debug: true,
	version: 'es6',
	behaviors: {},

	BaseClass: _base2['default'],
	Core: _coreCore2['default'],
	SimpleRouter: _coreSimpleRouter2['default'],
	Router: _coreRouter2['default'],
	RouterHistory: _coreRouterHistory2['default'],
	PubSub: _corePubsub2['default'],

	Collection: _dsCollection2['default'],
	DB: _dsDb2['default'],
	HTTP: _dsHttp2['default'],
	Model: _dsModel2['default'],

	App: _coreApp2['default'],
	Page: _uiPage2['default'],
	Pages: _uiPages2['default'],
	View: _uiView2['default'],
	Views: _uiViews2['default'],
	Element: _uiElement2['default'],
	Elements: _uiElements2['default'],

	$: _utilsDom.$,
	utils: utils,
	Logger: _utilsLog2['default'],
	Interface: _utilsInterface2['default'],
	Interfaces: _utilsInterfaces2['default'],
	dom: _utilsDom2['default'],
	ui: {
		App: _coreApp2['default'],
		Component: _uiComponent2['default'],
		Element: _uiElement2['default'],
		Page: _uiPage2['default'],
		Pages: _uiPages2['default'],
		View: _uiView2['default'],
		Views: _uiViews2['default']
	},
	elements: {
		pmPage: _elementsPmPage2['default']
	}
};

exports['default'] = pxMobile;
module.exports = exports['default'];
},{"./base":43,"./core/app":44,"./core/core":45,"./core/pubsub":46,"./core/router":48,"./core/router-history":47,"./core/simple-router":50,"./ds/collection":51,"./ds/db":52,"./ds/http":53,"./ds/model":54,"./elements/pm-page":55,"./ui/component":57,"./ui/element":58,"./ui/elements":59,"./ui/page":60,"./ui/pages":61,"./ui/view":62,"./ui/views":63,"./utils/dom":64,"./utils/interface":65,"./utils/interfaces":66,"./utils/log":67,"./utils/utils":68}],57:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Component = function Component() {
  _classCallCheck(this, Component);
};

exports["default"] = Component;
module.exports = exports["default"];
},{}],58:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Element = (function () {
  function Element() {
    _classCallCheck(this, Element);
  }

  _createClass(Element, [{
    key: 'createdCallback',
    value: function createdCallback() {
      this.createShadowRoot().innerHTML = '\n    <style>\n      :host {\n        display: block;\n      }\n    </style>\n    <div id="quotes"><div>\n    ';

      this.updateUi();
    }
  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {
      console.log('attachedCallback');
    }
  }, {
    key: 'detachedCallback',
    value: function detachedCallback() {
      console.log('detachedCallback');
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback() {
      console.log('attr changed');
    }
  }, {
    key: 'updateUi',
    value: function updateUi() {
      console.log('updateUi');
    }
  }, {
    key: 'myProp',
    get: function get() {
      var s = this.getAttribute('my-prop');
      return s ? JSON.parse(s) : [];
    },
    set: function set(val) {
      this.setAttribute('my-prop', JSON.stringify(val));
      this.updateUi();
    }
  }]);

  return Element;
})();

exports['default'] = Element;
module.exports = exports['default'];
},{}],59:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var Elements = (function (_BaseClass) {
	_inherits(Elements, _BaseClass);

	function Elements(id, options) {
		_classCallCheck(this, Elements);

		_get(Object.getPrototypeOf(Elements.prototype), 'constructor', this).call(this, id, options);
		this.logger.logApi('constructor', id);
	}

	return Elements;
})(_base2['default']);

exports['default'] = Elements;
module.exports = exports['default'];
},{"../base":43}],60:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _corePubsub = require('../core/pubsub');

var _corePubsub2 = _interopRequireDefault(_corePubsub);

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var Page = (function (_BaseClass) {
	_inherits(Page, _BaseClass);

	function Page(name, options) {
		_classCallCheck(this, Page);

		_get(Object.getPrototypeOf(Page.prototype), 'constructor', this).call(this, name, options);

		this.properties = {
			title: {
				type: String,
				value: null
			},
			backText: {
				type: String,
				value: null
			},
			backLink: {
				type: String,
				value: null
			},

			href: {
				type: String,
				notify: true,
				value: null,
				observer: '_tmplChanged'
			},
			active: {
				type: Boolean,
				value: false
			},
			dialog: {
				type: Boolean,
				value: false
			},

			query: {
				type: Object
			},
			context: {
				type: Object
			},

			view: {
				type: Object
			},

			fromPage: {
				type: Object
			},
			route: {
				type: String
			},

			url: {
				type: String
			},

			container: {
				type: String
			}
		};

		this.utils.addMixin(new _corePubsub2['default'](name), this);

		return this;
	}

	_createClass(Page, [{
		key: 'created',
		value: function created() {
			var logger = new px.mobile.Logger(this.tagName, {
				colors: {
					debug: 'color:orange'
				}
			});
			px.mobile.utils.addMixin(logger, this);
			this.log.logApi('created', this.id);
			this.emit('page:' + this.id + ':init', this);
		}
	}, {
		key: 'ready',
		value: function ready() {
			this.log.logApi('ready', this.id);
			if (this.dialog) {
				this.toggleClass('dialog');
			}
			this.emit('page:' + this.id + ':ready', this);
		}
	}, {
		key: 'show',
		value: function show() {
			console.warn('INFO', 'show view', this.id);
			this.toggleClass('current', false, this);
		}
	}, {
		key: 'hide',
		value: function hide() {
			console.warn('INFO', 'hide view', this.id);
			this.toggleClass('hidden', true, this);
		}
	}, {
		key: 'update',
		value: function update() {
			console.warn('INFO', 'update view', this.id);
		}
	}, {
		key: 'currentView',
		value: function currentView() {
			console.warn('INFO', 'current view', this.id);
			this.child()[0].toggleClass('current', true, this);
		}
	}, {
		key: 'nextView',
		value: function nextView() {
			console.warn('INFO', 'next view', this.id);
			this.toggleClass('next', true, this);
		}
	}, {
		key: 'previousView',
		value: function previousView() {
			console.warn('INFO', 'previous view', this.id);
			this.toggleClass('previous', true, this);
		}
	}, {
		key: 'contextChanged',
		value: function contextChanged(newContext, oldContext) {
			console.warn('contextChanged', newContext, oldContext);
		}
	}, {
		key: '_tmplChanged',
		value: function _tmplChanged(newVal, oldVal) {
			var _this = this,
			    html = '';
			if (newVal) {
				console.warn(this.id, 'Load remote html', newVal);
				this.importHref(newVal, function (e) {
					html = e.target['import'].body.innerHTML;
					_this.log.logApi('inject html', _this.id);
					console.warn('inject px-view html', _this.id);
					_this.html(html);
				}, function (e) {
					console.error('Error loading page', e);
				});
			}
		}
	}, {
		key: 'showMenu',
		value: function showMenu() {
			px.mobile.dom('px-app').toggleClass('show-menu');
		}
	}, {
		key: 'open',
		value: function open() {
			if (this.dialog) {
				this.toggleClass('open');
			}
		}
	}, {
		key: 'close',
		value: function close() {
			if (this.dialog) {
				this.toggleClass('open');
			}
		}
	}]);

	return Page;
})(_base2['default']);

exports['default'] = Page;
module.exports = exports['default'];
},{"../base":43,"../core/pubsub":46}],61:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _corePubsub = require('../core/pubsub');

var _corePubsub2 = _interopRequireDefault(_corePubsub);

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var Pages = (function (_BaseClass) {
	_inherits(Pages, _BaseClass);

	function Pages(name, options) {
		_classCallCheck(this, Pages);

		_get(Object.getPrototypeOf(Pages.prototype), 'constructor', this).call(this, name, options);

		this.PageList = [];
		this.PageMap = {};

		return this;
	}

	_createClass(Pages, [{
		key: 'beforeRegister',
		value: function beforeRegister() {}
	}, {
		key: 'created',
		value: function created() {}
	}, {
		key: 'ready',
		value: function ready() {}
	}, {
		key: 'attached',
		value: function attached() {}
	}, {
		key: 'detached',
		value: function detached() {}
	}, {
		key: 'attributeChanged',
		value: function attributeChanged() {}
	}, {
		key: 'goto',
		value: function goto(indexOrId) {
			var page = this.PageMap[indexOrId] || this.PageList[indexOrId] | {};
			if (page) {
				this.gotoPage(indexOrId);
				return page;
			}
		}
	}, {
		key: 'gotoPage',
		value: function gotoPage(id) {
			var index = 0;
			if (this.PageMap[id]) {
				index = this.PageList.indexOf(this.PageMap[id]);
			}
			this.selected = index;
			this.logApi('gotoPage', id, index);
		}
	}, {
		key: 'gotoIndex',
		value: function gotoIndex(index) {
			this.logApi('gotoIndex', index);
			this.children[index].removeClass('previous');
			this.children[index].removeClass('next');
			this.selected = index;
		}
	}, {
		key: 'current',
		value: function current() {
			this.logApi('current', this.selected);
			this.gotoIndex(this.selected);
		}
	}, {
		key: 'prev',
		value: function prev() {
			if (this.selected <= 0) {
				if (this.loop) {
					this.reset(true);
				} else {
					this.current();
				}
			} else {
				this.gotoIndex(this.selected - 1);
			}
		}
	}, {
		key: 'next',
		value: function next() {
			this.logApi('next', this.selected);
			if (this.selected >= this.PageList.length - 1) {
				if (this.loop) {
					this.reset();
				} else {
					this.current();
				}
			} else {
				this.gotoIndex(this.selected + 1);
			}
		}
	}]);

	return Pages;
})(_base2['default']);

exports['default'] = Pages;
module.exports = exports['default'];
},{"../base":43,"../core/pubsub":46}],62:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var View = (function () {
	function View(options) {
		_classCallCheck(this, View);

		console.warn('new View', options);
		this.id = options.id;
		this.params = options.params || {};
		this.url = options.url || '';
		this.main = options.main || false;
		this.element = document.createElement('pxm-view');
	}

	_createClass(View, [{
		key: 'toHTML',
		value: function toHTML() {
			this.log.logApi(this, this.element);
		}
	}]);

	return View;
})();

exports['default'] = View;
module.exports = exports['default'];
},{}],63:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _view = require('./view');

var _view2 = _interopRequireDefault(_view);

var Views = (function (_BaseClass) {
	_inherits(Views, _BaseClass);

	function Views(options) {
		var _this = this;

		_classCallCheck(this, Views);

		_get(Object.getPrototypeOf(Views.prototype), 'constructor', this).call(this, options.id, options);
		this.id = options.id;
		this.selected = options.selected || 0;
		this.selectedView = {};
		this.views = [];
		this.viewMap = new Map();

		if (options.views) {
			options.views.forEach(function (view) {
				_this.add(view);
			});
		}

		this.selectViewByIndex(this.selected);
		return this;
	}

	_createClass(Views, [{
		key: 'created',
		value: function created() {
			this.log.logApi('Views created');
		}
	}, {
		key: 'attached',
		value: function attached() {
			this.log.logApi('Views attached');
		}
	}, {
		key: 'add',
		value: function add(v) {
			var view = new _view2['default'](v);
			view.index = this.views.length;
			this[view.id] = view;
			this.views.push(view);
			this.viewMap.set(view.id, view);
			return this;
		}
	}, {
		key: 'get',
		value: function get(key) {
			return this.viewMap.get(key);
		}
	}, {
		key: 'getViews',
		value: function getViews() {
			return this.viewMap.entries();
		}
	}, {
		key: 'selectView',
		value: function selectView(key) {
			this.log.logApi('Views.selectView()', key);
			this.selectedView = this.viewMap.get(key);
			this.selected = this.views.indexOf(this.selectedView);
			return this;
		}
	}, {
		key: 'getSelectedView',
		value: function getSelectedView() {
			return this.selectedView;
		}
	}, {
		key: 'getSelectedIndex',
		value: function getSelectedIndex() {
			return this.views.indexOf(this.getSelectedView());
		}
	}, {
		key: 'nextView',
		value: function nextView() {
			var items = this.views,
			    len = items.length,
			    counter = this.selected,
			    index = this.selected + 1;
			counter++;

			if (counter >= len) {
				this.log.logApi('Reached last item');
				counter = 0;
			}
			this.selected = counter;
			this.selectView(this.views[this.selected].id);

			this.log.logApi('nextView', items, len, 'index', index, 'selected', this.selected);
			return this.selected;
		}
	}, {
		key: 'prevView',
		value: function prevView() {
			var items = this.views,
			    len = items.length,
			    counter = this.selected,
			    index = this.selected;

			counter--;

			if (counter >= len) {
				counter = index - len;
			} else if (counter < 0) {
				counter = 0;
				this.log.logApi('Reached first item');
			}
			this.selected = counter;
			this.selectView(this.views[this.selected].id);

			this.log.logApi('prevView', items, len, 'index', index, 'selected', this.selected);

			return this.selected;
		}
	}, {
		key: 'selectViewByIndex',
		value: function selectViewByIndex(i) {
			this.selectView(this.views[i].id);
		}
	}, {
		key: 'changeView',
		value: function changeView(id) {
			this.selectView(id);
		}
	}]);

	return Views;
})(_base2['default']);

exports['default'] = Views;
module.exports = exports['default'];
},{"../base":43,"./view":62}],64:[function(require,module,exports){
(function (global){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DOM = (function () {
	function DOM(selector, context) {
		_classCallCheck(this, DOM);

		console.time('dom');
		var matches = {
			'#': 'getElementById',
			'.': 'getElementsByClassName',
			'@': 'getElementsByName',
			'=': 'getElementsByTagName',
			'*': 'querySelectorAll'
		};
		var match = matches[selector[0]];
		if (!match) {
			match = 'querySelectorAll';
		}
		var out = null,
		    el;

		try {
			el = (context === undefined ? document : context)[matches](selector.slice(1));
			out = el.length < 2 ? el[0] : el;
		} catch (err) {}
		this.length = el.length || 0;
		Object.assign(this, out);
		return this;
	}

	_createClass(DOM, [{
		key: 'find',
		value: function find(selector, context) {}
	}, {
		key: 'clone',
		value: function clone() {}
	}, {
		key: 'each',
		value: function each(callback) {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = Array.from(this)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var el = _step.value;

					callback.call(el);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator['return']) {
						_iterator['return']();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			return this;
		}
	}, {
		key: 'addClass',
		value: function addClass(className) {
			return this.each(function () {
				if (this.classList) {
					this.classList.add(className);
				} else {
					this.className += ' ' + className;
				}
			});
		}
	}, {
		key: 'removeClass',
		value: function removeClass(className) {
			return this.each(function () {
				this.classList.remove(className);
			});
		}
	}, {
		key: 'hasClass',
		value: function hasClass(className) {
			if (this.classList) {
				return this.classList.contains(className);
			} else {
				return new RegExp('(^| )' + className + '( |$)', 'gi').test(this.className);
			}
		}
	}, {
		key: 'toggleClass',
		value: function toggleClass(className) {
			var el = this;
			if (el.classList) {
				el.classList.toggle(className);
			} else {
				var classes = el.className.split(' ');
				var existingIndex = classes.indexOf(className);

				if (existingIndex >= 0) {
					classes.splice(existingIndex, 1);
				} else {
					classes.push(className);
				}
				el.className = classes.join(' ');
			}
		}
	}, {
		key: 'css',
		value: function css(prop, value) {
			if (value) {
				this.style[prop] = value;
				return this;
			} else if (prop) {
				return this.style[prop];
			} else {
				return this.style;
			}
		}
	}, {
		key: 'attr',
		value: function attr(name, value) {
			name = name.toLowerCase();

			if (value) {
				this.setAttribute(name, value);
				return this;
			} else {
				return this.getAttribute(name);
			}
		}
	}, {
		key: 'data',
		value: function data(name, value) {
			if (value) {
				this.setAttribute('data-' + name, value);
				return this;
			} else {
				return this.getAttribute('data-' + name);
			}
		}
	}, {
		key: 'on',
		value: function on(event, callback) {
			return this.each(function () {
				this.addEventListener(event, callback, false);
			});
		}
	}, {
		key: '_on',
		value: function _on(eventName, eventHandler) {
			eventType = eventType.split(' ');
			for (var i = 0; i < eventType.length; i++) {
				this.addEventListener(eventType[i], callback);
			}
			return this;
		}
	}, {
		key: 'off',
		value: function off(eventName, eventHandler) {
			this.removeEventListener(eventName, eventHandler);
		}
	}, {
		key: 'trigger',
		value: function trigger(eventName, eventData) {
			var event;
			if (window.CustomEvent) {
				event = new CustomEvent(eventName, {
					detail: eventData
				});
			} else {
				event = document.createEvent('CustomEvent');
				event.initCustomEvent(eventName, true, true, eventData);
			}
			return this.dispatchEvent(event);
		}
	}, {
		key: 'empty',
		value: function empty() {
			this.innerHTML = '';
			return this;
		}
	}, {
		key: 'html',
		value: function html(_html) {
			if (_html) {
				this.innerHTML = _html;
				return this;
			} else {
				return this.innerHTML;
			}
		}
	}, {
		key: 'text',
		value: function text(_text) {
			if (_text) {
				this.textContent = _text;
				return this;
			} else {
				return this.textContent;
			}
		}
	}, {
		key: 'next',
		value: function next() {
			return this.nextElementSibling;
		}
	}, {
		key: 'prev',
		value: function prev() {}
	}, {
		key: 'parent',
		value: function parent() {
			return this.parentNode;
		}
	}, {
		key: 'child',
		value: function child() {}
	}, {
		key: 'position',
		value: function position() {}
	}]);

	return DOM;
})();

exports['default'] = DOM;

var dom = function dom(selector, context, undefined) {

	var matches = ({
		'#': 'getElementById',
		'.': 'getElementsByClassName',
		'@': 'getElementsByName',
		'=': 'getElementsByTagName',
		'*': 'querySelectorAll'
	})[selector[0]];

	var out = null,
	    el;
	try {
		el = (context === undefined ? document : context)[matches](selector.slice(1));
		out = el.length < 2 ? el[0] : el;
	} catch (err) {}

	return out;
};

dom.extend = function (out) {
	out = out || {};
	for (var i = 1; i < arguments.length; i++) {
		if (!arguments[i]) {
			continue;
		}
		for (var key in arguments[i]) {
			if (arguments[i].hasOwnProperty(key)) {
				out[key] = arguments[i][key];
			}
		}
	}
	return out;
};

(function (win) {
	if (!win || !win.Element) {
		return;
	}

	win.Element.prototype.find = function (selector) {
		return dom(selector, this);
	};

	win.Element.prototype.append = function (el) {
		return this.appendChild(el);
	};

	win.Element.prototype.clone = function () {
		return this.cloneNode(true);
	};

	window.Element.prototype.hasClass = function (className) {
		if (this.classList) {
			return this.classList.contains(className);
		} else {
			return new RegExp('(^| )' + className + '( |$)', 'gi').test(this.className);
		}
	};

	win.Element.prototype.addClass = function (className) {
		var classes = className.split(' ');
		for (var i = 0; i < classes.length; i++) {
			if (this.classList) {
				this.classList.add(classes[i]);
			} else {
				this.className += ' ' + classes[i];
			}
		}
		return this;
	};

	win.Element.prototype.removeClass = function (className) {
		var el = this;
		if (el.classList && className) {
			el.classList.remove(className);
		} else if (el.classList && !className) {
			el.classList.forEach(function (cla) {
				el.removeClass(cla);
			});
		} else {
			el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
		return this;
	};

	win.Element.prototype.toggleClass = function (className) {
		var el = this;
		if (el.classList) {
			el.classList.toggle(className);
		} else {
			var classes = el.className.split(' ');
			var existingIndex = classes.indexOf(className);

			if (existingIndex >= 0) {
				classes.splice(existingIndex, 1);
			} else {
				classes.push(className);
			}
			el.className = classes.join(' ');
		}
	};

	win.Element.prototype.css = function (prop, value) {
		if (value) {
			this.style[prop] = value;
			return this;
		} else if (prop) {
			return this.style[prop];
		} else {
			return this.style;
		}
	};

	win.Element.prototype.attr = function (name, value) {
		name = name.toLowerCase();

		if (value) {
			this.setAttribute(name, value);
			return this;
		} else {
			return this.getAttribute(name);
		}
	};

	win.Element.prototype.data = function (name, value) {
		if (value) {
			this.setAttribute('data-' + name, value);
			return this;
		} else {
			return this.getAttribute('data-' + name);
		}
	};

	win.Element.prototype.on = function (eventType, callback) {
		eventType = eventType.split(' ');
		for (var i = 0; i < eventType.length; i++) {
			this.addEventListener(eventType[i], callback);
		}
		return this;
	};

	win.Element.prototype.off = function (eventName, eventHandler) {
		this.removeEventListener(eventName, eventHandler);
	};

	win.Element.prototype.trigger = function (eventName, eventData) {
		var event;
		if (win.CustomEvent) {
			event = new CustomEvent(eventName, {
				detail: eventData
			});
		} else {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent(eventName, true, true, eventData);
		}
		return this.dispatchEvent(event);
	};

	win.Element.prototype.empty = function () {
		this.innerHTML = '';
		return this;
	};

	win.Element.prototype.html = function (html) {
		if (html) {
			this.innerHTML = html;
			return this;
		} else {
			return this.innerHTML;
		}
	};

	win.Element.prototype.text = function (text) {
		if (text) {
			this.textContent = text;
			return this;
		} else {
			return this.textContent;
		}
	};

	win.Element.prototype.next = function () {
		return this.nextElementSibling;
	};

	win.Element.prototype.parent = function () {
		return this.parentNode;
	};

	win.Element.prototype.remove = function () {
		return this.parentNode.removeChild(this);
	};

	win.Element.prototype.child = function (el) {
		if (el) {
			return this.querySelectorAll(el);
		} else {
			return this.children;
		}
	};

	win.Element.prototype.position = function () {
		var pos = {
			left: this.offsetLeft,
			top: this.offsetTop
		};
		return pos;
	};

	win.NodeList.prototype.addClass = function (name) {
		this.each(function (el) {
			el.classList.add(name);
		});
		return this;
	};

	win.NodeList.prototype.removeClass = function (name) {
		this.each(function (el) {
			el.classList.remove(name);
		});
		return this;
	};

	win.NodeList.prototype.find = function find(elem) {
		console.error('You cannot find in a NodeList. Just use $(*selector %s)', elem);
		return this;
	};

	win.NodeList.prototype.each = Array.prototype.forEach;

	win.NodeList.prototype.attr = function (name, value) {
		this.each(function (el) {
			if (value) {
				el.setAttribute(name, value);
			} else {
				return el.getAttribute(name);
			}
		});
		return this;
	};

	win.NodeList.prototype.toggleClass = function (className) {
		this.each(function (el) {
			el.toggleClass(className);
		});
		return this;
	};

	win.NodeList.prototype.css = function (prop, value) {
		this.each(function (el) {
			el.css(prop, value);
		});
		return this;
	};

	win.NodeList.prototype.on = function (eventType, callback) {
		this.each(function (el) {
			el.on(eventType, callback);
		});
		return this;
	};

	win.NodeList.prototype.first = function () {
		return this.length < 2 ? this : this[0];
	};

	win.NodeList.prototype.last = function () {
		return this.length > 1 ? this[this.length - 1] : this;
	};
})(typeof window == "undefined" ? global : window);

var $ = function $(selector) {
	return dom(selector);
};
exports.$ = $;
exports['default'] = dom;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],65:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Interface = (function () {
	function Interface(name, methods) {
		_classCallCheck(this, Interface);

		if (arguments.length !== 2) {
			throw new Error("Interface constructor called with " + arguments.length + "arguments, but expected exactly 2.");
		}

		this.name = name;
		this.methods = [];

		for (var i = 0, len = methods.length; i < len; i++) {
			if (typeof methods[i] !== 'string') {
				throw new Error("Interface constructor expects method names to be passed in as a string.");
			}

			this.methods.push(methods[i]);
		}
	}

	_createClass(Interface, null, [{
		key: "ensureImplements",
		value: function ensureImplements(object) {
			if (arguments.length < 2) {
				throw new Error('Function Interface.ensureImplements called with ' + arguments.length + 'arguments, but expected at least 2.');
			}

			for (var i = 1, len = arguments.length; i < len; i++) {
				var _interface = arguments[i];
				if (_interface.constructor !== Interface) {
					throw new Error('Function Interface.ensureImplements expects arguments two and above to be instances of Interface.');
				}

				for (var j = 0, methodsLen = _interface.methods.length; j < methodsLen; j++) {
					var method = _interface.methods[j];
					if (!object[method] || typeof object[method] !== 'function') {
						throw new Error('Function Interface.ensureImplements: object does not implement the ' + _interface.name + ' interface. Method ' + method + ' was not found. ');
					}
				}
			}
			return true;
		}
	}]);

	return Interface;
})();

exports["default"] = Interface;
module.exports = exports["default"];
},{}],66:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _interface = require('./interface');

var _interface2 = _interopRequireDefault(_interface);

var Interfaces = {};

Interfaces.IDBInterface = new _interface2['default']('IDBInterface', ['getAttachment', 'saveAttachment', 'get', 'put', 'post', 'remove', 'allDocs', 'bulkDocs', 'changes']);

Interfaces.IHTTPInterface = new _interface2['default']('IHTTPInterface', ['get', 'put', 'post', 'delete', 'head', 'request']);

exports['default'] = Interfaces;
module.exports = exports['default'];
},{"./interface":65}],67:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Logger = (function () {
	function Logger() {
		var category = arguments.length <= 0 || arguments[0] === undefined ? 'log' : arguments[0];
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		_classCallCheck(this, Logger);

		this.category = category;

		var defaults = {
			colors: {
				trace: 'color:#7672E6;',
				success: 'color:#46AD00;',
				info: 'color:#005CB9;',
				warn: 'color:#FF9821;',
				fatal: 'color:#C057BA;',
				error: 'color:#E32533;',
				debug: 'color:#005CB9;'
			}
		};
		this.colors = defaults.colors;
		this.options = options;
		this.debugEnabled = options.debugEnabled || true;
		return this;
	}

	_createClass(Logger, [{
		key: 'log',
		value: function log(level, args) {
			var timestamp = new Date().toLocaleString();
			var log = window.console ? window.console.log.bind(window.console) : function () {};
			if (this.debugEnabled) {
				log('[' + timestamp + '] [' + level + '] [' + this.category + ']', arguments);
			}
		}
	}, {
		key: 'debug',
		value: function debug(args) {
			return this.log('DEBUG', args);
		}
	}, {
		key: 'info',
		value: function info(args) {
			return this.log('INFO', args);
		}
	}, {
		key: 'warn',
		value: function warn(args) {
			return this.log('WARN', args);
		}
	}, {
		key: 'error',
		value: function error(args) {
			return this.log('ERROR', args);
		}
	}, {
		key: 'logApi',
		value: function logApi(method, params, success) {
			if (!params) {
				params = {};
			}
			console.log('%c[%s:api] %s %o', success ? this.colors.success : this.colors.debug, this.category, method, params);
		}
	}, {
		key: 'logHttp',
		value: function logHttp(method, url, success) {
			console.log('%c[%s:http] %c%s %c%o', success ? this.colors.success : this.colors.info, this.category, null, method, null, url);
		}
	}, {
		key: 'logTime',
		value: function logTime(name) {
			var start = new Date();
			return {
				end: function end() {
					return new Date().getMilliseconds() - start.getMilliseconds() + 'ms';
				}
			};
		}
	}]);

	return Logger;
})();

exports['default'] = Logger;
module.exports = exports['default'];
},{}],68:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.resolveURL = resolveURL;
exports.extend = extend;
exports.extendDeep = extendDeep;
exports.extendClass = extendClass;
exports.type = type;
exports.addMixin = addMixin;
exports.debounce = debounce;
exports.mixin = mixin;
exports.mix = mix;
exports.uuid = uuid;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function resolveURL() {
	var base, i, key, len, path, queryString, value;
	base = arguments[0];
	len = arguments.length;
	queryString = '';
	i = 1;
	while (i < len) {
		path = arguments[i];
		if (!path) {
			i++;
			continue;
		}
		if (typeof path === 'object') {
			for (key in path) {
				if (queryString.length > 0) {
					queryString += '&';
				}
				value = path[key];
				queryString += key + '=' + value;
				i++;
			}
			continue;
		}
		if (path && path.indexOf('/') !== 0) {
			path = '/' + path;
		}
		if (base.substr(base.length - 1) === '/') {
			base = base.substr(0, base.length - 1);
		}
		base += path;
		i++;
	}
	if (queryString.length > 0) {
		base += '?' + queryString;
	}
	return base;
}

function extend(dest, src) {
	var out = dest;
	for (var i in src) {
		out[i] = src[i];
	}
	return out;
}

function extendDeep(parent, child) {
	var i,
	    toStr = Object.prototype.toString,
	    astr = '[object Array]';
	child = child || {};
	for (i in parent) {
		if (parent.hasOwnProperty(i)) {
			if (typeof parent[i] === 'object') {
				child[i] = toStr.call(parent[i]) === astr ? [] : {};
				extendDeep(parent[i], child[i]);
			} else {
				child[i] = parent[i];
			}
		}
	}
	return child;
}

function extendClass(child, parent) {
	var hasProp = ({}).hasOwnProperty;
	for (var key in parent) {
		if (hasProp.call(parent, key)) {
			child[key] = parent[key];
		}
	}

	function ctor() {
		this.constructor = child;
	}
	ctor.prototype = parent.prototype;
	child.prototype = new ctor();
	child.__super__ = parent.prototype;

	return child;
}

function type(obj) {
	var classToType;
	if (obj === void 0 || obj === null) {
		return String(obj);
	}
	classToType = {
		'[object Boolean]': 'boolean',
		'[object Number]': 'number',
		'[object String]': 'string',
		'[object Function]': 'function',
		'[object Array]': 'array',
		'[object Date]': 'date',
		'[object RegExp]': 'regexp',
		'[object Object]': 'object'
	};
	return classToType[Object.prototype.toString.call(obj)];
}

function addMixin(obj, mixin) {
	return this.extend(mixin, obj);
}

function debounce(name, func, wait, immediate) {
	var timeout;
	return function () {
		var context = this,
		    args = arguments;
		var later = function later() {
			timeout = null;
			if (!immediate) {
				func.apply(context, args);
			}
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) {
			func.apply(context, args);
		}
	};
}

function mixin(target, source) {
	target = target.prototype;
	source = source.prototype;

	Object.getOwnPropertyNames(source).forEach(function (name) {
		if (name !== 'constructor') {
			Object.defineProperty(target, name, Object.getOwnPropertyDescriptor(source, name));
		}
	});
}

function mix() {
	var arg,
	    prop,
	    child = {};
	for (arg = 0; arg < arguments.length; arg += 1) {
		for (prop in arguments[arg]) {
			if (arguments[arg].hasOwnProperty(prop)) {
				child[prop] = arguments[arg][prop];
			}
		}
	}
	return child;
}

var chars = ('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz').split('');

function getValue(radix) {
	return 0 | Math.random() * radix;
}

function uuid(len, radix) {
	radix = radix || chars.length;
	var out = '';
	var i = -1;

	if (len) {
		while (++i < len) {
			out += chars[getValue(radix)];
		}
		return out;
	}

	while (++i < 36) {
		switch (i) {
			case 8:
			case 13:
			case 18:
			case 23:
				out += '-';
				break;
			case 19:
				out += chars[getValue(16) & 0x3 | 0x8];
				break;
			default:
				out += chars[getValue(16)];
		}
	}

	return out;
}

function Interface(name, methods) {

	if (arguments.length !== 2) {
		throw new Error("Interface constructor called with " + arguments.length + "arguments, but expected exactly 2.");
	}

	this.name = name;
	this.methods = [];

	for (var i = 0, len = methods.length; i < len; i++) {
		if (typeof methods[i] !== 'string') {
			throw new Error("Interface constructor expects method names to be passed in as a string.");
		}

		this.methods.push(methods[i]);
	}
}

Interface.ensureImplements = function (object) {
	if (arguments.length < 2) {
		throw new Error('Function Interface.ensureImplements called with ' + arguments.length + 'arguments, but expected at least 2.');
	}

	for (var i = 1, len = arguments.length; i < len; i++) {
		var _interface = arguments[i];
		if (_interface.constructor !== Interface) {
			throw new Error('Function Interface.ensureImplements expects arguments two and above to be instances of Interface.');
		}

		for (var j = 0, methodsLen = _interface.methods.length; j < methodsLen; j++) {
			var method = _interface.methods[j];
			if (!object[method] || typeof object[method] !== 'function') {
				throw new Error('Function Interface.ensureImplements: object does not implement the ' + _interface.name + ' interface. Method ' + method + ' was not found. ');
			}
		}
	}
	return true;
};

var aggregation = function aggregation(baseClass) {
	for (var _len = arguments.length, mixins = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		mixins[_key - 1] = arguments[_key];
	}

	var base = (function (_baseClass) {
		_inherits(_Combined, _baseClass);

		function _Combined() {
			var _this = this;

			_classCallCheck(this, _Combined);

			for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				args[_key2] = arguments[_key2];
			}

			_get(Object.getPrototypeOf(_Combined.prototype), 'constructor', this).apply(this, args);
			mixins.forEach(function (mixin) {
				mixin.prototype.initializer.call(_this);
			});
		}

		return _Combined;
	})(baseClass);
	var copyProps = function copyProps(target, source) {
		Object.getOwnPropertyNames(source).concat(Object.getOwnPropertySymbols(source)).forEach(function (prop) {
			if (prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
				return;
			}

			Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
		});
	};
	mixins.forEach(function (mixin) {
		copyProps(base.prototype, mixin.prototype);
		copyProps(base, mixin);
	});
	return base;
};
exports.aggregation = aggregation;
},{}],69:[function(require,module,exports){
'use strict';

require('../src/index');
require('./setup');

require('./specs/app-spec');
require('./specs/base-class-spec');
require('./specs/collection-spec');
require('./specs/core-spec');
require('./specs/db-spec');
require('./specs/dom-spec');
require('./specs/http-spec');
require('./specs/log-spec');
require('./specs/model-spec');
require('./specs/page-spec');
require('./specs/pages-spec');
require('./specs/pubsub-spec');
require('./specs/router-spec');
require('./specs/simple-router-spec');
require('./specs/utils-spec');
require('./specs/view-spec');
require('./specs/views-spec');
},{"../src/index":56,"./setup":70,"./specs/app-spec":71,"./specs/base-class-spec":72,"./specs/collection-spec":73,"./specs/core-spec":74,"./specs/db-spec":75,"./specs/dom-spec":76,"./specs/http-spec":77,"./specs/log-spec":78,"./specs/model-spec":79,"./specs/page-spec":80,"./specs/pages-spec":81,"./specs/pubsub-spec":82,"./specs/router-spec":83,"./specs/simple-router-spec":84,"./specs/utils-spec":85,"./specs/view-spec":86,"./specs/views-spec":87}],70:[function(require,module,exports){
(function (process,global){
'use strict';

if (typeof process === 'object') {
  global.expect = require('chai').expect;
  require('mocha-jsdom')();
} else {
  window.expect = window.chai.expect;
  window.require = function () {};
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":40,"chai":4,"mocha-jsdom":39}],71:[function(require,module,exports){
'use strict';

describe('pxMobile.App', function () {
  var app = new pxMobile.App('app', {
    debug: true,
    session: null
  });
});
},{}],72:[function(require,module,exports){
'use strict';

describe('pxMobile.BaseClass', function () {
  var myClass = new pxMobile.BaseClass('BaseClass');

  it('constructor()', function () {
    assert.ok(myClass, 'Should ..');
  });

  it('log - object should be present', function () {
    assert.ok(myClass.log, 'should have log object');
  });
});
},{}],73:[function(require,module,exports){
'use strict';

describe('pxMobile.Collection', function () {
  var collection = null;
  beforeEach(function () {
    collection = new pxMobile.Collection('myCollection', {
      url: '/default',
      idField: '_id',
      defaults: {
        _id: 'test-doc1',
        _rev: null,
        name: 'test doc',
        title: 'some document',
        type: 'doc',
        channels: ['*']
      }
    });
  });

  it('should set passed properties on collection', function (done) {
    assert.equal(collection.url, '/default');
    done();
  });
});
},{}],74:[function(require,module,exports){
'use strict';

describe('pxMobile.Core', function () {

  var sandbox = new pxMobile.Core('sandbox', {});
  var mockService = {
    method1: sinon.spy()
  };

  var service1 = function service1() {
    console.log('service 1 created');
    return this;
  };

  before(function (done) {
    sandbox.register('service1', service1);
    done();
  });

  it('should return module', function (done) {
    done();
  });

  it('start()', function () {
    assert.ok(sandbox.start, 'Should start');
  });

  it('stop()', function () {
    assert.ok(sandbox.stop, 'Should stop');
  });
});
},{}],75:[function(require,module,exports){
'use strict';

function PouchDbAdapter(name, options) {
  PouchDB.debug('*');
  var _db = new PouchDB(name, options);

  var adapter = {
    parseJSON: function parseJSON(resp) {
      console.log('Pouchdb response', resp);
      return {
        status: 'ok',
        data: resp
      };
    },
    get: function get(url, args) {
      return _db.get(args).then(this.parseJSON);
    },
    put: function put(url, args) {
      return _db.get(args).then(this.parseJSON);
    },
    info: function info() {
      return _db.info().then(this.parseJSON);
    }
  };

  return adapter;
}

describe('pxMobile.DB', function () {

  var DATABASE_URL = 'http://localhost:5984/default';
  var TEST_IDS = window.TEST_IDS = [];

  var sandbox = sinon.sandbox;
  var db = null,
      testAttachmentDoc = 'test-doc-attachment-' + Date.now(),
      successCallback,
      errorCallback,
      testObj = {
    _id: 'test-' + Date.now(),
    title: 'Test Doc'
  },
      docs = [{
    _id: 'test-doc-1-' + Date.now(),
    name: 'Test Doc 1'
  }, {
    _id: 'test-doc-2-' + Date.now(),
    name: 'Test Doc 2'
  }, {
    _id: 'test-doc-3-' + Date.now(),
    name: 'Test Doc 3'
  }];

  function removeDoc(id) {
    return db.get(id).then(function (resp) {
      return db.remove(resp.data._id, resp.data._rev).then(function (res) {
        console.warn('Removed', res.data);
        return res;
      });
    });
  }

  before(function () {
    sandbox.useFakeServer();
    this.server = sinon.fakeServer.create();
    db = db = new pxMobile.DB('testdb', {
      baseUrl: DATABASE_URL
    });
  });

  after(function () {
    console.warn('Cleanup docs', TEST_IDS);
    TEST_IDS.forEach(function (id) {
      removeDoc(id);
    });
  });

  it('should be defined', function () {
    assert.ok(pxMobile.DB);
  });

  it('should have methods: allDocs, get, put, post, remove, bulkDocs, getAttachment, saveAttachment', function (done) {
    assert.ok(db.allDocs);
    assert.ok(db.get);
    assert.ok(db.post);
    assert.ok(db.put);
    assert.ok(db.remove);
    assert.ok(db.getAttachment);
    assert.ok(db.saveAttachment);
    done();
  });

  xdescribe('Adapter', function () {

    var mockPromise = function mockPromise(resp, time) {
      return new Promise(function (resolve, reject) {
        return setTimeout(function () {
          return resolve(resp);
        }, time || 100);
      });
    };

    var mockAdapter = function mockAdapter(name, options) {
      return {
        get: mockPromise(sinon.spy()),
        put: mockPromise(sinon.spy()),
        post: sinon.spy(),
        'delete': sinon.spy(),
        request: sinon.spy(),
        allDocs: sinon.spy()
      };
    };

    it('should be able to use an adapter', function () {
      var localDb = localDb = new pxMobile.DB('localDb', {
        baseUrl: DATABASE_URL || '/default',
        adapter: new mockAdapter('test', {})
      });

      localDb.get('test');
      localDb.put({
        _id: 'test'
      });
      localDb.post({
        name: 'test 3'
      });
      localDb.allDocs({
        include_docs: true
      });
      assert.ok(localDb.adapter.get.called);
      assert.ok(localDb.adapter.put.called);
      assert.ok(localDb.adapter.post.called);
      assert.ok(localDb.adapter.allDocs.called);
    });
  });

  it('info() - should resolve promise on success with database info', function (done) {
    db.info().then(function (resp) {
      assert.equal(resp.status, 200);
      assert.ok(resp.data);
      assert.ok(resp.data.db_name);
      assert.ok(resp.data.update_seq);

      done();
    }, failSpec);
  });

  it('bulkDocs(docs) - should resolve promise on success', function (done) {
    db.bulkDocs(docs).then(function (resp) {
      docs = resp.data;
      assert.equal(resp.status, 201);
      assert.equal(resp.data.length, 3);
      resp.data.forEach(function (row) {
        TEST_IDS.push(row.id);
      });
      done();
    }, failSpec);
  });

  it('bulkDocs(docs) - should remove doc if _delete flag is set', function (done) {
    docs.forEach(function (doc) {
      if (doc._rev) {
        doc._deleted = true;
      }
    });
    db.bulkDocs(docs).then(function (resp) {
      docs = resp.data;
      assert.equal(resp.status, 201);
      assert.equal(resp.data.length, 3);
      resp.data.forEach(function (row) {
        TEST_IDS.push(row.id);
      });
      done();
    }, failSpec);
  });

  it('allDocs(options) - should resolve promise on success', function (done) {
    db.allDocs({
      limit: 5
    }).then(function (resp) {
      assert.equal(resp.status, 200);
      assert.ok(resp.data.rows);
      assert.equal(resp.data.rows.length, 5);
      done();
    }, failSpec);
  });

  it('put(doc) - should resolve promise on success', function (done) {
    db.put(testObj).then(function (resp) {
      assert.equal(resp.status, 201);
      assert.ok(resp.data.rev);
      TEST_IDS.push(resp.data.id);
      done();
    });
  });

  it('get(id) - should resolve promise on success', function (done) {
    db.get(testObj._id).then(function (resp) {
      assert.equal(resp.status, 200);
      assert.ok(resp.data._rev);
      done();
    }, failSpec);
  });

  it('get(id) - should reject promise on error', function (done) {
    db.get('unknown-id').then(function (resp) {
      assert.equal(resp.status, 404);
      failSpec();
      done();
    }, function (resp) {
      assert.equal(resp.status, 404);
      done();
    });
  });

  it('remove(id, rev) - should resolve promise on success', function (done) {
    db.get(testObj._id).then(function (resp) {
      testObj._rev = resp.data._rev;
      db.remove(testObj._id, testObj._rev).then(function (res) {
        assert.equal(res.status, 200);
        done();
      }, failSpec);
    });
  });

  var newDocId = '';

  it('post(doc) - should insert document with generated id and resolve promise on success.', function (done) {
    db.post({
      title: 'New Doc'
    }).then(function (resp) {
      assert.equal(resp.status, 201);
      assert.ok(resp.data.id);
      assert.ok(resp.data.rev);
      db.remove(resp.data.id, resp.data.rev).then(function (res) {
        assert.equal(res.status, 200);
        TEST_IDS.push(resp.data.id);
        done();
      }, failSpec);
    }, failSpec);
  });

  it('saveAttachment(id, rev, filename, type, file) - should save file attachment', function (done) {
    var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
    var myBlob = new Blob(aFileParts, {
      type: 'text/html'
    });
    db.put({
      _id: testAttachmentDoc
    }).then(function (resp) {
      assert.equal(resp.ok, true);
      db.get(testAttachmentDoc).then(function (resp) {
        assert.equal(resp.ok, true);
        db.saveAttachment(resp.data._id, resp.data._rev, 'file.html', myBlob.type, myBlob).then(function (resp) {
          assert.equal(resp.ok, true);
          TEST_IDS.concat(resp.data);
          done();
        }, failSpec);
      }, failSpec);
    }, failSpec);
  });

  it('getAttachment(id, filename) - should return file attachment', function (done) {
    db.getAttachment(testAttachmentDoc, 'file.html').then(function (resp) {
      assert.equal(resp.ok, true);
      db.get(testAttachmentDoc).then(function (res) {
        assert.equal(res.ok, true);
        db.remove(res.data._id, res.data._rev).then(function (re) {
          assert.equal(re.status, 200);
          done();
        }, failSpec);
      }, failSpec);
    }, failSpec);
  });

  describe('Changes', function () {
    var changes,
        changeHandlers = {};

    beforeEach(function () {});

    afterEach(function () {});

    it('changes() - should request changes and invoke callbacks on events', function (done) {
      changeHandlers.changeHandler = sinon.spy();
      changeHandlers.completeHandler = sinon.spy();
      changeHandlers.errorHandler = sinon.spy();
      changes = db.changes({
        since: 'now',
        live: true,
        interval: 100,
        include_docs: true
      }).on('change', changeHandlers.changeHandler).on('complete', changeHandlers.completeHandler).on('error', changeHandlers.errorHandler);

      setTimeout(function () {
        console.warn(changeHandlers.changeHandler);
        assert.ok(changeHandlers.changeHandler);
        changes.cancel();
        done();
      }, 100);
    });
  });

  describe('Error Handling', function () {
    it('get() - should throw error if no {_id: 0} is passed', function () {
      assert.throws(function () {
        db.get();
      });
    });

    it('remove() - should throw error if no params is passed', function () {
      assert.throws(function () {
        db.remove();
      });
    });

    it('remove() - should throw error if no _id is passed', function () {
      assert.throws(function () {
        db.remove({});
      });
    });

    it('put() - should throw error if no params is passed', function () {
      assert.throws(function () {
        db.put();
      });
    });

    it('put() - should throw error if no _id is passed', function () {
      assert.throws(function () {
        db.put({});
      });
    });
  });
});
},{}],76:[function(require,module,exports){
"use strict";

describe('pxMobile.DOM', function () {
  var el = null;

  before(function () {
    var currentDiv = document.getElementById("mocha");
    var newDiv = document.createElement("div");
    newDiv.id = 'sandbox';
    document.body.insertBefore(newDiv, currentDiv);

    el = pxMobile.$('#sandbox');
  });

  it('Element.addClass(className) - should add the class to the element.', function () {
    el.addClass('testing');
    expect(el.className).to.contain('testing');
  });
  it('Element.removeClass(className) - should remove the class to the element.', function () {
    el.removeClass('testing');
    expect(el.className).not.to.contain('testing');
  });
  it('Element.toggleClass(className) - should add/remove class from element', function () {
    el.toggleClass('sandbox');
    expect(el.className).to.contain('sandbox');
    el.toggleClass('sandbox');
    expect(el.className).not.to.contain('sandbox');
  });
  it('Element.hasClass(className) - should add the class to the element.', function () {
    el.addClass('testing');
    assert.equal(el.hasClass('testing'), true);
    el.removeClass('testing');
    assert.equal(el.hasClass('testing'), false);
  });

  it('Element.attr(name, value) - should get/set the attribute on the element.', function () {
    el.attr('title', 'Test Element');
    expect(el.attr('title')).to.be('Test Element');
  });

  it('Element.html() - should get/set the html in the element.', function () {
    el.html('<h1>Sandbox</h1>');
    expect(el.html()).to.contain('<h1>Sandbox</h1>');
  });
  it('Element.text() - should get/set the text content in the element.', function () {
    expect(el.text()).to.contain('Sandbox');
  });

  it('dom.extend({}, obj1, obj2) - should return extended object.', function () {
    var obj = {};
    var obj1 = {
      version: '1.0'
    };
    var obj2 = {
      debug: true
    };
    pxMobile.dom.extend(obj, obj1, obj2);

    assert.ok(obj.version);
    assert.ok(obj.debug);
  });
  it('dom.extend({}, obj1, obj2) - should return extended nested object.', function () {
    var obj = {};
    var obj1 = {
      version: '1.0',
      session: {
        user: {
          username: 'jonnie'
        }
      }
    };
    var obj2 = {
      debug: true,
      auth: {
        login: function login() {},
        logout: function logout() {}
      }
    };
    pxMobile.dom.extend(obj, obj1, obj2);

    assert.ok(obj.version);
    assert.ok(obj.debug);
    assert.ok(obj.session);
    assert.ok(obj.session.user.username);
    assert.ok(obj.auth.login);
    assert.ok(obj.auth.logout);
  });
});
},{}],77:[function(require,module,exports){
'use strict';

describe('pxMobile.HTTP', function () {
  var DATABASE_URL = 'http://localhost:5984/default';
  var http = null,
      mockDoc = {};
  before(function () {
    http = new pxMobile.HTTP('http1', {
      baseUrl: DATABASE_URL
    });
  });

  beforeEach(function () {});

  afterEach(function () {});

  it('should be defined', function () {
    assert.ok(pxMobile.HTTP);
  });

  it('should have: put, post, delete, get, head, request', function (done) {
    assert.ok(http.put);
    assert.ok(http.post);
    assert.ok(http['delete']);
    assert.ok(http.get);
    assert.ok(http.head);
    assert.ok(http.request);
    done();
  });

  it('post(url, options) - should resolve promise on success', function (done) {
    mockDoc._id = 'test-doc-' + Date.now();
    http.put('/' + mockDoc._id, mockDoc).then(function (resp) {
      assert.equal(resp.status, 201);
      done();
    }, window.failSpec);
  });

  it('get(url, options) - should resolve promise on success', function (done) {
    http.get('/' + mockDoc._id).then(function (resp) {
      assert.equal(resp.status, 200);
      mockDoc = resp.data;
      done();
    }, window.failSpec);
  });

  it('put(url, options) - should resolve promise on success', function (done) {
    mockDoc.title = 'Updated at ' + Date.now();
    http.put('/' + mockDoc._id + '?rev=' + mockDoc._rev, mockDoc).then(function (resp) {
      assert.equal(resp.status, 201);
      done();
    }, window.failSpec);
  });

  it('head(url, options) - should resolve promise on success', function (done) {
    http.head('/' + mockDoc._id).then(function (resp) {
      assert.equal(resp.status, 200);
      done();
    }, window.failSpec);
  });

  it('delete(url, options) - should resolve promise on success', function (done) {
    http.get('/' + mockDoc._id).then(function (resp) {
      http['delete'](mockDoc._id, {
        params: {
          rev: resp.data._rev
        }
      }).then(function (resp) {
        assert.equal(resp.status, 200);
        done();
      }, window.failSpec);
    });
  });
});
},{}],78:[function(require,module,exports){
'use strict';

describe('pxMobile.Logger', function () {
  it('should be defined', function () {
    expect(pxMobile.Logger);
  });
  describe('new pxMobile.log()', function () {
    var logger = null;
    beforeEach(function () {
      logger = new pxMobile.Logger('jasmine');
    });
    it('should have methods: info, warn, debug, error', function (done) {
      assert.ok(logger.info);
      assert.ok(logger.warn);
      assert.ok(logger.debug);
      assert.ok(logger.error);
      done();
    });
    it('info() - should log info to console', function (done) {
      logger.info('test');
      assert.ok(logger.log);
      done();
    });
    it('warn() - should log warn to console', function (done) {
      logger.warn('test');
      assert.ok(logger.log);
      done();
    });
    it('debug() - should log debug to console', function (done) {
      logger.debug('test');
      assert.ok(logger.log);
      done();
    });
    it('error() - should log error to console', function (done) {
      logger.error('test');
      assert.ok(logger.log);
      done();
    });
  });
});
},{}],79:[function(require,module,exports){
'use strict';

var DATABASE_URL = 'http://localhost:5984/default';

describe('pxMobile.Model', function () {
  var model = null,
      id;

  before(function () {
    id = 'test-doc-' + pxMobile.utils.uuid();
    model = model = new pxMobile.Model(id, {
      baseUrl: DATABASE_URL,
      idField: '_id',
      data: {
        _id: id,
        _rev: null,
        name: 'test doc'
      }
    });
  });

  it('url() - should return url of model', function (done) {
    expect(model.url()).to.contain('' + model.get('_id'));
    done();
  });

  it('get(name) - should get properties on object', function (done) {
    expect(model.get('name')).to.contain('test doc');
    done();
  });

  it('set({name: value}) - should selected properties on object', function (done) {
    model.set({
      name: 'new name'
    });
    expect(model.get('name')).to.contain('new name');
    done();
  });

  it('toJSON() - should return object properties as JSON', function (done) {
    expect(model.toJSON()).to.contain(JSON.stringify(model.data));
    done();
  });

  it('has(prop) - should return true/false if property exists', function (done) {
    assert.equal(model.has('title'), false);
    assert.equal(model.has('name'), true);
    done();
  });

  it('subscribe(event, cb) - should register callback for event', function (done) {
    model.set({
      'title': 'test'
    });
    model.subscribe('change', function (d) {
      assert.ok(d);
      done();
    });
    model.publish('change', {
      name: 'value'
    });
  });

  describe('CRUD', function () {
    beforeEach(function () {
      console.log(model);
    });

    it('save() - should make a http request and return response', function (done) {
      model.save().then(function (resp) {
        assert.equal(resp.status, 201);
        done();
      }, window.failSpec);
    });

    it('fetch() - should make a http request and return response', function (done) {
      model.fetch().then(function (resp) {
        model.set(resp.data);
        assert.equal(resp.status, 200);
        done();
      }, window.failSpec);
    });

    it('destroy() - should make a DELETE request and return response', function (done) {
      model.destroy().then(function (resp) {
        assert.equal(resp.status, 200);
        done();
      }, window.failSpec);
    });
  });
});
},{}],80:[function(require,module,exports){
'use strict';

describe('pxMobile.Page', function () {
  var app = new pxMobile.Interface('app', ['method1']);

  it('constructor()', function () {
    assert.ok(true, 'Should ..');
  });
});
},{}],81:[function(require,module,exports){
'use strict';

describe('pxMobile.Pages', function () {
  var app = new pxMobile.Interface('app', ['method1']);

  it('constructor()', function () {
    assert.ok(true, 'Should ..');
  });
});
},{}],82:[function(require,module,exports){
'use strict';

describe('pxMobile.PubSub', function () {

  var pubsub = new pxMobile.PubSub();

  it('constructor()', function () {
    assert.ok(pubsub);
  });
});
},{}],83:[function(require,module,exports){
'use strict';

describe('pxMobile.Router', function () {
  var app = new pxMobile.App(),
      db = null,
      successCallback,
      errorCallback,
      testObj = {
    _id: 'test-' + Date.now(),
    title: 'Test Doc'
  },
      myRouter = null,
      routeCallback = function routeCallback() {},
      routeHandlers = {};
  routeHandlers.homeRoute = function () {};
  routeHandlers.aboutRoute = function () {};
  routeHandlers.listRoute = function () {};
  routeHandlers.detailRoute = function () {};

  myRouter = new pxMobile.Router('app', {
    routes: {
      '/': routeHandlers.homeRoute
    }
  });
  myRouter.start();

  beforeEach(function () {});

  it('should be defined', function (done) {
    assert.ok(pxMobile.Router);
    done();
  });

  it('should have routes defined', function (done) {
    window.myRouter = myRouter;
    assert.ok(myRouter.routes);
    done();
  });

  xit('on(route, cb) - invokes route when matched', function (done) {
    myRouter.on('/about', function (req, res) {
      expect(req).toBeDefined();
      expect(res).toBeDefined();
      done();
    });
    myRouter.navigate('/about');
  });

  xit('on("/users/:action/:id", callback) - should invoke callback if route matches', function (done) {
    myRouter.on('/users/:action/:id', function (req, res) {
      console.warn('callback', req, res);
      expect(req).toBeDefined();
      expect(res).toBeDefined();
      expect(req.url).toBe(window.location.origin + '/users/edit/99');
      expect(req.pathname).toBe('/users/edit/99');
      expect(req.params.action).toBe('edit');
      expect(req.params.id).toBe('99');
      done();
    });

    myRouter.navigate('/users/edit/99', {
      data: testObj
    });
  });

  xit('when(route) - should resolve promise when hash matches', function (done) {
    app.services.resolve('router').when('/posts').then(function (req, res) {
      expect(res).toBeDefined();
      expect(req).toBeDefined();
      done();
    });
    app.services.resolve('router').navigate('/posts');
  });

  xit('should resolve route once resolve property is resolved', function (done) {
    app.services.register('router', new pxMobile.Router('default', {
      routes: {
        '/login': {
          callback: function callback(req, res) {
            expect(req.users).toBeDefined();
            console.warn('route callback', req, res);
            done();
          },
          resolve: {
            users: function users() {
              return new Promise(function (resolve, reject) {
                setTimeout(function () {
                  resolve({});
                }, 1000);
              });
            }
          }
        }
      }
    }));
    app.services.resolve('router').navigate('/login');
  });
});
},{}],84:[function(require,module,exports){
'use strict';

describe('Simple Router', function () {
  var testRouter,
      routerSpies = {};
  testRouter = new pxMobile.SimpleRouter('test', {
    mode: 'hash'
  });

  before(function (done) {
    routerSpies.aboutRoute = sinon.spy();
    routerSpies.productsRoute = sinon.spy();
    routerSpies.defaultRoute = sinon.spy();

    testRouter.add(/about/, routerSpies.aboutRoute).add(/^\/products\/(?:([^\/]+?))\/(?:([^\/]+?))\/?$/, routerSpies.productsRoute).add(routerSpies.defaultRoute).listen();
    done();
  });

  it('should invoke default route callback', function (done) {
    testRouter.check('/');
    assert.ok(routerSpies.defaultRoute.called);
    done();
  });

  it('should invoke /about route callback', function (done) {
    testRouter.check('/about');
    assert.ok(routerSpies.aboutRoute.called);
    done();
  });

  it('should invoke /products/1/edit route callback', function (done) {
    testRouter.check('/products/1/edit');
    assert.ok(routerSpies.productsRoute.called);
    done();
  });
});
},{}],85:[function(require,module,exports){
'use strict';

describe('pxMobile.utils', function () {
  it('should be defined', function () {
    assert.ok(pxMobile.utils);
  });
  it('extend(o1, o2) - should copy all properties from right to left.', function (done) {
    var obj1 = {
      name: 'jonnie'
    };
    var obj2 = {
      age: 28
    };
    var result = pxMobile.utils.extend(obj1, obj2);
    assert.equal(result.age, 28);
    assert.equal(result.name, 'jonnie');
    done();
  });

  it('mix - should mix (x) objects into one', function (done) {
    var cake = pxMobile.utils.mix({
      eggs: 2,
      large: true
    }, {
      butter: 1,
      salted: true
    }, {
      flour: '3 cups'
    }, {
      sugar: 'sure!'
    });
    assert.equal(cake.eggs, 2);
    assert.equal(cake.salted, true);
    assert.equal(cake.flour, '3 cups');
    done();
  });
});
},{}],86:[function(require,module,exports){
'use strict';

describe('pxMobile.View', function () {
  it('should be defined', function () {
    assert.ok(pxMobile.View);
  });
});
},{}],87:[function(require,module,exports){
'use strict';

describe('pxMobile.Views', function () {
  it('should be defined', function () {
    assert.ok(pxMobile.Views);
  });
  describe('Views', function () {
    var appViews = null;
    var exampleViews = [{
      id: 'view0',
      title: 'view 0'
    }, {
      id: 'view1',
      title: 'view 1'
    }, {
      id: 'view2',
      title: 'view 2'
    }, {
      id: 'view3',
      title: 'view 3'
    }, {
      id: 'view4',
      title: 'view 4'
    }, {
      id: 'view5',
      title: 'view 5'
    }];

    beforeEach(function () {
      appViews = new pxMobile.Views({
        id: 'appjsViews',
        selected: '0',
        views: exampleViews
      });
    });

    it('should select the correct view', function () {
      assert.equal(appViews.getSelectedIndex(), 0);
      appViews.selectView('view1');
      assert.equal(appViews.getSelectedIndex(), 1);
      assert.equal(appViews.selected, 1);
    });

    it('nextView() - should select next view and not loop.', function () {
      assert.equal(appViews.getSelectedIndex(), 0);
      assert.equal(appViews.nextView(), 1);
      assert.equal(appViews.nextView(), 2);
      assert.equal(appViews.nextView(), 3);
      assert.equal(appViews.nextView(), 4);
      assert.equal(appViews.nextView(), 5);
      assert.equal(appViews.nextView(), 0);
      assert.equal(appViews.nextView(), 1);
    });

    it('prevView() - should select the prev view.', function () {
      assert.equal(appViews.nextView(), 1);
      assert.equal(appViews.nextView(), 2);
      assert.equal(appViews.nextView(), 3);
      assert.equal(appViews.nextView(), 4);
      assert.equal(appViews.nextView(), 5);
      assert.equal(appViews.prevView(), 4);
      assert.equal(appViews.prevView(), 3);
      assert.equal(appViews.prevView(), 2);
      assert.equal(appViews.prevView(), 1);
      assert.equal(appViews.prevView(), 0);
      assert.equal(appViews.prevView(), 0);
    });
  });
});
},{}]},{},[69]);