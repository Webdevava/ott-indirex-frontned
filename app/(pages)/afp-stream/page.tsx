import DeviceEventTable from '@/components/modules/live-stream/afp-events-table'
import { Separator } from '@/components/ui/separator'
import React from 'react'

const LiveStreamPage = () => {
  return (
 <div className="container mx-auto p-4">
        <div className="mb-4">
        <h1 className="text-2xl font-bold">AFP Stream</h1>
        <p className='text-muted-foreground text-sm mt-2'>Audio fingerprint live strem</p>
        <Separator />
      </div>
      <DeviceEventTable/>
    </div>
  )
}

export default LiveStreamPage