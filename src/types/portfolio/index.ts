export interface PortfolioItem {
  id:          string
  title:       string
  description: string | null
  externalUrl: string | null
  categoryId:  string | null
  createdAt:   string
}

export interface AddPortfolioInput {
  title:        string
  description?: string
  externalUrl?: string
  categoryId?:  string
}
