export function isUnauthorized(errMsg: string): boolean {
  return errMsg.toLowerCase().includes("unauthorized");
}

export function isForbidden(errMsg: string): boolean {
  return errMsg.toLowerCase().includes("forbidden");
}
