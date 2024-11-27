import { useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ExpenseItem } from './ExpenseItem'

interface ExpenseListProps {
  expenses: Array<{
    id: number;
    amount: number;
    category: string;
    date: Date;
  }>;
  totalTimeFrame: string;
  selectedDate: Date;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  onEdit: (id: number, amount: string) => void;
  onDelete: (id: number) => void;
  setIsPaused: (isPaused: boolean) => void;
  isPaused: boolean;
}

export function ExpenseList({
  expenses,
  totalTimeFrame,
  selectedDate,
  editingId,
  setEditingId,
  onEdit,
  onDelete,
  setIsPaused,
  isPaused,
}: ExpenseListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let scrollInterval: NodeJS.Timeout;
    
    if (expenses.length >= 3 && !isPaused && listRef.current) {
      scrollInterval = setInterval(() => {
        if (listRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = listRef.current
          
          // Reset to top when reached bottom
          if (scrollTop + clientHeight >= scrollHeight) {
            listRef.current.scrollTop = 0
          } else {
            listRef.current.scrollTop += 0.5 // Gentle scroll speed
          }
        }
      }, 50)
    }

    return () => {
      if (scrollInterval) {
        clearInterval(scrollInterval)
      }
    }
  }, [expenses.length, isPaused])

  return (
    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-2xl">Filtered Expenses</CardTitle>
        <CardDescription className="text-indigo-100 font-semibold">
          {`Expenses for ${totalTimeFrame === 'day' ? 'the selected day' : totalTimeFrame === 'month' ? 'the selected month' : 'the selected year'}:`}
          <br />
          <span className="text-xl font-bold">
            {format(selectedDate, totalTimeFrame === 'year' ? 'yyyy' : totalTimeFrame === 'month' ? 'MMMM yyyy' : 'MMMM do, yyyy')}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={listRef}
          className="h-64 overflow-y-auto"
          onWheel={(e) => {
            e.preventDefault()
            if (listRef.current) {
              listRef.current.scrollTop += e.deltaY
            }
          }}
        >
          <AnimatePresence>
            {expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                editingId={editingId}
                onEdit={onEdit}
                onDelete={onDelete}
                setEditingId={setEditingId}
                setIsPaused={setIsPaused}
              />
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}