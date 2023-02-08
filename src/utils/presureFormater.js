export const pascalToHectoPascal = (pa) => {
  if (pa == null) {
    return null
  }
  return Math.round((pa / 100) * 10) / 10
}
