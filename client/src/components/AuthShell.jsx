export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#352D36]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-[#9C9F9F]/40 bg-white/40 p-8 shadow-[0_20px_70px_-40px_rgba(53,45,54,0.35)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl border border-[#9C9F9F]/50 bg-[#F7F6F2] shadow-sm" />
                <div>
                  <div className="text-sm font-semibold tracking-wide">Lab Document Management</div>
                  <div className="text-xs text-[#7D7980]">Compliance platform</div>
                </div>
              </div>

              <div className="mt-10 space-y-3">
                <div className="text-3xl font-semibold leading-tight">
                  Calm, compliant,
                  <br />
                  always audit-ready.
                </div>
                <p className="max-w-md text-sm leading-relaxed text-[#7D7980]">
                  Manage required documents, assignments, reviews, and immutable history—securely and
                  role-based.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#9C9F9F]/40 bg-white/60 p-4">
                  <div className="text-xs font-medium text-[#7D7980]">Security</div>
                  <div className="mt-1 text-sm font-semibold">JWT + RBAC</div>
                </div>
                <div className="rounded-xl border border-[#9C9F9F]/40 bg-white/60 p-4">
                  <div className="text-xs font-medium text-[#7D7980]">Storage</div>
                  <div className="mt-1 text-sm font-semibold">Server</div>
                </div>
                <div className="rounded-xl border border-[#9C9F9F]/40 bg-white/60 p-4">
                  <div className="text-xs font-medium text-[#7D7980]">Audit</div>
                  <div className="mt-1 text-sm font-semibold">Immutable</div>
                </div>
              </div>

              <div className="mt-10">
                <div className="h-1 w-24 rounded-full bg-[#352D36]" />
                <div className="mt-2 text-xs text-[#909493]">
                  Powered by your lab’s compliance process.
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="rounded-2xl border border-[#9C9F9F]/45 bg-white/70 p-6 shadow-[0_20px_70px_-40px_rgba(53,45,54,0.35)] backdrop-blur">
                <div className="mb-6">
                  <div className="text-xs font-medium tracking-wide text-[#7D7980]">
                    Lab Document Management
                  </div>
                  <h1 className="mt-2 text-xl font-semibold tracking-tight">{title}</h1>
                  {subtitle ? <p className="mt-1 text-sm text-[#7D7980]">{subtitle}</p> : null}
                </div>

                {children}

                {footer ? <div className="mt-6 border-t border-[#9C9F9F]/30 pt-4">{footer}</div> : null}
              </div>

              <div className="mt-6 text-center text-xs text-[#909493]">
                © {new Date().getFullYear()} Lab Document Management
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

