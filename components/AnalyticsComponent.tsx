'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', subscribers: 4000, views: 2400 },
  { name: 'Feb', subscribers: 3000, views: 1398 },
  { name: 'Mar', subscribers: 2000, views: 9800 },
  { name: 'Apr', subscribers: 2780, views: 3908 },
  { name: 'May', subscribers: 1890, views: 4800 },
  { name: 'Jun', subscribers: 2390, views: 3800 },
]

export default function AnalyticsComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Analytics</CardTitle>
        <CardDescription>Your channel's performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="subscribers"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line yAxisId="right" type="monotone" dataKey="views" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}