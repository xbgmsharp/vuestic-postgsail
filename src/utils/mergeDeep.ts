// adapted src: https://stackoverflow.com/a/34749873

import type { JSObj } from '../data/types'

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: JSObj): boolean {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export default function mergeDeep(target: JSObj, ...sources: JSObj[]): JSObj {
  if (!sources.length) return target
  const source = sources.shift() as JSObj
  for (const key of Object.getOwnPropertyNames(source)) {
    if (isObject(source[key])) {
      if (!target[key]) target[key] = {}
      mergeDeep(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}
