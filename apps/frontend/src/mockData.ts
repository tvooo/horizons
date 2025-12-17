import type { Area, List, Project, RegularList, Task } from './types'

// Areas
export const areas: Area[] = [
  {
    id: 'area-1',
    type: 'area',
    name: 'Work',
    description: 'Work-related projects and tasks',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'area-2',
    type: 'area',
    name: 'Personal',
    description: 'Personal projects and goals',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

// Projects
export const projects: Project[] = [
  {
    id: 'project-1',
    type: 'project',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website',
    completionPercentage: 65,
    dueDate: new Date('2026-02-15'),
    areaId: 'area-1',
    scheduledDate: {
      periodType: 'week',
      anchorDate: new Date('2025-12-08'), // Last week (should roll over to this week)
    },
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'project-2',
    type: 'project',
    name: 'Learn Spanish',
    description: 'Conversational fluency goal',
    completionPercentage: 30,
    areaId: 'area-2',
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-12-05'),
  },
]

// Regular Lists
export const regularLists: RegularList[] = [
  {
    id: 'list-1',
    type: 'regular',
    name: 'Groceries',
    description: 'Weekly shopping list',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'list-2',
    type: 'regular',
    name: 'Home Improvements',
    description: 'Things to fix around the house',
    areaId: 'area-2',
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-13'), // Tomorrow
    },
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-12-08'),
  },
]

// All lists combined
export const lists: List[] = [...areas, ...projects, ...regularLists]

// Tasks
export const tasks: Task[] = [
  // Today's tasks (Dec 12)
  {
    id: 'task-1',
    title: 'Review project proposal',
    completed: false,
    listId: 'project-1',
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-12'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-2',
    title: 'Team standup meeting',
    completed: false,
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-12'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-3',
    title: 'Update documentation',
    completed: false,
    listId: 'project-1',
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-12'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },

  // Tomorrow's tasks (Dec 13)
  {
    id: 'task-4',
    title: 'Client presentation',
    completed: false,
    listId: 'project-1',
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-13'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-5',
    title: 'Code review session',
    completed: false,
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-13'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-6',
    title: 'Fix reported bugs',
    completed: false,
    listId: 'project-1',
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-13'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-17'),
  },

  // Day +2 (Dec 14)
  {
    id: 'task-7',
    title: 'Design workshop',
    completed: false,
    listId: 'project-1',
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-14'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-8',
    title: 'Sprint planning',
    completed: false,
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-14'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-9',
    title: 'Database optimization',
    completed: false,
    listId: 'project-1',
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-14'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },

  // Day +3 (Dec 15)
  {
    id: 'task-10',
    title: 'Testing and QA',
    completed: false,
    listId: 'project-1',
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-15'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-11',
    title: 'Deploy to staging',
    completed: false,
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-15'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-12',
    title: 'Security audit',
    completed: false,
    listId: 'project-1',
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-15'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },

  // Day +4 (Dec 16)
  {
    id: 'task-13',
    title: 'Weekly retrospective',
    completed: false,
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-16'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-14',
    title: 'Documentation update',
    completed: false,
    listId: 'project-1',
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-16'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-15',
    title: 'Plan next sprint',
    completed: false,
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-16'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },

  // Past tasks (SHOULD ROLL OVER TO TODAY - Dec 12)
  {
    id: 'task-16',
    title: 'Personal project work',
    completed: false,
    listId: 'list-2',
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-10'), // 2 days ago
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-17',
    title: 'Learn new framework',
    completed: false,
    listId: 'project-2',
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-09'), // 3 days ago
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-overdue',
    title: 'Old task from last month',
    completed: false,
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-11-20'), // Last month
    },
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-10'),
  },

  // Inbox tasks (no list, no scheduled date)
  {
    id: 'task-18',
    title: 'Call dentist for appointment',
    completed: false,
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-19',
    title: 'Research vacation destinations',
    completed: false,
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-inbox-1',
    title: 'Reply to email from Sarah',
    completed: false,
    createdAt: new Date('2024-12-11'),
    updatedAt: new Date('2024-12-11'),
  },
  {
    id: 'task-inbox-2',
    title: 'Check out new restaurant downtown',
    completed: false,
    createdAt: new Date('2024-12-09'),
    updatedAt: new Date('2024-12-09'),
  },
  {
    id: 'task-inbox-3',
    title: 'Sort through old photos',
    completed: false,
    createdAt: new Date('2024-12-08'),
    updatedAt: new Date('2024-12-08'),
  },

  // This Week tasks (week of Dec 9-15, 2025)
  {
    id: 'task-20',
    title: 'Complete feature X',
    completed: false,
    listId: 'project-1',
    scheduledDate: {
      periodType: 'week',
      anchorDate: new Date('2025-12-08'), // Last week (should roll over)
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-21',
    title: 'Onboard new team member',
    completed: false,
    scheduledDate: {
      periodType: 'week',
      anchorDate: new Date('2025-12-08'), // Current week
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-22',
    title: 'Prepare Q1 report',
    completed: false,
    scheduledDate: {
      periodType: 'week',
      anchorDate: new Date('2025-12-08'),
    },
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },

  // This Month tasks (December 2025)
  {
    id: 'task-23',
    title: 'Launch v2.0',
    completed: false,
    listId: 'project-1',
    scheduledDate: {
      periodType: 'month',
      anchorDate: new Date('2025-12-01'),
    },
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-24',
    title: 'Customer feedback review',
    completed: false,
    listId: 'project-1',
    scheduledDate: {
      periodType: 'month',
      anchorDate: new Date('2025-11-01'), // Last month (should roll over)
    },
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-25',
    title: 'Team building event',
    completed: false,
    scheduledDate: {
      periodType: 'month',
      anchorDate: new Date('2025-12-01'),
    },
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-10'),
  },

  // This Quarter tasks (Q4 2025: Oct-Dec)
  {
    id: 'task-26',
    title: 'Migrate to new infrastructure',
    completed: false,
    listId: 'project-1',
    scheduledDate: {
      periodType: 'quarter',
      anchorDate: new Date('2025-10-01'), // Q4 2025
    },
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-27',
    title: 'Expand to new market',
    completed: false,
    scheduledDate: {
      periodType: 'quarter',
      anchorDate: new Date('2025-07-01'), // Q3 2025 (should roll over)
    },
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-28',
    title: 'Hire 3 engineers',
    completed: false,
    scheduledDate: {
      periodType: 'quarter',
      anchorDate: new Date('2025-10-01'),
    },
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-12-10'),
  },

  // Unscheduled tasks
  {
    id: 'task-29',
    title: 'Buy milk and eggs',
    completed: false,
    listId: 'list-1',
    createdAt: new Date('2024-12-12'),
    updatedAt: new Date('2024-12-12'),
  },
  {
    id: 'task-30',
    title: 'Practice Spanish conversation',
    completed: false,
    listId: 'project-2',
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10'),
  },
  {
    id: 'task-31',
    title: 'Fix leaky faucet',
    completed: false,
    listId: 'list-2',
    scheduledDate: {
      periodType: 'day',
      anchorDate: new Date('2025-12-13'),
    },
    createdAt: new Date('2024-12-08'),
    updatedAt: new Date('2024-12-08'),
  },
]
