export function authMessage(address: string, nonce: string, domain: string, uri: string) {
  return `${domain} wants you to sign in with your Solana account:\n${address}\n\nSign in to First. This request will not trigger a blockchain transaction or cost any gas.\n\nURI: ${uri}\nNonce: ${nonce}`;
}
