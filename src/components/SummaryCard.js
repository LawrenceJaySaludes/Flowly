import { Pressable, Text, View } from "react-native";

const cardShadow = {
  shadowColor: "#111827",
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 4,
};

const cardStyles = {
  default: {
    amountColor: "#FFFFFF",
    backgroundColor: "#0F172A",
    badgeBackground: "rgba(255,255,255,0.1)",
    badgeTextColor: "#E2E8F0",
    borderColor: "#1E293B",
    detailColor: "#CBD5E1",
    label: "Overview",
    titleColor: "#94A3B8",
  },
  income: {
    amountColor: "#166534",
    backgroundColor: "#F0FDF4",
    badgeBackground: "#DCFCE7",
    badgeTextColor: "#166534",
    borderColor: "#BBF7D0",
    detailColor: "#4B5563",
    label: "Inflow",
    titleColor: "#6B7280",
  },
  expense: {
    amountColor: "#B91C1C",
    backgroundColor: "#FFF1F2",
    badgeBackground: "#FFE4E6",
    badgeTextColor: "#B91C1C",
    borderColor: "#FECDD3",
    detailColor: "#4B5563",
    label: "Outflow",
    titleColor: "#6B7280",
  },
};

export default function SummaryCard({
  title,
  amount,
  tone = "default",
  detail,
  featured = false,
  actionLabel,
  onActionPress,
}) {
  const selectedStyle = cardStyles[tone] || cardStyles.default;

  return (
    <View
      className={`overflow-hidden rounded-[28px] border ${
        featured ? "min-h-[176px] px-6 py-6" : "min-h-[158px] px-5 py-5"
      }`}
      style={{
        ...cardShadow,
        backgroundColor: selectedStyle.backgroundColor,
        borderColor: selectedStyle.borderColor,
      }}
    >
      <View
        className={`absolute rounded-full ${
          featured
            ? "right-[-18px] top-[-24px] h-32 w-32"
            : "right-[-18px] top-[-14px] h-24 w-24"
        }`}
        style={{
          backgroundColor:
            tone === "default"
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.55)",
        }}
      />
      <View
        className={`absolute rounded-full ${
          featured
            ? "bottom-[-28px] left-[-8px] h-24 w-24"
            : "bottom-[-18px] left-[-8px] h-16 w-16"
        }`}
        style={{
          backgroundColor:
            tone === "default"
              ? "rgba(148,163,184,0.18)"
              : "rgba(255,255,255,0.35)",
        }}
      />

      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text
            className={`font-semibold uppercase tracking-[1.6px] ${
              featured ? "text-xs" : "text-[10px]"
            }`}
            numberOfLines={1}
            style={{ color: selectedStyle.titleColor }}
          >
            {title}
          </Text>
        </View>

        <View
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: selectedStyle.badgeBackground }}
        >
          <Text
            className="text-[10px] font-bold uppercase tracking-[1.4px]"
            style={{ color: selectedStyle.badgeTextColor }}
          >
            {selectedStyle.label}
          </Text>
        </View>
      </View>

      <Text
        className={`mt-5 font-extrabold tracking-tight ${
          featured ? "text-[36px]" : "text-[26px]"
        }`}
        style={{ color: selectedStyle.amountColor }}
      >
        {amount}
      </Text>

      <Text
        className={`mt-3 leading-6 ${featured ? "max-w-[240px] text-sm" : "text-sm"}`}
        style={{ color: selectedStyle.detailColor }}
      >
        {detail}
      </Text>

      {actionLabel && onActionPress ? (
        <Pressable
          className="mt-4 self-start flex-row items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-400/15 px-3.5 py-2.5 active:opacity-90"
          onPress={onActionPress}
        >
          <View className="h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
            <Text className="text-sm font-black text-white">+</Text>
          </View>
          <Text className="text-[11px] font-semibold uppercase tracking-[1.2px] text-emerald-100">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
