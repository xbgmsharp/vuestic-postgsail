// src: https://stackoverflow.com/a/34749873
//  + TS & export default

import '../data/types.ts'

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: JSObj) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export default function mergeDeep(target: JSObj, ...sources: JSObj[]) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeDeep(target, ...sources)
}
