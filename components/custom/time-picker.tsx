"use client"
import { DateInput, TimeField } from "@/components/ui/datefield-rac"

export default function TimePicker() {
  return (
    <TimeField className='min-w-32'>
      <div className="relative">
        <DateInput />
      </div>
    </TimeField>
  )
}
