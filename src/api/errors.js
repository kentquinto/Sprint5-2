// Normalize an axios error into what a form needs to render:
// - fieldErrors: Laravel's 422 validation object ({ field: [messages] })
// - message: a general banner message for everything that isn't field-specific
export function getFormErrors(err, fallback = 'Something went wrong.') {
  const res = err.response
  if (res?.status === 422 && res.data?.errors) {
    return { fieldErrors: res.data.errors, message: '' }
  }
  return { fieldErrors: {}, message: res?.data?.message ?? fallback }
}
