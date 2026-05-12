'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CourtImage } from '@/components/shared/court-image'
import { formatCurrency } from '@/lib/utils/currency'
import { MapPin, Clock } from 'lucide-react'

interface Court {
  id: number
  name: string
  description?: string
  price_per_hour: number
  location?: string
  image?: string
  is_available: boolean
  facilities?: string[]
}

interface CourtCardProps {
  court: Court
}

export function CourtCard({ court }: CourtCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full bg-gray-200">
          <CourtImage
            image={court.image}
            alt={court.name}
            className="object-cover"
          />
          {court.is_available && (
            <Badge className="absolute right-2 top-2 bg-green-600">
              Tersedia
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <CardTitle className="mb-2">{court.name}</CardTitle>
        
        {court.description && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
            {court.description}
          </p>
        )}

        <div className="mb-4 space-y-2">
          <div className="flex items-center text-lg font-semibold text-green-600">
            <Clock className="mr-2 h-4 w-4" />
            {formatCurrency(court.price_per_hour)}/jam
          </div>
          
          {court.location && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="mr-2 h-4 w-4" />
              {court.location}
            </div>
          )}
        </div>

        {court.facilities && court.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {court.facilities.slice(0, 3).map((facility: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {facility}
              </Badge>
            ))}
            {court.facilities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{court.facilities.length - 3} lainnya
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/courts/${court.id}`} className="w-full">
          <Button className="w-full">Lihat Detail & Booking</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
