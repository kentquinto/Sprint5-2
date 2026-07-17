// Inline validation message under a form field. Renders nothing when the
// field has no error, so it can sit unconditionally under every input.
export default function FieldError({ errors, name }) {
  const msg = errors?.[name]?.[0]
  if (!msg) return null
  return <p className="text-xs text-red-600 mt-1">{msg}</p>
}
