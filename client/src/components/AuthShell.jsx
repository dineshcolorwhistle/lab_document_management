export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-brand-surface text-brand-primary antialiased">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="hidden lg:block">
            <div className="ldm-card rounded-2xl p-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-primary shadow-soft" />
                <div>
                  <div className="text-sm font-semibold tracking-wide text-brand-primary">
                    Lab Document Management
                  </div>
                  <div className="text-xs text-brand-muted">Compliance platform</div>
                </div>
              </div>

              <div className="mt-10 space-y-3">
                <div className="text-3xl font-semibold leading-tight text-brand-primary">
                  Calm, compliant,
                  <br />
                  always audit-ready.
                </div>
                <p className="max-w-md text-sm leading-relaxed text-brand-muted">
                  Manage required documents, assignments, reviews, and immutable history—securely and
                  role-based.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-brand-border bg-brand-surface/80 p-4">
                  <div className="text-xs font-medium text-brand-muted">Security</div>
                  <div className="mt-1 text-sm font-semibold text-brand-primary">JWT + RBAC</div>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-surface/80 p-4">
                  <div className="text-xs font-medium text-brand-muted">Storage</div>
                  <div className="mt-1 text-sm font-semibold text-brand-primary">Server</div>
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-surface/80 p-4">
                  <div className="text-xs font-medium text-brand-muted">Audit</div>
                  <div className="mt-1 text-sm font-semibold text-brand-primary">Immutable</div>
                </div>
              </div>

              <div className="mt-10">
                <div className="h-1 w-24 rounded-full bg-brand-primary" />
                <div className="mt-2 text-xs text-brand-muted-light">
                  Powered by your lab&apos;s compliance process.
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="ldm-card rounded-2xl p-6">
                <div className="mb-6">
                  <div className="text-xs font-medium tracking-wide text-brand-muted">
                    Lab Document Management
                  </div>
                  <h1 className="mt-2 text-xl font-semibold tracking-tight text-brand-primary">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>
                  ) : null}
                </div>

                {children}

                {footer ? (
                  <div className="mt-6 border-t border-brand-border pt-4">{footer}</div>
                ) : null}
              </div>

              <div className="mt-6 text-center text-xs text-brand-muted-light">
                © {new Date().getFullYear()} Lab Document Management
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
