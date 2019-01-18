/** Redirect to site root at runtime */
if (typeof window !== undefined) {
  const siteRoot = process.env.SITE_ROOT
  const skipSiteRootRedirect = window.location.search.includes('skipSiteRootRedirect')
  if (siteRoot && !skipSiteRootRedirect && window.location.origin !== siteRoot) {
    window.location.replace(`${siteRoot}${window.location.pathname}${window.location.search}`)
  }
}
