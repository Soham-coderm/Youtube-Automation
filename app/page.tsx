'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'

// Replace with your actual client ID
const CLIENT_ID = '212677908546-4b1cd1budqj9iompj2set2kgj6lgqa0l.apps.googleusercontent.com'

async function searchYouTubeChannel(query: string, accessToken: string) {
  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=channel&maxResults=1`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to search YouTube channel')
  }

  const data = await response.json()
  if (data.items && data.items.length > 0) {
    const channel = data.items[0]
    return {
      id: channel.id.channelId,
      title: channel.snippet.title,
      description: channel.snippet.description
    }
  }

  return null
}

async function fetchYouTubeAnalytics(channelId: string, accessToken: string) {
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const startDate = thirtyDaysAgo.toISOString().split('T')[0]
  const endDate = today.toISOString().split('T')[0]

  const response = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?ids=channel%3D%3D${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,likes,subscribersGained&dimensions=day&sort=day`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch YouTube analytics')
  }

  const data = await response.json()
  if (data.rows) {
    return data.rows.map((row: any) => ({
      date: row[0],
      views: parseInt(row[1]),
      likes: parseInt(row[2]),
      subscribers: parseInt(row[3])
    }))
  }

  return []
}

async function mockGeminiOptimize(content: string, type: 'title' | 'description'): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  if (type === 'title') {
    return [
      content.toUpperCase(),
      `${content} - Must Watch!`,
      `You Won't Believe This ${content}`,
      `The Ultimate Guide to ${content}`,
      `${content}: Secrets Revealed`
    ];
  } else {
    const words = content.split(' ');
    return [
      words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      `Discover the hidden truths about ${content}. In this video, we delve deep into...`,
      `Are you ready to transform your understanding of ${content}? Join us as we explore...`,
      `${content} explained like never before. We break down complex concepts into simple...`,
      `Expert insights on ${content}. Learn from industry leaders and gain valuable knowledge...`
    ];
  }
}

function DashboardContent() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [channelSearch, setChannelSearch] = useState('')
  const [currentChannel, setCurrentChannel] = useState<{ id: string; title: string; description: string } | null>(null)
  const [analyticsData, setAnalyticsData] = useState([])
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [optimizedTitles, setOptimizedTitles] = useState<string[]>([])
  const [optimizedDescriptions, setOptimizedDescriptions] = useState<string[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useGoogleLogin({
    onSuccess: (response) => setAccessToken(response.access_token),
    scope: 'https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/yt-analytics.readonly',
  })

  const handleChannelSearch = async () => {
    if (!channelSearch.trim() || !accessToken) return
    setIsLoadingAnalytics(true)
    setError(null)
    try {
      const channel = await searchYouTubeChannel(channelSearch, accessToken)
      if (channel) {
        setCurrentChannel(channel)
        const analytics = await fetchYouTubeAnalytics(channel.id, accessToken)
        setAnalyticsData(analytics)
      } else {
        setError('No channel found')
      }
    } catch (error) {
      console.error('Error searching channel:', error)
      setError('Failed to search channel')
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  const handleOptimize = async () => {
    setIsOptimizing(true)
    setError(null)
    try {
      const [titles, descriptions] = await Promise.all([
        mockGeminiOptimize(title, 'title'),
        mockGeminiOptimize(description, 'description')
      ])
      setOptimizedTitles(titles)
      setOptimizedDescriptions(descriptions)
    } catch (error) {
      console.error('Error optimizing content:', error)
      setError('Failed to optimize content')
    } finally {
      setIsOptimizing(false)
    }
  }

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>YouTube Login</CardTitle>
            <CardDescription>Login with your YouTube account to access the dashboard</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => login()}>Login with Google</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">YouTube Channel Dashboard</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Channel Search</CardTitle>
            <CardDescription>Search for a YouTube channel to analyze</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter YouTube channel name"
                value={channelSearch}
                onChange={(e) => setChannelSearch(e.target.value)}
              />
              <Button onClick={handleChannelSearch} disabled={isLoadingAnalytics}>
                {isLoadingAnalytics ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Channel Analytics</CardTitle>
            <CardDescription>
              {currentChannel
                ? `Performance for ${currentChannel.title} over the last 30 days`
                : 'Search for a channel to view analytics'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <div className="flex justify-center items-center h-[300px]">Loading analytics...</div>
            ) : currentChannel ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="views" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="subscribers" stroke="#82ca9d" />
                    <Line yAxisId="right" type="monotone" dataKey="likes" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-[300px]">No channel selected</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Optimization</CardTitle>
            <CardDescription>Optimize your video title and description</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Video Title</Label>
                <Input
                  id="title"
                  placeholder="Enter your video title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Video Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter your video description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleOptimize} disabled={isOptimizing}>
              {isOptimizing ? 'Optimizing...' : 'Optimize Content'}
            </Button>
          </CardFooter>
        </Card>

        {(optimizedTitles.length > 0 || optimizedDescriptions.length > 0) && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Optimized Content Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="titles">
                  <AccordionTrigger>Optimized Titles</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {optimizedTitles.map((title, index) => (
                        <li key={index}>{title}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="descriptions">
                  <AccordionTrigger>Optimized Descriptions</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {optimizedDescriptions.map((desc, index) => (
                        <li key={index}>{desc}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <DashboardContent />
    </GoogleOAuthProvider>
  )
}