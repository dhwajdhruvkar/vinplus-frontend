import { CompanyContext, DEFAULT_COMPANY } from './companyContext.js'

export default function CompanyBrandingProvider({ company = DEFAULT_COMPANY, children }) {
  return <CompanyContext value={company}>{children}</CompanyContext>
}
