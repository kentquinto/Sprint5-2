export const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)

export const formatDate = dateStr =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
