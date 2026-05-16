import { HelpCircle } from "lucide-react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import type { GigFAQItem } from "@/types/gigs"

export function GigFAQ({ faqs }: { faqs: GigFAQItem[] }) {
  if (faqs.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-tertiary py-6">
        <HelpCircle className="h-4 w-4 shrink-0" />
        No FAQs added yet.
      </div>
    )
  }

  return (
    <Accordion multiple className="border border-border rounded-xl overflow-hidden bg-surface shadow-card">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id} className="px-4 border-b border-border last:border-b-0">
          <AccordionTrigger className="text-sm font-semibold text-text-primary py-3.5 no-underline hover:no-underline hover:text-brand-600 transition-colors text-left">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-text-secondary leading-relaxed pb-4">{faq.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
