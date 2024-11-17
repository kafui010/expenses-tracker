import { useRef } from 'react'
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
}: ExpenseListProps) {
  const listRef = useRef<HTMLDivElement>(null)

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