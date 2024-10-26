'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, ChevronDown, Filter, SortAsc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

// Define types
type Task = {
  id: string
  title: string
  status: 'Todo' | 'In Progress' | 'Completed' | 'Overdue'
  assignees: string[]
  dueDate: string
  priority: 'Low' | 'Medium' | 'High'
}

type Project = {
  id: string
  name: string
  dueDate: string
  priority: 'Low' | 'Medium' | 'High'
  tags: string[]
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Fetch project and tasks data
    fetchProjectData()
    fetchTasks()
  }, [])

  const fetchProjectData = async () => {
    // Simulating API call
    const projectData: Project = {
      id: '1',
      name: 'My Project',
      dueDate: '28 Feb 2023',
      priority: 'Medium',
      tags: ['Meetings', 'UI Design', 'Development', 'UX Research']
    }
    setProject(projectData)
  }

  const fetchTasks = async () => {
    // Simulating API call
    const tasksData: Task[] = [
      {
        id: '1',
        title: 'Create a Visual Style Guide',
        status: 'Todo',
        assignees: ['IM', 'JS'],
        dueDate: 'Today',
        priority: 'High'
      },
      {
        id: '2',
        title: 'Testing and User Feedback',
        status: 'In Progress',
        assignees: ['IM', 'AS'],
        dueDate: 'Today',
        priority: 'Medium'
      },
      {
        id: '3',
        title: 'Meetings with Client',
        status: 'Completed',
        assignees: ['IM', 'JS'],
        dueDate: 'Today',
        priority: 'Low'
      },
      {
        id: '4',
        title: 'Create Mockups for Dribbble Shot',
        status: 'Overdue',
        assignees: ['AS'],
        dueDate: '24 Feb 2023',
        priority: 'Low'
      },
    ]
    setTasks(tasksData)
  }

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-6 hidden md:block">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-orange-500">Taskmate</h1>
          <p className="text-sm text-gray-500">Focus. Prioritize. Execute.</p>
        </div>
        <nav>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-600 hover:text-orange-500">Overview</a></li>
            <li><a href="#" className="text-gray-600 hover:text-orange-500">Task List</a></li>
            <li><a href="#" className="text-gray-600 hover:text-orange-500 font-semibold">Project Overview</a></li>
            <li><a href="#" className="text-gray-600 hover:text-orange-500">Calendar</a></li>
            <li><a href="#" className="text-gray-600 hover:text-orange-500">Settings</a></li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold">{project?.name}</h2>
              <p className="text-sm text-gray-500">Projects / My Project</p>
            </div>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                <AvatarFallback>IM</AvatarFallback>
              </Avatar>
              <span className="font-semibold">Ivan Moses</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-500">Priority</span>
              <p className="font-semibold">{project?.priority}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Due date</span>
              <p className="font-semibold">{project?.dueDate}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Tags</span>
              <div className="flex gap-2 mt-1">
                {project?.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Search and filters */}
        <div className="flex justify-between mb-6">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search task or project"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <SortAsc className="w-4 h-4 mr-2" />
              Sort
            </Button>
            <Button variant="outline" size="sm">
              Label
            </Button>
            <Button variant="outline" size="sm">
              Category
            </Button>
          </div>
        </div>

        {/* Kanban board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(['Todo', 'In Progress', 'Completed', 'Overdue'] as const).map(status => (
            <Card key={status}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{status}</CardTitle>
                <Badge variant={status === 'Overdue' ? 'destructive' : 'secondary'} className="text-xs">
                  {getTasksByStatus(status).length}
                </Badge>
              </CardHeader>
              <CardContent>
                {getTasksByStatus(status).map(task => (
                  <div key={task.id} className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <h3 className="font-semibold mb-2">{task.title}</h3>
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {task.assignees.map((assignee, index) => (
                          <Avatar key={index} className="border-2 border-white">
                            <AvatarFallback>{assignee}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{task.dueDate}</span>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
