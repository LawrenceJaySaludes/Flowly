import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import SummaryCard from "../components/SummaryCard";
import { supabase } from "../supabase";
import TransactionItem from "../components/TransactionItem";

const DateTimePicker =
  Platform.OS === "web" ? null : require("@react-native-community/datetimepicker").default;

const initialFormState = {
  type: "expense",
  amount: "",
  category: "",
  note: "",
  date: "2026-03-30",
};

function formatCurrency(amount) {
  return `\u20B1${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
}

function sanitizeAmountInput(value) {
  const cleanedValue = value.replace(/[^\d.]/g, "");

  if (!cleanedValue) {
    return "";
  }

  const startsWithDecimal = cleanedValue.startsWith(".");
  const [wholePart, ...decimalParts] = cleanedValue.split(".");
  const normalizedWholePart = startsWithDecimal ? "0" : wholePart;

  if (decimalParts.length === 0) {
    return startsWithDecimal ? "0." : normalizedWholePart;
  }

  return `${normalizedWholePart}.${decimalParts.join("").slice(0, 2)}`;
}

function sanitizeDateInput(value) {
  return value.replace(/[^\d-]/g, "").slice(0, 10);
}

function getFriendlySupabaseError(error) {
  if (!error) {
    return "Something went wrong while talking to Supabase.";
  }

  if (error.code === "PGRST205") {
    return "Supabase cannot find public.transactions yet. Create the table in the public schema, then add select and insert policies.";
  }

  if (error.code === "42501") {
    return "Supabase is blocking this request. Add Row Level Security policies for anon select and insert on public.transactions.";
  }

  return error.message;
}

export default function DashboardScreen() {
  const isWeb = Platform.OS === "web";
  const [transactions, setTransactions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formValues, setFormValues] = useState(initialFormState);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(parseDate(initialFormState.date));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("transactions")
      .select("id, type, amount, category, note, date, created_at")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch transactions error:", error);
      setErrorMessage(getFriendlySupabaseError(error));
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    const normalizedTransactions = (data || []).map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount || 0),
      date: transaction.date || "",
      note: transaction.note || "",
    }));

    setTransactions(normalizedTransactions);
    setIsLoading(false);
  }

  function handleInputChange(field, value) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function handleAmountChange(value) {
    handleInputChange("amount", sanitizeAmountInput(value));
  }

  function handleDateTextChange(value) {
    handleInputChange("date", sanitizeDateInput(value));
  }

  function handleOpenModal() {
    setIsModalVisible(true);
  }

  function handleCloseModal() {
    setIsModalVisible(false);
    setIsDatePickerVisible(false);
  }

  function handleOpenDatePicker() {
    setSelectedDate(parseDate(formValues.date));
    setIsDatePickerVisible(true);
  }

  function handleDateChange(event, nextDate) {
    if (event?.type === "dismissed") {
      setIsDatePickerVisible(false);
      return;
    }

    if (Platform.OS === "android") {
      setIsDatePickerVisible(false);
    }

    if (!nextDate) {
      return;
    }

    setSelectedDate(nextDate);
    handleInputChange("date", formatDate(nextDate));
  }

  async function handleSubmitTransaction() {
    const transactionPayload = {
      ...formValues,
      amount: Number(formValues.amount || 0),
      category: formValues.category.trim(),
      note: formValues.note.trim(),
    };

    if (!transactionPayload.amount || !transactionPayload.category || !transactionPayload.date) {
      Alert.alert("Missing fields", "Please complete the type, amount, category, and date.");
      return;
    }

    console.log("New transaction:", transactionPayload);
    setIsSaving(true);

    const { error } = await supabase.from("transactions").insert({
      type: transactionPayload.type,
      amount: transactionPayload.amount,
      category: transactionPayload.category,
      note: transactionPayload.note,
      date: `${transactionPayload.date}T00:00:00`,
    });

    if (error) {
      console.error("Insert transaction error:", error);
      Alert.alert("Unable to save", getFriendlySupabaseError(error));
      setIsSaving(false);
      return;
    }

    setFormValues(initialFormState);
    setSelectedDate(parseDate(initialFormState.date));
    setIsDatePickerVisible(false);
    handleCloseModal();
    await fetchTransactions();
    setIsSaving(false);
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isWeb ? "#F7F9FC" : "#FFFFFF" }}
      className={isWeb ? "items-center justify-center px-4 py-6" : ""}
    >
      <View
        className={`w-full flex-1 bg-canvas ${isWeb ? "max-w-[420px] rounded-[32px]" : ""}`}
        style={
          isWeb
            ? {
                shadowColor: "#111827",
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.08,
                shadowRadius: 30,
              }
            : undefined
        }
      >
        <FlatList
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28 }}
          data={transactions}
          ItemSeparatorComponent={() => <View className="h-3" />}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <Pressable
              className="mt-8 rounded-2xl bg-brand px-5 py-4 active:opacity-90"
              onPress={handleOpenModal}
            >
              <Text className="text-center text-base font-semibold text-white">
                Add Transaction
              </Text>
            </Pressable>
          }
          ListHeaderComponent={
            <View>
              <View className="items-center">
                <Text className="text-[34px] font-extrabold tracking-tight text-ink">Flowly</Text>
                <Text className="mt-3 max-w-[280px] text-center text-base leading-6 text-muted">
                  Track your money, understand your habits
                </Text>
              </View>

              <View className="mt-8 gap-4">
                <SummaryCard title="Total Balance" amount={formatCurrency(totalBalance)} />
                <SummaryCard
                  title="Total Income"
                  amount={formatCurrency(totalIncome)}
                  tone="income"
                />
                <SummaryCard
                  title="Total Expenses"
                  amount={formatCurrency(totalExpenses)}
                  tone="expense"
                />
              </View>

              <View className="mb-4 mt-8 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-ink">Recent Transactions</Text>
                <Text className="text-sm font-medium text-muted">{transactions.length} items</Text>
              </View>

              {errorMessage ? (
                <View className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                  <Text className="text-sm font-medium text-danger">{errorMessage}</Text>
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <View className="items-center rounded-2xl border border-slate-100 bg-surface px-5 py-10">
              {isLoading ? (
                <>
                  <ActivityIndicator color="#22C55E" size="large" />
                  <Text className="mt-4 text-sm font-medium text-muted">
                    Loading transactions...
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-base font-semibold text-ink">No transactions yet</Text>
                  <Text className="mt-2 text-center text-sm leading-6 text-muted">
                    Add your first income or expense to see your dashboard update.
                  </Text>
                </>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TransactionItem transaction={item} formatCurrency={formatCurrency} />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={isModalVisible}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View className="flex-1 justify-end bg-black/35">
            <Pressable className="absolute inset-0" onPress={handleCloseModal} />

            <View className="rounded-t-[32px] bg-canvas px-5 pb-8 pt-5">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-ink">Add Transaction</Text>
                <Pressable onPress={handleCloseModal}>
                  <Text className="text-sm font-semibold text-muted">Close</Text>
                </Pressable>
              </View>

              <ScrollView
                className="mt-6"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View className="mt-5 gap-4">
                  <View>
                    <Text className="text-sm font-semibold text-ink">Type</Text>
                    <View className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-surface">
                      <Picker
                        dropdownIconColor="#6B7280"
                        onValueChange={(value) => handleInputChange("type", value)}
                        selectedValue={formValues.type}
                        style={{ color: "#111827" }}
                      >
                        <Picker.Item label="Income" value="income" />
                        <Picker.Item label="Expense" value="expense" />
                      </Picker>
                    </View>
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-ink">Amount</Text>
                    <TextInput
                      className="mt-2 rounded-2xl border border-slate-200 bg-surface px-4 py-4 text-base text-ink"
                      inputMode="decimal"
                      keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                      onChangeText={handleAmountChange}
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                      value={formValues.amount}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-ink">Category</Text>
                    <TextInput
                      autoCapitalize="words"
                      className="mt-2 rounded-2xl border border-slate-200 bg-surface px-4 py-4 text-base text-ink"
                      onChangeText={(value) => handleInputChange("category", value)}
                      placeholder="Salary, Food, Rent..."
                      placeholderTextColor="#9CA3AF"
                      value={formValues.category}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-ink">Note</Text>
                    <TextInput
                      className="mt-2 rounded-2xl border border-slate-200 bg-surface px-4 py-4 text-base text-ink"
                      multiline
                      onChangeText={(value) => handleInputChange("note", value)}
                      placeholder="Add a short note"
                      placeholderTextColor="#9CA3AF"
                      textAlignVertical="top"
                      value={formValues.note}
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-semibold text-ink">Date</Text>
                    {isWeb ? (
                      <TextInput
                        className="mt-2 rounded-2xl border border-slate-200 bg-surface px-4 py-4 text-base text-ink"
                        inputMode="numeric"
                        onChangeText={handleDateTextChange}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#9CA3AF"
                        value={formValues.date}
                      />
                    ) : (
                      <View>
                        <Pressable
                          className="mt-2 rounded-2xl border border-slate-200 bg-surface px-4 py-4"
                          onPress={handleOpenDatePicker}
                        >
                          <Text className="text-base text-ink">{formValues.date}</Text>
                        </Pressable>

                        {DateTimePicker && isDatePickerVisible ? (
                          <View className="mt-3 rounded-2xl border border-slate-200 bg-surface p-2">
                            <DateTimePicker
                              display={Platform.OS === "ios" ? "spinner" : "default"}
                              mode="date"
                              onChange={handleDateChange}
                              value={selectedDate}
                            />

                            {Platform.OS === "ios" ? (
                              <Pressable
                                className="mt-2 self-end rounded-xl bg-brand px-4 py-2"
                                onPress={() => setIsDatePickerVisible(false)}
                              >
                                <Text className="text-sm font-semibold text-white">Done</Text>
                              </Pressable>
                            ) : null}
                          </View>
                        ) : null}
                      </View>
                    )}
                  </View>
                </View>

                <View className="mt-6 flex-row gap-3 pb-2">
                  <Pressable
                    className="flex-1 rounded-2xl border border-slate-200 px-5 py-4"
                    onPress={handleCloseModal}
                  >
                    <Text className="text-center text-base font-semibold text-ink">Cancel</Text>
                  </Pressable>

                  <Pressable
                    className="flex-1 rounded-2xl bg-brand px-5 py-4 active:opacity-90"
                    disabled={isSaving}
                    onPress={handleSubmitTransaction}
                  >
                    <Text className="text-center text-base font-semibold text-white">
                      {isSaving ? "Saving..." : "Save"}
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
