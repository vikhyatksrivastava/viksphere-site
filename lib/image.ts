export function resolveImage(src?: string | null) {
  if (!src) return src
  // If it's an absolute URL pointing to the R2 account, rewrite to our presign proxy.
  // Handle both forms:
  //  - https://{bucket}.{account}.r2.cloudflarestorage.com/{key}
  //  - https://{account}.r2.cloudflarestorage.com/{bucket}/{key}
  if (/^https?:\/\//i.test(src)) {
    try {
      const url = new URL(src)
      const hostname = url.hostname
      const pathname = url.pathname.replace(/^\/+/, '') // remove leading slash
      const accountId = process.env.R2_ACCOUNT_ID || ''
      const bucketEnv = process.env.R2_BUCKET || ''

      // If hostname contains the account id (account-based host), treat as R2 URL
      if (accountId && hostname.includes(accountId)) {
        let key = pathname
        // If bucket is expressed as subdomain (e.g., images.{account}.r2...), extract it
        const hostParts = hostname.split('.')
        const possibleBucket = hostParts[0]
        if (bucketEnv && possibleBucket === bucketEnv) {
          // bucket was in subdomain, path is the key
          key = pathname
        } else if (!bucketEnv && possibleBucket && possibleBucket !== accountId) {
          // no bucket env, but subdomain looks like bucket
          key = pathname
        } else {
          // bucket might be in the path as first segment
          const parts = pathname.split('/')
          if (parts.length > 1 && parts[0]) {
            // if the first part equals the configured bucket, strip it
            if (bucketEnv && parts[0] === bucketEnv) {
              key = parts.slice(1).join('/')
            } else if (!bucketEnv) {
              // if no bucket env, assume first part is bucket and strip it
              key = parts.slice(1).join('/')
            }
          }
        }

        if (key) return `/api/r2?key=${encodeURIComponent(key)}`
      }
    } catch (e) {
      // fall through
    }
    // Not recognized as our R2 account URL — return as-is
    return src
  }

  const base = process.env.NEXT_PUBLIC_IMAGE_BASE || ''
  // Normalize leading slashes
  const cleaned = src.replace(/^public[\\/]/, '/').replace(/^([^/])/, (s) => '/' + s)

  if (base && cleaned.startsWith('/')) {
    // ensure no duplicate slashes
    return base.replace(/\/$/, '') + cleaned
  }

  // When no public base is configured, route through the server API
  // that will generate a presigned R2 URL for the object key.
  // Strip leading slash for the key
  let key = cleaned.replace(/^\//, '')
  // If the key accidentally includes the bucket name as a prefix (e.g. "images/"), remove it
  try {
    const bucketName = process.env.R2_BUCKET
    if (bucketName && key.startsWith(bucketName + '/')) {
      key = key.slice((bucketName + '/').length)
    }
  } catch (e) {
    // ignore
  }
  return `/api/r2?key=${encodeURIComponent(key)}`
}

export function isExternalImage(src?: string | null) {
  if (!src) return false
  if (/^https?:\/\//i.test(src)) return true
  // Treat our signed URL proxy as external so components use plain <img>
  if (src.startsWith('/api/r2')) return true
  return false
}
