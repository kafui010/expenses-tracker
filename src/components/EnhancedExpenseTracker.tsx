import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths, subYears } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExpenseForm } from './expense-tracker/ExpenseForm'
import { ExpenseList } from './expense-tracker/ExpenseList'
import { ExpenseSummary } from './expense-tracker/ExpenseSummary'
import { ExpenseChart } from './expense-tracker/ExpenseChart'
import { Expense, ExpenseFormData } from '@/types/expense'

export default function EnhancedExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const savedExpenses = localStorage.getItem('expenses')
    return savedExpenses ? JSON.parse(savedExpenses) : []
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [totalTimeFrame, setTotalTimeFrame] = useState('day')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  const onSubmit = (values: ExpenseFormData) => {
    const newExpense: Expense = {
      id: Date.now(),
      amount: parseFloat(values.amount),
      category: values.category,
      date: new Date(),
    }
    setExpenses([newExpense, ...expenses])
    setAlertMessage('Expense created successfully!')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleEdit = (id: number, newAmount: string) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id ? { ...expense, amount: parseFloat(newAmount) } : expense
      )
    )
    setEditingId(null)
    setAlertMessage('Expense updated successfully!')
    setShowAlert(true)
    setTimeout(() => {
      setShowAlert(false)
      setIsPaused(false)
    }, 3000)
  }

  const handleDelete = (id: number) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
    setAlertMessage('Expense deleted successfully!')
    setShowAlert(true)
    setTimeout(() => {
      setShowAlert(false)
      setIsPaused(false)
    }, 3000)
  }

  const getFilteredExpenses = () => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      switch (totalTimeFrame) {
        case 'day':
          return (
            expenseDate >= startOfDay(selectedDate) &&
            expenseDate <= endOfDay(selectedDate)
          )
        case 'month':
          return (
            expenseDate >= startOfMonth(selectedDate) &&
            expenseDate <= endOfMonth(selectedDate)
          )
        case 'year':
          return (
            expenseDate >= startOfYear(selectedDate) &&
            expenseDate <= endOfYear(selectedDate)
          )
        default:
          return true
      }
    })
  }

  const calculateTotal = () => {
    return getFilteredExpenses()
      .reduce((sum, expense) => sum + expense.amount, 0)
      .toFixed(2)
  }

  const getPreviousPeriodExpenses = () => {
    let startDate: Date, endDate: Date
    switch (totalTimeFrame) {
      case 'day':
        startDate = subMonths(startOfDay(selectedDate), 1)
        endDate = subMonths(endOfDay(selectedDate), 1)
        break
      case 'month':
        startDate = subMonths(startOfMonth(selectedDate), 1)
        endDate = subMonths(endOfMonth(selectedDate), 1)
        break
      case 'year':
        startDate = subYears(startOfYear(selectedDate), 1)
        endDate = subYears(endOfYear(selectedDate), 1)
        break
      default:
        return []
    }

    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate >= startDate && expenseDate <= endDate
    })
  }

  const getChartData = () => {
    const currentPeriodExpenses = getFilteredExpenses()
    const previousPeriodExpenses = getPreviousPeriodExpenses()

    const data: Record<string, { current: number; previous: number }> = {}
    
    currentPeriodExpenses.forEach((expense) => {
      const date = format(new Date(expense.date), 'yyyy-MM-dd')
      if (data[date]) {
        data[date].current += expense.amount
      } else {
        data[date] = { current: expense.amount, previous: 0 }
      }
    })

    previousPeriodExpenses.forEach((expense) => {
      const date = format(new Date(expense.date), 'yyyy-MM-dd')
      if (data[date]) {
        data[date].previous += expense.amount
      } else {
        data[date] = { current: 0, previous: expense.amount }
      }
    })

    return Object.entries(data).map(([date, amounts]) => ({
      date,
      current: amounts.current,
      previous: amounts.previous,
    }))
  }

  const resetData = () => {
    setExpenses([])
    localStorage.removeItem('expenses')
    setAlertMessage('All data has been reset!')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleTimeFrameChange = (value: string) => {
    setTotalTimeFrame(value)
    setSelectedDate(new Date())
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-800 animate-fade-in-down">
        Enhanced Expense Tracker
      </h1>

      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="mb-4 fixed top-4 right-4 z-50"
          >
            <Alert className="bg-green-100 border-green-400 text-green-700">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ExpenseForm onSubmit={onSubmit} />
        <ExpenseList
          expenses={getFilteredExpenses()}
          totalTimeFrame={totalTimeFrame}
          selectedDate={selectedDate}
          editingId={editingId}
          setEditingId={setEditingId}
          onEdit={handleEdit}
          onDelete={handleDelete}
          setIsPaused={setIsPaused}
        />
      </div>

      <ExpenseSummary
        totalTimeFrame={totalTimeFrame}
        selectedDate={selectedDate}
        total={calculateTotal()}
        onTimeFrameChange={handleTimeFrameChange}
        onDateSelect={setSelectedDate}
      />

      <ExpenseChart
        data={getChartData()}
        onReset={resetData}
      />
    </div>
  )
}