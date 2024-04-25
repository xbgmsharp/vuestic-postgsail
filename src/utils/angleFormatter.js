export const appWindAngle = (twd, cog) => {
  let awa = (twd - cog + 360) % 360
  let tack = awa > 180 ? 'p' : 's'
  if (awa > 180) {
    awa = 360 - awa
  }
  return [awa, tack]
}

export const sailConfigImage = (twd, cog) => {
  const [awa, tack] = appWindAngle(twd, cog)
  if (awa > 155) {
    return `/sailboat-180${tack}.png` // running
  } else if (awa > 110) {
    return `/sailboat-135${tack}.png` // broad reaching
  } else if (awa > 50) {
    return `/sailboat-090${tack}.png` // close/beam reaching
  } else if (awa > 25) {
    return `/sailboat-045${tack}.png` // close-hauled, beating
  } else {
    return '/sailboat.png'
  }
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
