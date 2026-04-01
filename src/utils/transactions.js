export function formatCurrency(amount) {
  return `\u20B1${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getFriendlySupabaseError(error) {
  if (!error) {
    return "Something went wrong while talking to Supabase.";
  }

  if (error.code === "PGRST205") {
    return "Supabase cannot find public.transactions yet. Create the table in the public schema, then add select and insert policies.";
  }

  if (error.code === "42703" || error.code === "PGRST204") {
    return "Supabase is missing the user_id column on public.transactions. Run the updated transactions SQL so signed-in users can save their own records.";
  }

  if (error.code === "23502" && error.message?.includes("user_id")) {
    return "Supabase requires a user_id for each transaction. Sign in again and run the updated transactions SQL if this keeps happening.";
  }

  if (
    error.code === "23514" &&
    error.message?.includes("transactions_type_check")
  ) {
    return "Supabase is still using the old transaction type rules. Run the updated transactions SQL so starting balance can be saved separately from income.";
  }

  if (error.code === "42501") {
    return "Supabase is blocking this request. Add authenticated Row Level Security policies on public.transactions so auth.uid() can read, insert, and delete the signed-in user's rows.";
  }

  return error.message;
}
