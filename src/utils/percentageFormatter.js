export const floatToPercentage = (val) => {
  if (val == null) {
    return null
  }
  return parseFloat(val * 100).toFixed(2)
}
