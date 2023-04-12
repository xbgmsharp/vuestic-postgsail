import type { Ref } from 'vue'
export default async function asBusy(isBusy: Ref, apiError: Ref, fn: any, ...args: [any]) {
  isBusy.value = true
  apiError.value = null
  try {
    fn(...args)
  } catch (err) {
    apiError.value = err
  }
  isBusy.value = false
}
