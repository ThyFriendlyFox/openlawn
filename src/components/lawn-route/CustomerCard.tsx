import type { Customer } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Plus, Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface CustomerCardProps {
  customer?: Customer
  isAddCard?: boolean
  onClick?: () => void
}

export function CustomerCard({
  customer,
  isAddCard = false,
  onClick,
}: CustomerCardProps) {
  if (isAddCard) {
    return (
      <Card
        className="h-full flex flex-col items-center justify-center border-dashed border-2 hover:border-primary hover:text-primary transition-all cursor-pointer bg-secondary/50"
        onClick={onClick}
      >
        <CardContent className="p-6 text-center flex flex-col items-center justify-center">
          <Plus className="w-10 h-10 mb-2" />
          <p className="font-semibold">Add New Customer</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-headline">{customer?.name}</CardTitle>
          {customer?.servicePreferences && (
            <Badge variant="outline" className="text-xs">
              {customer.servicePreferences.serviceFrequency}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-start text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-2 mt-1 shrink-0" />
          <p>{customer?.address}</p>
        </div>
        
        {customer?.servicePreferences && (
          <div className="space-y-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 mr-1" />
              <span>
                {customer.servicePreferences.preferredDays.length > 0 
                  ? customer.servicePreferences.preferredDays.slice(0, 2).join(', ')
                  : 'No preferred days'
                }
                {customer.servicePreferences.preferredDays.length > 2 && '...'}
              </span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              <span>
                {customer.servicePreferences.preferredTimeRange.start} - {customer.servicePreferences.preferredTimeRange.end}
              </span>
            </div>
          </div>
        )}
        
        {customer?.serviceHistory && customer.serviceHistory.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Last service: {new Date(customer.serviceHistory[0].date).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
