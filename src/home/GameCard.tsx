import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface GameCardProps {
  title: string
  description: string
  modes: string[]
}

export function GameCard({ title, description, modes }: GameCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {modes.map((mode) => (
          <Button key={mode} variant="outline" className="w-full">
            {mode}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
} 