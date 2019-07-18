/**
 * Function flattens metadata into a dictionary that maps a node name to its individual data rather than
 * having objects nested and nested into one another.
 * @param {*Object} metadata
 */
export const flattenMetadata = metadata => {
  const nodeDictionary = {}
  const calls = metadata.data.calls

  Object.keys(calls)
    .filter(singleCall => calls.hasOwnProperty(singleCall))
    .forEach(singleCall => {})
}
