'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Edit, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Task {
  id: number
  title: string
  description: string
  status: string
  priority: number
  due_date: string
}

interface Project {
  id: number
  name: string
  description: string
  due_date: string
  tasks: Task[]
}

export default function ProjectDashboard() {
    const { projectId } = useParams()
    const router = useRouter()
    const [project, setProject] = useState<Project | null>(null)
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo', priority: 1, due_date: '' })
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [isEditingProject, setIsEditingProject] = useState(false)
  
    useEffect(() => {
      fetchProject()
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
      }
    } catch (error) {
      console.error('Error fetching project:', error)
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
        setNewTask({ title: '', description: '', status: 'todo', priority: 1, due_date: '' })
        fetchProject()
      } else {
        console.error('Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
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
      } else {
        console.error('Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (response.ok) {
        fetchProject()
      } else {
        console.error('Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(project),
      })
      if (response.ok) {
        setIsEditingProject(false)
        fetchProject()
      } else {
        console.error('Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleDeleteProject = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (response.ok) {
        router.push('/projects')
      } else {
        console.error('Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  if (!project) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        {isEditingProject ? (
          <form onSubmit={handleUpdateProject} className="flex-1 mr-4">
            <Input
              value={project.name}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              className="text-2xl font-bold mb-2"
            />
            <Textarea
              value={project.description}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
              className="mb-2"
            />
            <Input
              type="date"
              value={project.due_date}
              onChange={(e) => setProject({ ...project, due_date: e.target.value })}
              className="mb-2"
            />
            <Button type="submit">Save Project</Button>
          </form>
        ) : (
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <p className="mb-2">{project.description}</p>
            <p className="mb-2">Due: {new Date(project.due_date).toLocaleDateString()}</p>
          </div>
        )}
        <div>
          <Button variant="outline" className="mr-2" onClick={() => setIsEditingProject(!isEditingProject)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Project
          </Button>
          <Button variant="destructive" onClick={handleDeleteProject}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Project
          </Button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {['todo', 'in progress', 'completed'].map((status) => (
          <div key={status} className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4 capitalize">{status}</h3>
            {project.tasks
              .filter((task) => task.status === status)
              .map((task) => (
                <Card key={task.id} className="mb-4">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {task.title}
                      <div>
                        <Button variant="ghost" size="sm" onClick={() => setEditingTask(task)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>Priority: {task.priority}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{task.description}</p>
                    <p className="text-sm text-gray-500 mt-2">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        ))}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New Task
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
              <div className="grid grid-cols-4  items-center gap-4">
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
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Input
                  id="priority"
                  type="number"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: parseInt(e.target.value) })}
                  className="col-span-3"
                />
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

      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <form onSubmit={handleUpdateTask}>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Make changes to your task here.</DialogDescription>
            </DialogHeader>
            {editingTask && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="edit-title"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="edit-description"
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={editingTask.status}
                    onValueChange={(value) => setEditingTask({ ...editingTask, status: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Todo</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-priority" className="text-right">
                    Priority
                  </Label>
                  <Input
                    id="edit-priority"
                    type="number"
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: parseInt(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-due_date" className="text-right">
                    Due Date
                  </Label>
                  <Input
                    id="edit-due_date"
                    type="date"
                    value={editingTask.due_date}
                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
