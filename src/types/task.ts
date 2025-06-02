export interface Task {
  id: string
  title: string
  status: string
  label?: string
  priority: string
  completed: boolean
  dueDate?: Date
  project?: string
} 