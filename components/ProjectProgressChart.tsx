'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts'

interface ProjectProgress {
  date: string
  completedTasks: number
  totalTasks: number
}

interface ProjectProgressChartProps {
  projectId: number
}

export default function ProjectProgressChart({ projectId }: ProjectProgressChartProps) {
  const [progressData, setProgressData] = useState<ProjectProgress[]>([])

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/progress`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setProgressData(data)
        } else {
          console.error('Failed to fetch project progress data')
        }
      } catch (error) {
        console.error('Error fetching project progress:', error)
      }
    }

    fetchProgressData()
  }, [projectId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            completedTasks: {
              label: "Completed Tasks",
              color: "hsl(var(--chart-1))",
            },
            totalTasks: {
              label: "Total Tasks",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="completedTasks" stroke="var(--color-completedTasks)" name="Completed Tasks" />
              <Line type="monotone" dataKey="totalTasks" stroke="var(--color-totalTasks)" name="Total Tasks" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
