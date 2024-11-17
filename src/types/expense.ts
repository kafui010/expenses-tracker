export interface Expense {
  id: number;
  amount: number;
  category: string;
  date: Date;
}

export interface ExpenseFormData {
  amount: string;
  category: string;
}