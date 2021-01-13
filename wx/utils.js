/**
 * node 转换
 * AbC =》 ab-c
 * Image => image
 * @param {*} str
 */
export function transformCase(str) {
  return str
    .replace(str.charAt(0), str.charAt(0).toLowerCase())
    .replace(/[A-Z]/g, ($1) => $1.replace($1, `-${$1.toLowerCase()}`))
}
