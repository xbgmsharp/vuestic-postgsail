export const appWindAngle = (twd, cog) => {
  let awa = (twd - cog + 360) % 360
  let tack = awa > 180 ? 'p' : 's'
  if (awa > 180) {
    awa = 360 - awa
  }
  return [awa, tack]
}

export const angleFormat = (val) => {
  if (!val) return null
  const deg = parseFloat(val)
  return Math.round(deg) + '°'
}

export const awaFormat = (twd, cog) => {
  if (!twd || !cog) return null
  const [awa, tack] = appWindAngle(twd, cog)
  return angleFormat(awa) + ' ' + tack.toUpperCase()
}
