/* Credits https://github.com/sindresorhus/is-stream*/

/**
 * Determines whether an object is a stream
 * @param stream
 */
export function isStream(stream: unknown) {
  return (
    stream !== null &&
    typeof stream === 'object' &&
    typeof (stream as any).pipe === 'function'
  )
}

/**
 * Determines whether an object is a writable stream
 * @param stream
 */
export function isWritableStream(stream: unknown) {
  return (
    isStream(stream) &&
    (stream as any).writable !== false &&
    typeof (stream as any)._write === 'function' &&
    typeof (stream as any)._writableState === 'object'
  )
}

/**
 * Determines whether an object is a readable stream
 * @param stream
 */
export function isReadableStream(stream: unknown) {
  return (
    isStream(stream) &&
    (stream as any).readable !== false &&
    typeof (stream as any)._read === 'function' &&
    typeof (stream as any)._readableState === 'object'
  )
}

/**
 * Determines whether an object is a duplex stream
 * @param stream
 */
export function isDuplexStream(stream: unknown) {
  return isWritableStream(stream) && isReadableStream(stream)
}

/**
 * Determine whether an object is a transform stream
 * @param stream
 */
export function isTransformStream(stream: unknown) {
  return (
    isDuplexStream(stream) && typeof (stream as any)._transform === 'function'
  )
}
