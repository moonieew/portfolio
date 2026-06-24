/**
 * Single source of truth for personal links & contact details.
 * Used by the command palette, top menu bar and Résumé app.
 */
export const profile = {
  name: 'Lê Thị Minh Nguyệt',
  alias: 'Anna',
  title: 'Frontend Developer',
  email: 'ltmnguyet.131@gmail.com',
  phone: '0858 119 197',
  location: 'Ho Chi Minh City, Vietnam',
  github: 'https://github.com/moonieew',
  linkedin: 'https://www.linkedin.com/in/mooniee',
  // Real CV PDF lives at public/resume.pdf.
  resumePdf: '/resume.pdf',
} as const

export function useProfile() {
  return profile
}
