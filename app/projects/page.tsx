'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import ProjectSearch from '@/components/ProjectSearch'

interface Project {
  id: number
  name: string
  description: string
  due_date: string
  priority: 'Low' | 'Medium' | 'High'
  tags: string[]
}

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectDueDate, setNewProjectDueDate] = useState('')
  const [newProjectPriority, setNewProjectPriority] = useState('Medium')
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
        setFilteredProjects(data)
      } else {
        console.error('Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription,
          due_date: newProjectDueDate,
          priority: newProjectPriority,
        }),
      })
      if (response.ok) {
        setNewProjectName('')
        setNewProjectDescription('')
        setNewProjectDueDate('')
        setNewProjectPriority('Medium')
        fetchProjects()
      } else {
        console.error('Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleSearch = (query: string) => {
    const filtered = projects.filter(project =>
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.description.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredProjects(filtered)
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <ProjectSearch onSearch={handleSearch} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => router.push(`/projects/${project.id}`)}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{project.name}</span>
                <Badge variant={project.priority === 'High' ? 'destructive' : project.priority === 'Medium' ? 'default' : 'secondary'}>
                  {project.priority}
                </Badge>
              </CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Due: {new Date(project.due_date).toLocaleDateString()}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {(project.tags || []).map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <form onSubmit={handleCreateProject}>
            <CardContent>
              <Input
                placeholder="Project Name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                required
              />
              <Input
                placeholder="Description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="mt-2"
                required
              />
              <Input
                type="date"
                placeholder="Due Date"
                value={newProjectDueDate}
                onChange={(e) => setNewProjectDueDate(e.target.value)}
                className="mt-2"
                required
              />
              <select
                value={newProjectPriority}
                onChange={(e) => setNewProjectPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                className="mt-2 w-full p-2 border rounded"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Create Project
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
