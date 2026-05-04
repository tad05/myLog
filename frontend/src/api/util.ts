export function cleanUndefinedParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v !== undefined && v !== 'undefined',
    ),
  )
}
