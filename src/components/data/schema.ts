import { z } from "zod"

// We define the schema for tasks using zod
export const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  desc: z.string().optional(),
  startAt: z.union([z.string(), z.date()]),
  endAt: z.union([z.string(), z.date()]),
  status: z.object({
    id: z.string(),
    name: z.string(),
    color: z.string()
  }),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  isCompleted: z.boolean(),
  project: z.string().optional()
})

export type Task = z.infer<typeof taskSchema>

export type Option = {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
} 