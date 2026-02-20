# Disaster Recovery — WDI Ltd Israel

## Recovery Priorities

1. **Public site** — must be accessible (revenue-impacting)
2. **CMS data** — Sanity content must be intact
3. **Admin panel** — can tolerate short downtime

---

## Scenario: Site Down

### Diagnosis
```bash
# Check Netlify status
curl -I https://wdi-israel.co.il

# Check if it's a DNS issue
dig wdi-israel.co.il

# Check Netlify status page
# https://www.netlifystatus.com/
```

### Recovery
1. Check Netlify dashboard for deploy errors
2. If bad deploy: rollback to last working deploy (Netlify > Deploys > Publish deploy)
3. If DNS: check domain registrar settings
4. If Netlify outage: wait for resolution (status page)

---

## Scenario: Sanity CMS Data Loss

### Prevention
- Sanity maintains automatic version history for all documents
- Content changes create revisions that can be reverted in Sanity Studio

### Recovery
1. Go to [sanity.io/manage](https://sanity.io/manage) > Project `hrkxr0r8`
2. Open the affected document in Sanity Studio
3. Use the document history panel to revert to a previous version
4. If bulk data loss: contact Sanity support for dataset restore

### Backup Strategy
- Sanity provides automatic backups on Growth/Enterprise plans
- For manual backup: `npx sanity dataset export production backup.tar.gz`
- Store backups in a secure location outside the repository

---

## Scenario: Authentication Broken

### Symptoms
- Cannot log into `/admin`
- Google OAuth errors

### Recovery
1. Verify Google OAuth credentials are valid in Google Cloud Console
2. Check `NEXTAUTH_SECRET` hasn't changed (changing it invalidates all sessions)
3. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Netlify env vars
4. Check redirect URIs in Google Cloud Console include production URL
5. Clear browser cookies and retry

---

## Scenario: Rate Limiting Not Working

### Symptoms
- Spam form submissions getting through
- No rate limit errors returned

### Recovery
1. Check Upstash Redis dashboard — is the instance active?
2. Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Netlify
3. If Redis is down: the app gracefully degrades (no rate limiting)
4. For immediate spam mitigation: enable Turnstile or add IP blocks in Netlify

---

## Scenario: Secret Leak

### If credentials are exposed:

1. **Rotate immediately:**
   - `NEXTAUTH_SECRET` — generate new: `openssl rand -base64 32`
   - `SANITY_API_TOKEN` — revoke and create new in Sanity dashboard
   - `GOOGLE_CLIENT_SECRET` — rotate in Google Cloud Console
   - Any other exposed secrets

2. **Update in Netlify** environment variables
3. **Trigger redeploy** to pick up new values
4. **Audit:** Check Sanity for unauthorized changes, review access logs

---

## Scenario: Repository Compromised

1. **Revoke all tokens** (Sanity, Google, Upstash, Netlify)
2. **Review recent commits** for malicious changes
3. **Reset to known-good state:** `git reset --hard <safe-commit>`
4. **Force push** (after team coordination): `git push --force origin main`
5. **Re-deploy** from the clean state
6. **Rotate all secrets** in Netlify

---

## Key Contacts & Resources

| Resource | URL |
|----------|-----|
| Netlify Dashboard | netlify.com (wdi-ltd-israel site) |
| Sanity Project | sanity.io/manage (project hrkxr0r8) |
| Google Cloud Console | console.cloud.google.com |
| Upstash Dashboard | console.upstash.com |
| Netlify Status | netlifystatus.com |
| Sanity Status | status.sanity.io |

---

## Recovery Testing

Periodically verify:

- [ ] Netlify rollback works (deploy an old version, then re-deploy current)
- [ ] Sanity document history/revert works
- [ ] OAuth login works after clearing all cookies
- [ ] Site works if Upstash Redis is unreachable (graceful degradation)
