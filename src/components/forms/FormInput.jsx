import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function FormInput({ 
  id, 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  required = false,
  helpText,
  isInvalid = false,
  errorMessage,
  ...rest
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={isInvalid ? "border-red-500 focus:ring-red-500/60" : ""}
        {...rest}
      />
      {helpText && !isInvalid && <p className="text-xs text-muted-foreground mt-1">{helpText}</p>}
      {isInvalid && errorMessage && <p className="text-xs text-red-600 mt-1">{errorMessage}</p>}
    </div>
  )
}

export default FormInput
