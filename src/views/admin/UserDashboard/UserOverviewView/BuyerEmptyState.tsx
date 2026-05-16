import { ShoppingBag, ArrowRight } from "lucide-react"

export function BuyerEmptyState() {
  return (
    <div className="relative overflow-hidden bg-surface rounded-3xl border border-border shadow-card p-10 flex flex-col items-center text-center">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-50/50 via-surface to-surface pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-brand-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-brand-50 to-brand-100 border border-brand-100 flex items-center justify-center shadow-sm">
          <ShoppingBag className="w-8 h-8 text-brand-300" />
        </div>
        <div>
          <p className="font-bold text-text-primary text-lg mb-1">Buyer Account</p>
          <p className="text-sm text-text-secondary max-w-xs leading-relaxed">
            This user hasn't set up a seller profile yet. They can only place orders on the marketplace.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-brand-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full">
          Buyer only <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  )
}
