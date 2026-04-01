import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
import {
  formatCurrency,
  getFriendlySupabaseError,
} from "../utils/transactions";

const DateTimePicker =
  Platform.OS === "web"
    ? null
    : require("@react-native-community/datetimepicker").default;
const FLOWLY_LOGO = require("../../assets/flowly.png");

const STARTING_BALANCE_TYPE = "initial_balance";
const STARTING_BALANCE_CATEGORY = "Starting Balance";

const PRESET_CATEGORIES = {
  income: ["Salary", "Profit", "Allowance", "Bonus", "Gift", "Investment"],
  expense: [
    "Food",
    "Transportation",
    "Drinks/Coffee",
    "Games",
    "Rent",
    "Utilities",
    "Entertainment",
  ],
};

const QUICK_AMOUNTS = {
  income: [50, 500, 1000, 5000, 10000],
  initial_balance: [500, 1000, 5000, 10000, 20000],
  expense: [50, 100, 250, 500, 1000],
};

const modalCardShadow = {
  shadowColor: "#111827",
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.05,
  shadowRadius: 24,
  elevation: 3,
};

const sectionCardShadow = {
  shadowColor: "#0F172A",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 20,
  elevation: 3,
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayDateString() {
  return formatDate(new Date());
}

function formatHeaderDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(date);
}

function createInitialFormState() {
  return {
    type: "expense",
    amount: "",
    category: "",
    note: "",
    date: getTodayDateString(),
  };
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

function getRetainedCategoryForType(category, nextType, customCategories) {
  if (nextType === STARTING_BALANCE_TYPE) {
    return STARTING_BALANCE_CATEGORY;
  }

  const defaultCategory = PRESET_CATEGORIES[nextType]?.[0] || "";

  if (!category) {
    return defaultCategory;
  }

  if (category === STARTING_BALANCE_CATEGORY) {
    return defaultCategory;
  }

  const matchesCustomCategory = customCategories.some(
    (customCategory) => customCategory.toLowerCase() === category.toLowerCase(),
  );

  if (matchesCustomCategory) {
    return category;
  }

  const matchesPresetCategory = PRESET_CATEGORIES[nextType].some(
    (presetCategory) => presetCategory.toLowerCase() === category.toLowerCase(),
  );

  return matchesPresetCategory ? category : defaultCategory;
}

function getTransactionTone(type) {
  if (type === "income") {
    return {
      accent: "#16A34A",
      badgeBackground: "#ECFDF5",
      badgeBorder: "#BBF7D0",
      badgeText: "#166534",
      surfaceTint: "#F0FDF4",
      surfaceBorder: "#DCFCE7",
      title: "Income",
      helper: "Money coming in",
    };
  }

  if (type === STARTING_BALANCE_TYPE) {
    return {
      accent: "#0F766E",
      badgeBackground: "#CCFBF1",
      badgeBorder: "#99F6E4",
      badgeText: "#115E59",
      surfaceTint: "#F0FDFA",
      surfaceBorder: "#CCFBF1",
      title: "Starting Balance",
      helper: "Opening funds",
    };
  }

  return {
    accent: "#DC2626",
    badgeBackground: "#FEF2F2",
    badgeBorder: "#FECACA",
    badgeText: "#B91C1C",
    surfaceTint: "#FFF1F2",
    surfaceBorder: "#FFE4E6",
    title: "Expense",
    helper: "Money going out",
  };
}

export default function DashboardScreen({
  currentUserId,
  errorMessage,
  isLoading,
  onOpenHistory,
  onOpenSettings,
  refreshTransactions,
  transactions,
}) {
  const isWeb = Platform.OS === "web";
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formValues, setFormValues] = useState(() => createInitialFormState());
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() =>
    parseDate(getTodayDateString()),
  );
  const [isSaving, setIsSaving] = useState(false);
  const recentTransactions = transactions.slice(0, 4);
  const isStartingBalanceEntry = formValues.type === STARTING_BALANCE_TYPE;
  const transactionTone = getTransactionTone(formValues.type);
  const availableCategories = isStartingBalanceEntry
    ? []
    : [
        ...PRESET_CATEGORIES[formValues.type],
        ...customCategories.filter(
          (category) =>
            !PRESET_CATEGORIES[formValues.type].some(
              (presetCategory) =>
                presetCategory.toLowerCase() === category.toLowerCase(),
            ),
        ),
      ];
  const quickAmounts = QUICK_AMOUNTS[formValues.type] || QUICK_AMOUNTS.income;
  const headerDateLabel = formatHeaderDate(new Date());
  const startingBalanceTransactions = transactions.filter(
    (transaction) => transaction.type === STARTING_BALANCE_TYPE,
  );
  const startingBalanceAmount = startingBalanceTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );
  const hasStartingBalance = startingBalanceTransactions.length > 0;
  const needsStartingBalance = !hasStartingBalance && transactions.length === 0;

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalBalance = startingBalanceAmount + totalIncome - totalExpenses;
  const hasSpendableBalance = totalBalance > 0.004;

  function handleInputChange(field, value) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  }

  function handleAmountChange(value) {
    handleInputChange("amount", sanitizeAmountInput(value));
  }

  function handleTypeChange(nextType) {
    if (nextType === "expense" && !hasSpendableBalance) {
      Alert.alert(
        needsStartingBalance
          ? "Add starting balance first"
          : "Add income first",
        needsStartingBalance
          ? "Your balance is currently zero. Set your starting balance before recording an expense."
          : "Your balance is currently zero. Add income before recording another expense.",
      );
      return;
    }

    setFormValues((currentValues) => ({
      ...currentValues,
      type: nextType,
      category: getRetainedCategoryForType(
        currentValues.category,
        nextType,
        customCategories,
      ),
    }));
  }

  function handleDateTextChange(value) {
    handleInputChange("date", sanitizeDateInput(value));
  }

  function handleOpenModal(preferredType) {
    const todayDate = getTodayDateString();
    const hasPendingInput = Boolean(
      formValues.amount || formValues.category || formValues.note,
    );
    const nextType =
      preferredType ||
      (needsStartingBalance ? STARTING_BALANCE_TYPE : formValues.type);

    setFormValues((currentValues) => ({
      ...currentValues,
      type: nextType,
      category: getRetainedCategoryForType(
        currentValues.category,
        nextType,
        customCategories,
      ),
      date: hasPendingInput ? currentValues.date : todayDate,
    }));

    if (!hasPendingInput) {
      setSelectedDate(parseDate(todayDate));
    }

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

  function handleQuickAmountSelect(amount) {
    handleInputChange("amount", amount.toString());
  }

  function handleAddCustomCategory() {
    const trimmedCategory = newCategoryName.trim();

    if (!trimmedCategory) {
      return;
    }

    const existingCategory = [
      ...PRESET_CATEGORIES.income,
      ...PRESET_CATEGORIES.expense,
      ...customCategories,
    ].find(
      (category) => category.toLowerCase() === trimmedCategory.toLowerCase(),
    );

    handleInputChange("category", existingCategory || trimmedCategory);

    if (!existingCategory) {
      setCustomCategories((currentCategories) => [
        ...currentCategories,
        trimmedCategory,
      ]);
    }

    setNewCategoryName("");
  }

  function handleRemoveCustomCategory(categoryToRemove) {
    setCustomCategories((currentCategories) =>
      currentCategories.filter((category) => category !== categoryToRemove),
    );

    if (formValues.category === categoryToRemove) {
      handleInputChange("category", "");
    }
  }

  async function handleSubmitTransaction() {
    if (!currentUserId) {
      Alert.alert(
        "Session missing",
        "We couldn't find your signed-in account. Please log out and sign in again.",
      );
      return;
    }

    const transactionPayload = {
      ...formValues,
      amount: Number(formValues.amount || 0),
      category: (isStartingBalanceEntry
        ? STARTING_BALANCE_CATEGORY
        : formValues.category
      ).trim(),
      note: formValues.note.trim(),
    };

    if (
      !transactionPayload.amount ||
      !transactionPayload.category ||
      !transactionPayload.date
    ) {
      Alert.alert(
        "Missing fields",
        "Please complete the type, amount, category, and date.",
      );
      return;
    }

    if (transactionPayload.type === "expense" && !hasSpendableBalance) {
      Alert.alert(
        needsStartingBalance
          ? "Add starting balance first"
          : "Add income first",
        needsStartingBalance
          ? "Set your starting balance before recording an expense."
          : "You need to add income before recording another expense.",
      );
      return;
    }

    console.log("New transaction:", transactionPayload);
    setIsSaving(true);

    const { error } = await supabase.from("transactions").insert({
      user_id: currentUserId,
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

    const nextFormState = createInitialFormState();

    setFormValues(nextFormState);
    setSelectedDate(parseDate(nextFormState.date));
    setIsDatePickerVisible(false);
    handleCloseModal();
    await refreshTransactions();
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
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 28,
          }}
          data={recentTransactions}
          ItemSeparatorComponent={() => <View className="h-3" />}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <Pressable
              className="mt-5 overflow-hidden rounded-[28px] bg-slate-950 px-5 py-5 active:opacity-90"
              onPress={() => handleOpenModal()}
            >
              <View className="absolute -right-5 top-0 h-28 w-28 rounded-full bg-emerald-400/20" />
              <View className="absolute -left-6 bottom-0 h-20 w-20 rounded-full bg-sky-300/15" />

              <Text className="text-[11px] font-semibold uppercase tracking-[1.6px] text-slate-300">
                Quick Action
              </Text>

              <View className="mt-3 flex-row items-center justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-xl font-bold tracking-tight text-white">
                    {needsStartingBalance
                      ? "Add Starting Balance"
                      : "Add Transaction"}
                  </Text>
                  <Text className="mt-1 text-sm leading-6 text-slate-300">
                    {needsStartingBalance
                      ? "Set your opening amount."
                      : "Add a new entry."}
                  </Text>
                </View>

                <View className="h-12 w-12 items-center justify-center rounded-full border border-emerald-300/35 bg-brand">
                  <Text className="text-2xl font-black text-white">+</Text>
                </View>
              </View>
            </Pressable>
          }
          ListHeaderComponent={
            <View>
              <View className="overflow-hidden rounded-[24px] bg-slate-950 px-4 pb-3 pt-3">
                <View className="absolute -right-3 top-0 h-16 w-16 rounded-full bg-emerald-400/16" />
                <View className="absolute -left-4 bottom-0 h-12 w-12 rounded-full bg-amber-300/14" />
                <View className="absolute right-10 top-12 h-7 w-7 rounded-full bg-white/8" />

                <View className="flex-row items-center justify-between gap-2">
                  <View className="flex-1" />

                  <View className="flex-row items-center gap-2">
                    <View className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1">
                      <Text className="text-[10px] font-semibold uppercase tracking-[1.3px] text-slate-300">
                        {headerDateLabel}
                      </Text>
                    </View>

                    <Pressable
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 active:opacity-90"
                      onPress={onOpenSettings}
                    >
                      <Text className="text-[10px] font-semibold uppercase tracking-[1.3px] text-slate-200">
                        Settings
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View className="mt-4 flex-row items-center gap-3">
                  <View
                    className="h-16 w-16 items-center justify-center overflow-hidden rounded-[20px] border border-white/15 bg-white p-2"
                    style={{
                      shadowColor: "#020617",
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.14,
                      shadowRadius: 18,
                    }}
                  >
                    <Image
                      source={FLOWLY_LOGO}
                      resizeMode="contain"
                      style={{ height: 46, width: 46 }}
                    />
                  </View>

                  <View className="flex-1">
                    <Text
                      className="text-[28px] font-black tracking-[-0.8px] text-white"
                      style={{
                        textShadowColor: "rgba(34,197,94,0.18)",
                        textShadowOffset: { width: 0, height: 6 },
                        textShadowRadius: 18,
                      }}
                    >
                      Flowly
                    </Text>
                  </View>
                </View>

                <Text className="mt-3 max-w-[250px] text-[13px] leading-6 text-slate-300">
                  Track your balance, income, and spending at a glance.
                </Text>
              </View>

              <View className="mt-5 gap-3">
                <SummaryCard
                  title="Balance"
                  amount={formatCurrency(totalBalance)}
                  actionLabel={
                    needsStartingBalance ? "Input Starting Balance" : undefined
                  }
                  detail={
                    needsStartingBalance
                      ? "Set your starting balance first."
                      : "Available funds"
                  }
                  featured
                  onActionPress={
                    needsStartingBalance
                      ? () => handleOpenModal(STARTING_BALANCE_TYPE)
                      : undefined
                  }
                />

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <SummaryCard
                      title="Income"
                      amount={formatCurrency(totalIncome)}
                      tone="income"
                      detail="Recorded income"
                    />
                  </View>

                  <View className="flex-1">
                    <SummaryCard
                      title="Expenses"
                      amount={formatCurrency(totalExpenses)}
                      tone="expense"
                      detail="Recorded expenses"
                    />
                  </View>
                </View>
              </View>

              <View
                className="mb-4 mt-8 overflow-hidden rounded-[30px] border border-slate-100 bg-surface px-5 py-5"
                style={sectionCardShadow}
              >
                <View className="absolute -right-5 top-0 h-24 w-24 rounded-full bg-emerald-100/80" />
                <View className="absolute left-0 top-10 h-16 w-16 rounded-full bg-sky-100/70" />

                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-1">
                    <Text className="text-[11px] font-semibold uppercase tracking-[1.6px] text-muted">
                      Latest Activity
                    </Text>
                    <Text className="mt-2 text-[22px] font-bold tracking-tight text-ink">
                      Recent Transactions
                    </Text>
                  </View>

                  <Pressable
                    className="rounded-full border border-slate-200 bg-white/90 px-4 py-2.5 active:opacity-90"
                    onPress={onOpenHistory}
                  >
                    <Text className="text-sm font-semibold text-ink">
                      View All
                    </Text>
                  </Pressable>
                </View>
              </View>

              {errorMessage ? (
                <View className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                  <Text className="text-sm font-medium text-danger">
                    {errorMessage}
                  </Text>
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
                  <Text className="text-base font-semibold text-ink">
                    No transactions yet
                  </Text>
                  <Text className="mt-2 text-center text-sm leading-6 text-muted">
                    Add your starting balance or first transaction to see your
                    dashboard update.
                  </Text>
                </>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              formatCurrency={formatCurrency}
            />
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
          <View
            className={`flex-1 justify-end bg-black/35 ${
              isWeb ? "items-center px-4 py-6" : ""
            }`}
          >
            <Pressable
              className="absolute inset-0"
              onPress={handleCloseModal}
            />

            <View
              className={`w-full bg-canvas px-5 pb-8 pt-4 ${
                isWeb ? "max-w-[420px] rounded-[32px]" : "rounded-t-[32px]"
              }`}
              style={
                isWeb
                  ? {
                      maxHeight: "92%",
                      shadowColor: "#111827",
                      shadowOffset: { width: 0, height: 16 },
                      shadowOpacity: 0.12,
                      shadowRadius: 30,
                    }
                  : undefined
              }
            >
              <View className="self-center h-1.5 w-14 rounded-full bg-slate-200" />

              <View className="mt-4 flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-xl font-bold text-ink">
                    {isStartingBalanceEntry
                      ? "Set Starting Balance"
                      : "Add Transaction"}
                  </Text>
                  <Text className="mt-1 text-sm leading-6 text-muted">
                    {isStartingBalanceEntry
                      ? "Set your opening amount separately so it stays outside of income totals."
                      : "Capture a payment, expense, or allowance in a few taps."}
                  </Text>
                </View>

                <Pressable onPress={handleCloseModal}>
                  <Text className="text-sm font-semibold text-muted">
                    Close
                  </Text>
                </Pressable>
              </View>

              <ScrollView
                className="mt-6"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View className="gap-4 pb-2">
                  <View
                    className="rounded-[28px] border px-5 py-5"
                    style={{
                      ...modalCardShadow,
                      backgroundColor: transactionTone.surfaceTint,
                      borderColor: transactionTone.surfaceBorder,
                    }}
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-muted">
                          Live Preview
                        </Text>
                        <Text className="mt-3 text-sm font-medium text-muted">
                          {isStartingBalanceEntry
                            ? STARTING_BALANCE_CATEGORY
                            : formValues.category || "Choose a category"}
                        </Text>
                        <Text
                          className="mt-2 text-[30px] font-extrabold tracking-tight"
                          style={{ color: transactionTone.accent }}
                        >
                          {formatCurrency(formValues.amount || 0)}
                        </Text>
                      </View>

                      <View
                        className="rounded-full border px-4 py-2"
                        style={{
                          backgroundColor: transactionTone.badgeBackground,
                          borderColor: transactionTone.badgeBorder,
                        }}
                      >
                        <Text
                          className="text-xs font-semibold uppercase tracking-[1.2px]"
                          style={{ color: transactionTone.badgeText }}
                        >
                          {transactionTone.title}
                        </Text>
                      </View>
                    </View>

                    <Text className="mt-4 text-sm leading-6 text-muted">
                      {formValues.note ||
                        "Fill in the amount, category, and date to create a clear record."}
                    </Text>

                    <View className="mt-4 flex-row flex-wrap gap-2">
                      <View className="rounded-full bg-white/80 px-3 py-2">
                        <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-muted">
                          {transactionTone.helper}
                        </Text>
                      </View>
                      <View className="rounded-full bg-white/80 px-3 py-2">
                        <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-muted">
                          {formValues.date}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    className="rounded-[28px] border border-slate-100 bg-surface px-5 py-5"
                    style={modalCardShadow}
                  >
                    <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-muted">
                      Transaction Type
                    </Text>
                    <Text className="mt-2 text-sm leading-6 text-muted">
                      {needsStartingBalance
                        ? "Starting balance is tracked separately from income. Set it once, then keep using income and expense normally."
                        : "Pick whether this money is coming in or going out."}
                    </Text>

                    {needsStartingBalance || isStartingBalanceEntry ? (
                      <Pressable
                        className="mt-4 rounded-[24px] border px-4 py-4 active:opacity-90"
                        onPress={() => handleTypeChange(STARTING_BALANCE_TYPE)}
                        style={{
                          backgroundColor: isStartingBalanceEntry
                            ? transactionTone.badgeBackground
                            : "#FFFFFF",
                          borderColor: isStartingBalanceEntry
                            ? transactionTone.badgeBorder
                            : "#E5E7EB",
                        }}
                      >
                        <Text
                          className="text-base font-semibold"
                          style={{
                            color: isStartingBalanceEntry
                              ? transactionTone.badgeText
                              : "#111827",
                          }}
                        >
                          Starting Balance
                        </Text>
                        <Text className="mt-1 text-sm text-muted">
                          Opening amount kept separate from income
                        </Text>
                      </Pressable>
                    ) : null}

                    <View className="mt-4 flex-row gap-3">
                      {[
                        {
                          value: "expense",
                          label: "Expense",
                          helper: "Money out",
                        },
                        {
                          value: "income",
                          label: "Income",
                          helper: "Money in",
                        },
                      ].map((option) => {
                        const isSelected = formValues.type === option.value;
                        const optionTone = getTransactionTone(option.value);
                        const isDisabled =
                          option.value === "expense" && !hasSpendableBalance;

                        return (
                          <Pressable
                            key={option.value}
                            className="flex-1 rounded-[24px] border px-4 py-4 active:opacity-90"
                            disabled={isDisabled}
                            onPress={() => handleTypeChange(option.value)}
                            style={{
                              backgroundColor: isSelected
                                ? optionTone.badgeBackground
                                : isDisabled
                                  ? "#F8FAFC"
                                  : "#FFFFFF",
                              borderColor: isSelected
                                ? optionTone.badgeBorder
                                : "#E5E7EB",
                              opacity: isDisabled ? 0.58 : 1,
                            }}
                          >
                            <Text
                              className="text-base font-semibold"
                              style={{
                                color: isDisabled
                                  ? "#94A3B8"
                                  : isSelected
                                    ? optionTone.badgeText
                                    : "#111827",
                              }}
                            >
                              {option.label}
                            </Text>
                            <Text className="mt-1 text-sm text-muted">
                              {isDisabled ? "Add balance first" : option.helper}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View
                    className="rounded-[28px] border border-slate-100 bg-surface px-5 py-5"
                    style={modalCardShadow}
                  >
                    <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-muted">
                      Amount
                    </Text>
                    <Text className="mt-2 text-sm leading-6 text-muted">
                      Enter the value or use a quick amount below.
                    </Text>

                    <View className="mt-4 rounded-[24px] border border-slate-200 bg-white px-4 py-4">
                      <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-muted">
                        Philippine Peso
                      </Text>

                      <View className="mt-3 flex-row items-center gap-3">
                        <View className="rounded-2xl bg-slate-100 px-3 py-3">
                          <Text className="text-base font-bold text-ink">
                            PHP
                          </Text>
                        </View>

                        <TextInput
                          autoFocus
                          className="flex-1 text-[32px] font-extrabold tracking-tight text-ink"
                          inputMode="decimal"
                          keyboardType={
                            Platform.OS === "ios" ? "decimal-pad" : "numeric"
                          }
                          onChangeText={handleAmountChange}
                          placeholder="0.00"
                          placeholderTextColor="#9CA3AF"
                          value={formValues.amount}
                        />
                      </View>
                    </View>

                    <View className="mt-4 flex-row flex-wrap gap-2">
                      {quickAmounts.map((amount) => {
                        const isSelected =
                          formValues.amount === amount.toString();

                        return (
                          <Pressable
                            key={amount}
                            className="rounded-full border px-4 py-2 active:opacity-90"
                            onPress={() => handleQuickAmountSelect(amount)}
                            style={{
                              backgroundColor: isSelected
                                ? transactionTone.badgeBackground
                                : "#FFFFFF",
                              borderColor: isSelected
                                ? transactionTone.badgeBorder
                                : "#E5E7EB",
                            }}
                          >
                            <Text
                              className="text-sm font-semibold"
                              style={{
                                color: isSelected
                                  ? transactionTone.badgeText
                                  : "#374151",
                              }}
                            >
                              {formatCurrency(amount)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {isStartingBalanceEntry ? (
                    <View
                      className="rounded-[28px] border border-slate-100 bg-surface px-5 py-5"
                      style={modalCardShadow}
                    >
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-muted">
                            Starting Balance
                          </Text>
                          <Text className="mt-2 text-sm leading-6 text-muted">
                            This opening amount is saved separately and will not
                            increase your total income.
                          </Text>
                        </View>

                        <View
                          className="rounded-full border px-3 py-2"
                          style={{
                            backgroundColor: transactionTone.badgeBackground,
                            borderColor: transactionTone.badgeBorder,
                          }}
                        >
                          <Text
                            className="text-[10px] font-semibold uppercase tracking-[1.3px]"
                            style={{ color: transactionTone.badgeText }}
                          >
                            {STARTING_BALANCE_CATEGORY}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View
                      className="rounded-[28px] border border-slate-100 bg-surface px-5 py-5"
                      style={modalCardShadow}
                    >
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-muted">
                            Category
                          </Text>
                          <Text className="mt-2 text-sm leading-6 text-muted">
                            Choose a category from the dropdown, or create your
                            own.
                          </Text>
                        </View>

                        <View
                          className="rounded-full border px-3 py-2"
                          style={{
                            backgroundColor: transactionTone.badgeBackground,
                            borderColor: transactionTone.badgeBorder,
                          }}
                        >
                          <Text
                            className="text-[10px] font-semibold uppercase tracking-[1.3px]"
                            style={{ color: transactionTone.badgeText }}
                          >
                            {formValues.category || "Not set"}
                          </Text>
                        </View>
                      </View>

                      <View className="mt-4 rounded-[24px] border border-slate-200 bg-white px-4 py-3">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted">
                          Select a category
                        </Text>

                        <View className="mt-2 overflow-hidden rounded-[18px] border border-slate-100 bg-slate-50">
                          <Picker
                            dropdownIconColor="#6B7280"
                            onValueChange={(value) =>
                              handleInputChange("category", value)
                            }
                            selectedValue={formValues.category}
                            style={{ color: "#111827" }}
                          >
                            {availableCategories.map((category) => (
                              <Picker.Item
                                key={category}
                                label={category}
                                value={category}
                              />
                            ))}
                          </Picker>
                        </View>
                      </View>

                      <View className="mt-5 rounded-[24px] border border-slate-200 bg-white px-4 py-4">
                        <Text className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted">
                          Custom Category
                        </Text>
                        <Text className="mt-1 text-sm leading-6 text-muted">
                          Add a personal label when the preset list does not
                          fit.
                        </Text>

                        <View className="mt-2 flex-row gap-2">
                          <TextInput
                            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-ink"
                            maxLength={30}
                            onChangeText={setNewCategoryName}
                            placeholder="Example: Weekend Trip"
                            placeholderTextColor="#9CA3AF"
                            value={newCategoryName}
                          />
                          <Pressable
                            className="rounded-2xl bg-brand px-4 py-3 active:opacity-90"
                            onPress={handleAddCustomCategory}
                          >
                            <Text className="text-sm font-semibold text-white">
                              Add
                            </Text>
                          </Pressable>
                        </View>
                      </View>

                      {customCategories.length > 0 ? (
                        <View className="mt-5">
                          <Text className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted">
                            Saved Custom Categories
                          </Text>

                          <View className="mt-2 gap-2">
                            {customCategories.map((category) => (
                              <View
                                key={category}
                                className="flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                              >
                                <Text className="text-sm font-medium text-ink">
                                  {category}
                                </Text>
                                <Pressable
                                  onPress={() =>
                                    handleRemoveCustomCategory(category)
                                  }
                                >
                                  <Text className="text-sm font-semibold text-danger">
                                    Remove
                                  </Text>
                                </Pressable>
                              </View>
                            ))}
                          </View>
                        </View>
                      ) : null}
                    </View>
                  )}

                  <View
                    className="rounded-[28px] border border-slate-100 bg-surface px-5 py-5"
                    style={modalCardShadow}
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-xs font-semibold uppercase tracking-[1.6px] text-muted">
                          Details
                        </Text>
                        <Text className="mt-2 text-sm leading-6 text-muted">
                          {isStartingBalanceEntry
                            ? "Add an optional note and confirm the date for your opening balance."
                            : "Add a note for context and confirm the transaction date."}
                        </Text>
                      </View>

                      <View className="rounded-full border border-slate-200 bg-white px-3 py-2">
                        <Text className="text-[10px] font-semibold uppercase tracking-[1.3px] text-slate-600">
                          {formValues.date}
                        </Text>
                      </View>
                    </View>

                    <View className="mt-4 rounded-[24px] border border-slate-200 bg-white px-4 py-4">
                      <Text className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted">
                        Note
                      </Text>
                      <TextInput
                        className="mt-2 min-h-[104px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-ink"
                        maxLength={140}
                        multiline
                        onChangeText={(value) =>
                          handleInputChange("note", value)
                        }
                        placeholder={
                          isStartingBalanceEntry
                            ? "Optional note about your opening balance"
                            : "What was this transaction for?"
                        }
                        placeholderTextColor="#9CA3AF"
                        textAlignVertical="top"
                        value={formValues.note}
                      />
                    </View>

                    <View className="mt-4 rounded-[24px] border border-slate-200 bg-white px-4 py-4">
                      <Text className="text-[11px] font-semibold uppercase tracking-[1.2px] text-muted">
                        Date
                      </Text>
                      {isWeb ? (
                        <TextInput
                          className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-ink"
                          inputMode="numeric"
                          onChangeText={handleDateTextChange}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor="#9CA3AF"
                          value={formValues.date}
                        />
                      ) : (
                        <View>
                          <Pressable
                            className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                            onPress={handleOpenDatePicker}
                          >
                            <Text className="text-base text-ink">
                              {formValues.date}
                            </Text>
                          </Pressable>

                          {DateTimePicker && isDatePickerVisible ? (
                            <View className="mt-3 rounded-2xl border border-slate-200 bg-white p-2">
                              <DateTimePicker
                                display={
                                  Platform.OS === "ios" ? "spinner" : "default"
                                }
                                mode="date"
                                onChange={handleDateChange}
                                value={selectedDate}
                              />

                              {Platform.OS === "ios" ? (
                                <Pressable
                                  className="mt-2 self-end rounded-xl bg-brand px-4 py-2"
                                  onPress={() => setIsDatePickerVisible(false)}
                                >
                                  <Text className="text-sm font-semibold text-white">
                                    Done
                                  </Text>
                                </Pressable>
                              ) : null}
                            </View>
                          ) : null}
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View
                  className="mt-6 overflow-hidden rounded-[28px] border border-slate-100 bg-surface px-4 py-4"
                  style={modalCardShadow}
                >
                  <View className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-emerald-100/80" />
                  <View className="absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-sky-100/70" />

                  <Text className="text-[11px] font-semibold uppercase tracking-[1.6px] text-muted">
                    Finish Up
                  </Text>
                  <Text className="mt-2 text-lg font-bold tracking-tight text-ink">
                    Review your entry and continue
                  </Text>
                  <Text className="mt-1 text-sm leading-6 text-muted">
                    Save this transaction now or cancel to return to your
                    dashboard.
                  </Text>

                  <View className="mt-4 flex-row gap-3">
                    <Pressable
                      className="flex-1 rounded-[22px] border border-red-200 bg-red-50 px-5 py-4 active:opacity-90"
                      onPress={handleCloseModal}
                    >
                      <Text className="text-center text-base font-semibold text-danger">
                        Cancel and Go Back
                      </Text>
                    </Pressable>

                    <Pressable
                      className="flex-1 rounded-[22px] bg-brand px-5 py-4 active:opacity-90"
                      disabled={isSaving}
                      onPress={handleSubmitTransaction}
                    >
                      <Text className="text-center text-base font-semibold text-white">
                        {isSaving ? "Saving..." : "Save Transaction"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
