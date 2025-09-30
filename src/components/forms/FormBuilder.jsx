import React from 'react'
import { Button } from '@/components/ui/button'
import FormInput from './FormInput'
import useFormController from '@/hooks/useFormController'

export function FormBuilder({
  schema,
  onSubmit,
  submitLabel,
  submitVariant = 'default',
  loading = false,
  initialValues,
  validate,
  externalErrors,
  footer,
  className = 'space-y-4',
}) {
  const controller = useFormController({ schema, initialValues, validate, externalErrors })

  return (
    <form onSubmit={controller.handleSubmit(onSubmit)} className={className}>
      {controller.fields.map((field) => (
        field.render ? (
          field.render({ field, controller })
        ) : (
          <FormInput
            key={field.name}
            id={field.name}
            label={field.label}
            type={field.type}
            value={field.value}
            onChange={(value) => controller.setFieldValue(field.name, value)}
            placeholder={field.placeholder}
            required={field.required}
            helpText={field.helpText}
            isInvalid={Boolean(field.error)}
            errorMessage={field.error}
            {...field.inputProps}
          />
        )
      ))}

      {submitLabel && (
        <Button type="submit" className="w-full" variant={submitVariant} disabled={loading}>
          {loading ? `${submitLabel}...` : submitLabel}
        </Button>
      )}

      {footer && footer(controller)}
    </form>
  )
}

export default FormBuilder
