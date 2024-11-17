import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { RefreshCw } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ExpenseChartProps {
  data: Array<{
    date: string;
    current: number;
    previous: number;
  }>;
  onReset: () => void;
}

export function ExpenseChart({ data, onReset }: ExpenseChartProps) {
  return (
    <Card className="mt-8 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl text-indigo-700">Expense Comparison Chart</CardTitle>
        <CardDescription>Compare current expenses with previous period</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
            <Legend />
            <Line
              type="monotone"
              dataKey="current"
              name="Current Period"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="previous"
              name="Previous Period"
              stroke="#e11d48"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <Button onClick={onReset} className="mt-4 bg-red-500 hover:bg-red-600 text-white">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset All Data
        </Button>
      </CardContent>
    </Card>
  )
}