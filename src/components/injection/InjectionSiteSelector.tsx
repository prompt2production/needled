'use client'

import { cn } from '@/lib/utils'
import { SITE_ROTATION_ORDER, getSiteLabel } from '@/lib/injection-site'
import type { InjectionSite } from '@/lib/validations/injection'

interface InjectionSiteSelectorProps {
  value: InjectionSite | null
  onChange: (site: InjectionSite) => void
  suggestedSite?: InjectionSite | null
  lastUsedSite?: InjectionSite | null
}

export function InjectionSiteSelector({
  value,
  onChange,
  suggestedSite = null,
  lastUsedSite = null,
}: InjectionSiteSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {SITE_ROTATION_ORDER.map((site) => {
        const isSelected = value === site
        const isSuggested = suggestedSite === site
        const isLastUsed = lastUsedSite === site
        const label = getSiteLabel(site)

        return (
          <button
            key={site}
            type="button"
            onClick={() => onChange(site)}
            className={cn(
              'relative flex flex-col items-center justify-center min-h-[56px] px-4 py-3 rounded-xl text-sm font-medium transition-colors',
              isSelected
                ? 'bg-lime text-black'
                : isSuggested
                ? 'bg-lime/15 text-lime border border-lime/30 hover:bg-lime/20'
                : isLastUsed
                ? 'bg-white/5 text-muted-foreground border border-white/10'
                : 'bg-white/10 text-white hover:bg-white/15'
            )}
          >
            <span>{label}</span>
            {isSuggested && !isSelected && (
              <span className="text-[10px] mt-0.5 font-normal opacity-80">
                Suggested
              </span>
            )}
            {isLastUsed && !isSelected && !isSuggested && (
              <span className="text-[10px] mt-0.5 font-normal opacity-60">
                Used last
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
