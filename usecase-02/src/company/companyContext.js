import { createContext, useContext } from 'react'
import crest from '../assets/crest.png'

export const DEFAULT_COMPANY = { companyId: 'company-14', companyName: 'Ferrari Fort Lauderdale', logoUrl: crest }

export const CompanyContext = createContext(DEFAULT_COMPANY)

export const useCompany = () => useContext(CompanyContext)

// Demo resolver. A backend would return { companyId, companyName, logoUrl } for the authenticated user.
export const resolveCompany = () => DEFAULT_COMPANY

export const companyShortName = ({ shortName, companyName }) => shortName || companyName.split(' ')[0]

export const companyLabel = ({ companyId }) => companyId.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
