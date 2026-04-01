import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { getFriendlySupabaseError } from "../utils/transactions";

function normalizeTransactions(data) {
  return (data || []).map((transaction) => ({
    ...transaction,
    amount: Number(transaction.amount || 0),
    date: transaction.date || "",
    note: transaction.note || "",
  }));
}

export default function useTransactions(userId) {
  const enabled = Boolean(userId);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!enabled) {
      setTransactions([]);
      setErrorMessage("");
      setIsLoading(false);
      return;
    }

    refreshTransactions();
  }, [enabled]);

  async function refreshTransactions() {
    if (!enabled) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("transactions")
      .select("id, type, amount, category, note, date, created_at")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch transactions error:", error);
      setErrorMessage(getFriendlySupabaseError(error));
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    setTransactions(normalizeTransactions(data));
    setIsLoading(false);
  }

  async function deleteTransaction(transactionId) {
    if (!enabled || !userId) {
      return { error: new Error("No signed-in user was found.") };
    }

    setErrorMessage("");

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId)
      .eq("user_id", userId);

    if (error) {
      console.error("Delete transaction error:", error);
      setErrorMessage(getFriendlySupabaseError(error));
      return { error };
    }

    await refreshTransactions();
    return { error: null };
  }

  async function resetTransactions() {
    if (!enabled || !userId) {
      return { error: new Error("No signed-in user was found.") };
    }

    setErrorMessage("");

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Reset transactions error:", error);
      setErrorMessage(getFriendlySupabaseError(error));
      return { error };
    }

    await refreshTransactions();
    return { error: null };
  }

  return {
    deleteTransaction,
    errorMessage,
    isLoading,
    refreshTransactions,
    resetTransactions,
    transactions,
  };
}
