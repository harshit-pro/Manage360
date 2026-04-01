import api from "./api";

export interface CreateExpensePayload {
  amount: number;
  category: string;
  note?: string;
  spentAt?: string; // ISO date (yyyy-MM-dd)
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  note?: string;
  spentAt: string; // ISO date (yyyy-MM-dd)
}

export async function createExpense(payload: CreateExpensePayload): Promise<string> {
  const response = await api.post("/expenses", payload);
  return response.data.expenseId as string;
}

export async function fetchExpenses(): Promise<Expense[]> {
  const response = await api.get("/expenses");
  return response.data;
}

