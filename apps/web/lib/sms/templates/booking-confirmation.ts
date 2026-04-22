function formatDate(date: Date, locale: "en" | "pt"): string {
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  }).format(date);
}

export function bookingConfirmationSms(
  params: {
    clientName: string;
    serviceName: string;
    startAt: Date;
    confirmationCode: string;
  },
  locale: "en" | "pt"
): string {
  const { clientName, serviceName, startAt, confirmationCode } = params;
  const date = formatDate(startAt, locale);
  const time = formatTime(startAt);

  if (locale === "pt") {
    return `Olá ${clientName}! Seu ${serviceName} está confirmado para ${date} às ${time}. Código: ${confirmationCode}. Brazilian Haven Beauty`;
  }

  return `Hi ${clientName}! Your ${serviceName} is confirmed for ${date} at ${time}. Code: ${confirmationCode}. Brazilian Haven Beauty`;
}
