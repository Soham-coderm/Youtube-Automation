'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function SubscriptionComponent() {
  const [isSubscribed, setIsSubscribed] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>Manage your premium features subscription</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch
            id="subscription"
            checked={isSubscribed}
            onCheckedChange={setIsSubscribed}
          />
          <Label htmlFor="subscription">Premium Subscription</Label>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSubscribed
            ? 'You have access to all premium features.'
            : 'Upgrade to access advanced analytics and tools.'}
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setIsSubscribed(!isSubscribed)}>
          {isSubscribed ? 'Manage Subscription' : 'Upgrade Now'}
        </Button>
      </CardFooter>
    </Card>
  )
}