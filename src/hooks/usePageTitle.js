import { useEffect } from 'react'

// One place that owns document.title. Pass nothing (or undefined while data
// loads) for the bare app name.
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — TCG Manager` : 'TCG Manager'
  }, [title])
}
