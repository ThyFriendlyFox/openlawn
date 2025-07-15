import type { Customer } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

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
        <CardTitle className="text-lg font-headline">{customer?.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-start text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-2 mt-1 shrink-0" />
          <p>{customer?.address}</p>
        </div>
      </CardContent>
    </Card>
  )
}
