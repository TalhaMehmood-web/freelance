import { HelpCircle } from "lucide-react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import type { GigFAQItem } from "@/types/gigs"

interface GigFAQProps {
  faqs: GigFAQItem[]
}

export function GigFAQ({ faqs }: GigFAQProps) {
  if (faqs.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-tertiary py-4">
        <HelpCircle className="h-4 w-4 shrink-0" />
        No FAQs added yet.
      </div>
    )
  }

  return (
    <Accordion multiple className="border border-border rounded-xl overflow-hidden">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id} className="px-4">
          <AccordionTrigger className="text-sm font-medium text-text-primary py-4 no-underline hover:no-underline hover:text-brand-500 transition-colors">
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
