import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

interface ExpenseSummaryProps {
  totalTimeFrame: string;
  selectedDate: Date;
  total: string;
  onTimeFrameChange: (value: string) => void;
  onDateSelect: (date: Date | undefined) => void;
}

export function ExpenseSummary({
  totalTimeFrame,
  selectedDate,
  total,
  onTimeFrameChange,
  onDateSelect,
}: ExpenseSummaryProps) {
  return (
    <Card className="mt-8 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl text-indigo-700">Expense Summary</CardTitle>
        <CardDescription>View your total expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <Label>Time Frame:</Label>
          <Select
            onValueChange={onTimeFrameChange}
            defaultValue={totalTimeFrame}
          >
            <SelectTrigger className="w-[180px] bg-white/50">
              <SelectValue placeholder="Select time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <Label>Select Date:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal bg-white/50",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, totalTimeFrame === 'year' ? 'yyyy' : totalTimeFrame === 'month' ? 'MMMM yyyy' : 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={onDateSelect}
                initialFocus
                disabled={(date) =>
                  totalTimeFrame === 'year'
                    ? date < new Date(1990, 0, 1) || date > new Date()
                    : date > new Date()
                }
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="text-3xl font-bold text-indigo-800 animate-pulse">
          Total: ₵{total}
        </div>
      </CardContent>
    </Card>
  )
}