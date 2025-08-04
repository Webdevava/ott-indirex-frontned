import DeviceEventTable from '@/components/modules/live-stream/events-table'
import { Separator } from '@/components/ui/separator'
import React from 'react'

const LiveStreamPage = () => {
  return (
 <div className="container mx-auto p-4">
        <div className="mb-4">
        <h1 className="text-2xl font-bold">Live Stream</h1>
        <Separator />
      </div>
      <DeviceEventTable/>
    </div>
  )
}

export default LiveStreamPage