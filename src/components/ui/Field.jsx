import { useId } from 'react'
import FieldError from './FieldError'
import { inputCls, labelCls } from '../../utils/formStyles'

// One form field = label + control + inline validation error.
// `as` picks the control ('input' | 'select' | 'textarea'); everything else
// (type, value, onChange, required, options as children...) passes through.
// `errors` is the 422 field-errors object; `name` keys into it.
export default function Field({ label, name, as = 'input', errors, className = '', children, ...props }) {
  const id = useId()
  const Control = as

  return (
    <div className={className}>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <Control id={id} name={name} className={inputCls} {...props}>{children}</Control>
      <FieldError errors={errors} name={name} />
    </div>
  )
}
