export function sessionSecretReady(environment: NodeJS.ProcessEnv = process.env) {
  return environment.NODE_ENV !== "production" || (environment.SESSION_SECRET?.length ?? 0) >= 32;
}
