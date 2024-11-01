import { Skeleton } from '@/components/ui/skeleton'

export default function Sekeleton() {
  return (
    <div className='w-full flex flex-col items-center m-5'>
      <div className='space-y-2 w-full'>
        <div className='flex gap-2 items-center'>
          <Skeleton className="w-[80px] h-[80px] rounded-full" />
          <div className='space-y-2'>
            <Skeleton className="w-[140px] h-[20px] rounded-full" />
            <Skeleton className="w-[100px] h-[20px] rounded-full" />
          </div>
        </div>
        <Skeleton className="w-full h-[20px] rounded-full" />
        <Skeleton className="w-[95%] h-[20px] rounded-full" />
        <Skeleton className="w-[97%] h-[20px] rounded-full" />
        <Skeleton className="w-[90%] h-[20px] rounded-full" />
      </div>
      <div className='space-y-2  w-full'>
        <div className='flex gap-2 items-center'>
          <Skeleton className="w-[80px] h-[80px] rounded-full" />
          <div className='space-y-2'>
            <Skeleton className="w-[140px] h-[20px] rounded-full" />
            <Skeleton className="w-[100px] h-[20px] rounded-full" />
          </div>
        </div>
        <Skeleton className="w-full h-[20px] rounded-full" />
        <Skeleton className="w-[95%] h-[20px] rounded-full" />
        <Skeleton className="w-[97%] h-[20px] rounded-full" />
        <Skeleton className="w-[90%] h-[20px] rounded-full" />
      </div>
      <div className='space-y-2 w-full'>
        <div className='flex gap-2 items-center'>
          <Skeleton className="w-[80px] h-[80px] rounded-full" />
          <div className='space-y-2'>
            <Skeleton className="w-[140px] h-[20px] rounded-full" />
            <Skeleton className="w-[100px] h-[20px] rounded-full" />
          </div>
        </div>
        <Skeleton className="w-full h-[20px] rounded-full" />
        <Skeleton className="w-[95%] h-[20px] rounded-full" />
        <Skeleton className="w-[97%] h-[20px] rounded-full" />
        <Skeleton className="w-[90%] h-[20px] rounded-full" />
      </div>
    </div>
  )
}
