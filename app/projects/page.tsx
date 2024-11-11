'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface Project {
  id: number
  name: string
  description: string
  due_date: string
  members: { id: number; name: string; avatar: string }[]
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    due_date: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      } else {
        console.error('Failed to fetch projects')
        toast({
          title: 'Error',
          description: 'Failed to fetch projects. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while fetching projects. Please try again.',
        variant: 'destructive',
      })
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
        body: JSON.stringify(newProject),
      })
      if (response.ok) {
        setNewProject({
          name: '',
          description: '',
          due_date: '',
        })
        fetchProjects()
        toast({
          title: 'Success',
          description: 'Project created successfully.',
        })
      } else {
        console.error('Failed to create project')
        toast({
          title: 'Error',
          description: 'Failed to create project. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating project:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while creating the project. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <div className="mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateProject}>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Add a new project to your dashboard.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
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
                    value={newProject.due_date}
                    onChange={(e) => setNewProject({ ...newProject, due_date: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>Due: {new Date(project.due_date).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{project.description}</p>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Team Members</h4>
                <div className="flex flex-wrap gap-2">
                  {project.members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      {/* <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full" /> */}
                      <img src="https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png" alt={member.name} className="w-6 h-6 rounded-full" />
                      <span className="text-xs">{member.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/projects/${project.id}`} passHref>
                <Button>View Project</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
