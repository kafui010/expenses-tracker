'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths, subYears } from 'date-fns'
import { CalendarIcon, PlusCircle, MinusCircle, AlertCircle, Trash2, Edit2, Save, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const expenseCategories = [
  'Food',
  'Drugs',
  'Airtime',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Others',
]

interface ExpenseData {
  current: number;
  previous: number;
}

interface ChartData {
  [key: string]: ExpenseData;
}

const formSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Please select a category'),
})

export default function EnhancedExpenseTracker() {
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem('expenses')
    return savedExpenses ? JSON.parse(savedExpenses) : []
  })
  const [editingId, setEditingId] = useState(null)
  const [totalTimeFrame, setTotalTimeFrame] = useState('day')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const filteredExpensesRef = useRef(null)


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      category: '',
    },
  })


  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])


  useEffect(() => {
    const scrollInterval = setInterval(() => {
      if (filteredExpensesRef.current && !isPaused) {
        const { scrollTop, scrollHeight, clientHeight } = filteredExpensesRef.current
        if (scrollTop + clientHeight === scrollHeight) {
          setScrollPosition(0)
        } else {
          setScrollPosition((prevPosition) => prevPosition + 1)
        }
        filteredExpensesRef.current.scrollTop = scrollPosition
      }
    }, 50)

    return () => clearInterval(scrollInterval)
  }, [scrollPosition, isPaused])


  const onSubmit = (values) => {
    const newExpense = {
      id: Date.now(),
      amount: parseFloat(values.amount),
      category: values.category,
      date: new Date(),
    }
    setExpenses([newExpense, ...expenses])
    form.reset({ amount: '', category: '' })
    setAlertMessage('Expense created successfully!')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }


  const handleEdit = (id, newAmount) => {
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
      setIsPaused(false) // Resume scrolling
    }, 3000)
  }


  const handleDelete = (id) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
    setAlertMessage('Expense deleted successfully!')
    setShowAlert(true)
    setTimeout(() => {
      setShowAlert(false)
      setIsPaused(false) // Resume scrolling
    }, 3000)
  }


  const calculateTotal = () => {
    return getFilteredExpenses()
      .reduce((sum, expense) => sum + expense.amount, 0)
      .toFixed(2)
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


  const getChartData = () => {
    const currentPeriodExpenses = getFilteredExpenses()
    const previousPeriodExpenses = getPreviousPeriodExpenses()

    const data: ChartData = {}
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


  const getPreviousPeriodExpenses = () => {
    let startDate, endDate
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


  const resetData = () => {
    setExpenses([])
    localStorage.removeItem('expenses')
    setAlertMessage('All data has been reset!')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }


  const ExpenseItem = ({ expense }) => {
    const x = useMotionValue(0)
    const background = useTransform(
      x,
      [-100, 0, 100],
      ['rgba(239, 68, 68, 0.2)', 'rgba(255, 255, 255, 0.95)', 'rgba(34, 197, 94, 0.2)']
    )
    const [editAmount, setEditAmount] = useState(expense.amount.toFixed(2))

    return (
      <motion.div
        style={{ x, background }}
        onTapStart={() => setIsPaused(true)}
        onTap={() => {
          // Handle tap logic here
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(event, info) => {
          if (info.offset.x < -50) {
            handleDelete(expense.id)
          } else if (info.offset.x > 50) {
            setEditingId(expense.id)
          }
          setIsPaused(false) // Resume scrolling after action
        }}
        className="bg-white/95 backdrop-blur-sm p-4 rounded-lg mb-4 shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-102 border border-indigo-100"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-indigo-800">{expense.category}</h3>
            <p className="text-sm text-gray-600">
              {format(new Date(expense.date), 'PPpp')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {editingId === expense.id ? (
              <>
                <Input
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-24 bg-white/50 text-indigo-700"
                />
                <Button
                  onClick={() => handleEdit(expense.id, editAmount)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <span className="font-bold text-indigo-700">${expense.amount.toFixed(2)}</span>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-800 animate-fade-in-down">Enhanced Expense Tracker</h1>

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
              <AlertDescription>
                {alertMessage}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-700">Add New Expense</CardTitle>
            <CardDescription>Enter your expense details below</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} className="bg-white/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/50">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-300">
                  Create Expense
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

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
              ref={filteredExpensesRef}
              className="h-64 overflow-y-auto"
              onWheel={(e) => {
                e.preventDefault()
                filteredExpensesRef.current.scrollTop += e.deltaY
              }}
            >
              <AnimatePresence>
                {getFilteredExpenses().map((expense) => (
                  <ExpenseItem key={expense.id} expense={expense} />
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-2xl text-indigo-700">Expense Summary</CardTitle>
          <CardDescription>View your total expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Label>Time Frame:</Label>
            <Select onValueChange={(value) => {
              setTotalTimeFrame(value)
              setSelectedDate(new Date()) // Reset to current date when changing time frame
            }} defaultValue={totalTimeFrame}>
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
                  onSelect={(date) => {
                    setSelectedDate(date || new Date())
                    // Close the popover after selection
                    document.body.click()
                  }}
                  initialFocus
                  disabled={(date) =>
                    totalTimeFrame === 'year' ?
                      date < new Date(1990, 0, 1) || date > new Date() :
                      date > new Date()
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="text-3xl font-bold text-indigo-800 animate-pulse">
            Total: ${calculateTotal()}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-2xl text-indigo-700">Expense Comparison Chart</CardTitle>
          <CardDescription>Compare current expenses with previous period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }} />
              <Legend />
              <Line type="monotone" dataKey="current" name="Current Period" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="previous" name="Previous Period" stroke="#e11d48" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
          <Button onClick={resetData} className="mt-4 bg-red-500 hover:bg-red-600 text-white">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
