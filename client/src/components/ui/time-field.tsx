import React from 'react'
import { Label } from './label'
import { Input } from './input'

interface TimeFieldProps {
  label: string
  value?: string
  onChange: (value: string) => void
}

export function TimeField({ label, value, onChange }: TimeFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
} 