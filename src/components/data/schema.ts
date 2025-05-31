import { z } from "zod"

// We define the schema for tasks using zod
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
})

export type Task = z.infer<typeof taskSchema>

export type Option = {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
} 