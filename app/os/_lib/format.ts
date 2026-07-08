export function formatDate(value?: string | null) {
  if (!value) {
    return "未設定";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatUsd(value?: number | null) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}


export function toErrorMessage(
  error: unknown,
  fallback = "予期しないエラーが発生しました。",
): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string" &&
    (error as { message: string }).message
  ) {
    return (error as { message: string }).message;
  }

  if (typeof error === "string" && error) {
    return error;
  }

  return fallback;
}
