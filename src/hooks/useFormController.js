import { useCallback, useEffect, useMemo, useState } from 'react'

const createInitialValues = (schema, provided = {}) => {
  return schema.reduce((acc, field) => {
    if (field.renderOnly) return acc
    acc[field.name] = provided[field.name] ?? field.defaultValue ?? ''
    return acc
  }, {})
}

export function useFormController({ schema, initialValues = {}, validate, externalErrors }) {
  const computedInitialValues = useMemo(
    () => createInitialValues(schema, initialValues),
    [schema, initialValues]
  )

  const [values, setValues] = useState(computedInitialValues)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValues(computedInitialValues)
  }, [computedInitialValues])

  useEffect(() => {
    if (externalErrors) {
      setErrors(externalErrors)
    }
  }, [externalErrors])

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const { [name]: _removed, ...rest } = prev
      return rest
    })
  }, [])

  const setFieldError = useCallback((name, message) => {
    setErrors((prev) => ({ ...prev, [name]: message }))
  }, [])

  const resetForm = useCallback(() => {
    setValues(computedInitialValues)
    setErrors({})
  }, [computedInitialValues])

  const handleSubmit = useCallback(
    (onSubmit) => async (event) => {
      event.preventDefault()
      if (validate) {
        const validationErrors = validate(values)
        if (validationErrors && Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors)
          return
        }
      }

      await onSubmit(values, {
        reset: resetForm,
        setValue: setFieldValue,
        setErrors,
        setFieldError,
      })
    },
    [validate, values, resetForm, setFieldValue, setFieldError]
  )

  const fieldStates = useMemo(
    () => schema.map((field) => ({
      ...field,
      value: field.renderOnly ? undefined : values[field.name],
      error: field.renderOnly ? undefined : errors[field.name],
    })),
    [schema, values, errors]
  )

  return {
    values,
    errors,
    fields: fieldStates,
    setFieldValue,
    setErrors,
    handleSubmit,
    resetForm,
  }
}

export default useFormController
