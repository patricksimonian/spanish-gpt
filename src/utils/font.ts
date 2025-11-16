

export const adjustFontSizeByTextLength = (text: string, threshold: number, defaultSize: number, minSize: number): number => {
    const l = text.length
    if (l <= threshold) return defaultSize

    const p = threshold / l

    const size = Math.floor(p * defaultSize)

    return size < minSize ? minSize : size
}
