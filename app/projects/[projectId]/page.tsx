'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, ChevronDown, Edit } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Pie, PieChart, Cell, Legend, Tooltip } from 'recharts'
import { Area, AreaChart, CartesianGrid } from 'recharts'

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: '3' | '2' | '1'
  due_date: string
}

interface Project {
  id: number
  name: string
  description: string
  due_date: string
  tasks: Task[]
  members: { id: number; name: string; avatar: string }[]
}

interface ProjectSummary {
  total_tasks: number
  completed_tasks: number
  incomplete_tasks: number
  overdue_tasks: number
}

interface DailyCompletedTasks {
  date: string
  completed_count: number
}

interface ProjectStats {
  summary: ProjectSummary
  daily_completed_tasks: DailyCompletedTasks[]
}

const statusColumns = ['Todo', 'In Progress', 'Completed', 'Overdue']

export default function ProjectDashboard() {
  const { projectId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'priority' | 'due_date'>('priority')
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'Todo',
    priority: '1',
    due_date: '',
  })
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchProject();
    fetchProjectStats();
  }, [projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        console.error('Failed to fetch project')
        toast({
          title: 'Error',
          description: 'Failed to fetch project. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while fetching the project. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const fetchProjectStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/progress`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setProjectStats(data)
      } else {
        console.error('Failed to fetch project stats')
        toast({
          title: 'Error',
          description: 'Failed to fetch project statistics. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching project stats:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while fetching the project statistics. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !project) return

    const { source, destination, draggableId } = result
    const updatedTasks = Array.from(project.tasks)
    const [movedTask] = updatedTasks.splice(source.index, 1)
    updatedTasks.splice(destination.index, 0, { ...movedTask, status: destination.droppableId })

    setProject({ ...project, tasks: updatedTasks })

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${draggableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: destination.droppableId }),
      })

      if (!response.ok) {
        console.error('Failed to update task status')
        fetchProject() // Revert to the previous state if the update fails
        toast({
          title: 'Error',
          description: 'Failed to update task status. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating task status:', error)
      fetchProject() // Revert to the previous state if the update fails
      toast({
        title: 'Error',
        description: 'An error occurred while updating the task status. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newTask),
      })
      if (response.ok) {
        setNewTask({
          title: '',
          description: '',
          status: 'Todo',
          priority: '1',
          due_date: '',
        })
        fetchProject()
        toast({
          title: 'Success',
          description: 'Task created successfully.',
        })
      } else {
        console.error('Failed to create task')
        toast({
          title: 'Error',
          description: 'Failed to create task. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while creating the task. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editingTask),
      })
      if (response.ok) {
        setEditingTask(null)
        fetchProject()
        toast({
          title: 'Success',
          description: 'Task updated successfully.',
        })
      } else {
        console.error('Failed to update task')
        toast({
          title: 'Error',
          description: 'Failed to update task. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while updating the task. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const filteredTasks = project?.tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { 1: 3, 2: 2, 3: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    } else {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }
  })

  if (!project || !projectStats) {
    return <div>Loading...</div>
  }

  const taskStatusData = [
    { name: 'Completed', value: projectStats.summary.completed_tasks },
    { name: 'Incomplete', value: projectStats.summary.incomplete_tasks },
  ]

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--destructive))',
    'hsl(var(--accent))'
  ];  

  return (
    <div className="container mx-auto p-4">
      <header className="bg-orange-500 text-white p-4 rounded-t-lg mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm">Due: {new Date(project.due_date).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select>
              <SelectTrigger className="w-[180px] bg-white text-orange-500">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">{project.name}</SelectItem>
                {/* Add more projects here */}
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-white text-orange-500">
              <ChevronDown className="h-4 w-4 mr-2" />
              My Project
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.summary.completed_tasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incomplete tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.summary.incomplete_tasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.summary.overdue_tasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.summary.total_tasks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Incomplete tasks by section</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={statusColumns.slice(0, 2).map(status => ({
                name: status,
                total: filteredTasks.filter(task => task.status.toLowerCase() === status.toLowerCase() && task.status.toLowerCase() !== 'completed').length,
              }))}>
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total tasks by completion status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Task completion over time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={projectStats.daily_completed_tasks}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area type="monotone" dataKey="completed_count" stroke="#8884d8" fillOpacity={1} fill="url(#colorCompleted)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={(value: 'priority' | 'due_date') => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Sort by Priority</SelectItem>
                <SelectItem value="due_date">Sort by Due Date</SelectItem>
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateTask}>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>Add a new task to your project.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Status
                      </Label>
                      <Select
                        value={newTask.status}
                        onValueChange={(value) => setNewTask({ ...newTask, status: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusColumns.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="priority" className="text-right">
                        Priority
                      </Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value: '3' | '2' | '1') => setNewTask({ ...newTask, priority: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">Low</SelectItem>
                          <SelectItem value="2">Medium</SelectItem>
                          <SelectItem value="1">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="due_date" className="text-right">
                        Due Date
                      </Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Task</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusColumns.map((status) => (
              <Droppable key={status} droppableId={status}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-gray-100 p-4 rounded-lg"
                  >
                    <h3 className="text-lg font-semibold mb-2">{status}</h3>
                    {sortedTasks
                      .filter((task) => task.status.toLowerCase() === status.toLowerCase())
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-2 ${
                                task.priority === '1'
                                  ? 'priority-1'
                                  : task.priority === '2'
                                  ? 'priority-2'
                                  : 'priority-3'
                              }`}
                            >
                              <CardHeader>
                
                                <CardTitle className="text-sm font-medium flex justify-between items-center">
                                  {task.title}
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm" onClick={() => setEditingTask(task)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <form onSubmit={handleUpdateTask}>
                                        <DialogHeader>
                                          <DialogTitle>Edit Task</DialogTitle>
                                          <DialogDescription>Make changes to your task here.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-title" className="text-right">
                                              Title
                                            </Label>
                                            <Input
                                              id="edit-title"
                                              value={editingTask?.title}
                                              onChange={(e) => setEditingTask({ ...editingTask!, title: e.target.value })}
                                              className="col-span-3"
                                            />
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-description" className="text-right">
                                              Description
                                            </Label>
                                            <Textarea
                                              id="edit-description"
                                              value={editingTask?.description}
                                              onChange={(e) => setEditingTask({ ...editingTask!, description: e.target.value })}
                                              className="col-span-3"
                                            />
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-status" className="text-right">
                                              Status
                                            </Label>
                                            <Select
                                              value={editingTask?.status}
                                              onValueChange={(value) => setEditingTask({ ...editingTask!, status: value })}
                                            >
                                              <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select status" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {statusColumns.map((status) => (
                                                  <SelectItem key={status} value={status}>
                                                    {status}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-priority" className="text-right">
                                              Priority
                                            </Label>
                                            <Select
                                              value={editingTask?.priority}
                                              onValueChange={(value: '3' | '2' | '1') => setEditingTask({ ...editingTask!, priority: value })}
                                            >
                                              <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select priority" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="3">Low</SelectItem>
                                                <SelectItem value="2">Medium</SelectItem>
                                                <SelectItem value="1">High</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-due_date" className="text-right">
                                              Due Date
                                            </Label>
                                            <Input
                                              id="edit-due_date"
                                              type="date"
                                              value={editingTask?.due_date}
                                              onChange={(e) => setEditingTask({ ...editingTask!, due_date: e.target.value })}
                                              className="col-span-3"
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button type="submit">Save Changes</Button>
                                        </DialogFooter>
                                      </form>
                                    </DialogContent>
                                  </Dialog>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-xs text-gray-500 mb-2">
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </p>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Project Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-600">{project.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
