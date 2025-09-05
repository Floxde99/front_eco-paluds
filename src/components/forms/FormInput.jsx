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
  helpText 
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
      />
      {helpText && <p className="text-xs text-muted-foreground mt-1">{helpText}</p>}
    </div>
  )
}

export default FormInput
