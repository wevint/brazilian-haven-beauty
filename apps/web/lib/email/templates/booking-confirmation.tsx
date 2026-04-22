import {
  Link,
  Section,
  Text,
} from "@react-email/components";
import { BaseEmail } from "./base";

export interface BookingConfirmationEmailProps {
  locale: "en" | "pt";
  clientName: string;
  serviceName: string;
  staffName: string;
  startAt: Date;
  locationAddress: string;
  confirmationCode: string;
  cancelUrl: string;
}

function formatDateOnly(date: Date, locale: "en" | "pt"): string {
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(date);
}

function formatTimeOnly(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  }).format(date);
}

const copy = {
  en: {
    previewText: (name: string, service: string) =>
      `${name}, your ${service} appointment is confirmed!`,
    greeting: (name: string) => `Hi ${name},`,
    body: "Your appointment has been confirmed. Here are the details:",
    tableService: "Service",
    tableSpecialist: "Specialist",
    tableDate: "Date",
    tableTime: "Time",
    tableLocation: "Location",
    codeLabel: "Confirmation Code",
    cancelTitle: "Need to cancel?",
    cancelBody:
      "Plans change — we understand. You can cancel your appointment by clicking the link below.",
    cancelLink: "Cancel Appointment",
    contactTitle: "Questions?",
    contactBody: "Reach us at",
    contactEmail: "hello@brazilianhaven.com",
  },
  pt: {
    previewText: (name: string, service: string) =>
      `${name}, seu agendamento de ${service} está confirmado!`,
    greeting: (name: string) => `Olá ${name},`,
    body: "Seu agendamento foi confirmado. Veja os detalhes abaixo:",
    tableService: "Serviço",
    tableSpecialist: "Especialista",
    tableDate: "Data",
    tableTime: "Horário",
    tableLocation: "Endereço",
    codeLabel: "Código de Confirmação",
    cancelTitle: "Precisa cancelar?",
    cancelBody:
      "Entendemos que os planos mudam. Cancele seu agendamento clicando no link abaixo.",
    cancelLink: "Cancelar Agendamento",
    contactTitle: "Dúvidas?",
    contactBody: "Entre em contato:",
    contactEmail: "hello@brazilianhaven.com",
  },
} as const;

const styles = {
  h2: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "20px",
    fontWeight: "700",
    color: "#143323",
    margin: "0 0 16px",
  },
  body: {
    fontSize: "15px",
    color: "#202020",
    lineHeight: "1.6",
    margin: "0 0 24px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    marginBottom: "24px",
  },
  tdLabel: {
    fontSize: "13px",
    color: "#5f5a55",
    padding: "8px 12px 8px 0",
    verticalAlign: "top" as const,
    whiteSpace: "nowrap" as const,
    borderBottom: "1px solid rgba(32,32,32,0.08)",
  },
  tdValue: {
    fontSize: "13px",
    color: "#202020",
    fontWeight: "600",
    padding: "8px 0",
    borderBottom: "1px solid rgba(32,32,32,0.08)",
  },
  codeBox: {
    backgroundColor: "#f1f1f1",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center" as const,
    marginBottom: "24px",
  },
  codeLabel: {
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "#5f5a55",
    margin: "0 0 8px",
  },
  code: {
    fontFamily: "monospace",
    fontSize: "24px",
    fontWeight: "700",
    color: "#143323",
    letterSpacing: "0.08em",
    margin: 0,
  },
  smallTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#202020",
    margin: "0 0 4px",
  },
  small: {
    fontSize: "13px",
    color: "#5f5a55",
    margin: "0 0 16px",
  },
  link: {
    color: "#967553",
    textDecoration: "underline",
  },
};

export function BookingConfirmationEmail({
  locale,
  clientName,
  serviceName,
  staffName,
  startAt,
  locationAddress,
  confirmationCode,
  cancelUrl,
}: BookingConfirmationEmailProps) {
  const t = copy[locale];

  return (
    <BaseEmail
      locale={locale}
      previewText={t.previewText(clientName, serviceName)}
    >
      {/* Greeting */}
      <Text style={styles.body}>{t.greeting(clientName)}</Text>
      <Text style={{ ...styles.body, marginTop: "-16px" }}>{t.body}</Text>

      {/* Summary table */}
      <Section>
        <table style={styles.table}>
          <tbody>
            {[
              [t.tableService, serviceName],
              [t.tableSpecialist, staffName],
              [t.tableDate, formatDateOnly(startAt, locale)],
              [t.tableTime, formatTimeOnly(startAt)],
              [t.tableLocation, locationAddress],
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={styles.tdLabel}>{label}</td>
                <td style={styles.tdValue}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Confirmation code */}
      <div style={styles.codeBox}>
        <Text style={styles.codeLabel}>{t.codeLabel}</Text>
        <Text style={styles.code}>{confirmationCode}</Text>
      </div>

      {/* Cancel link */}
      <Text style={styles.smallTitle}>{t.cancelTitle}</Text>
      <Text style={styles.small}>{t.cancelBody}</Text>
      <Link href={cancelUrl} style={styles.link}>
        {t.cancelLink}
      </Link>

      {/* Contact */}
      <Text style={{ ...styles.small, marginTop: "24px" }}>
        {t.contactTitle} {t.contactBody}{" "}
        <Link href={`mailto:${t.contactEmail}`} style={styles.link}>
          {t.contactEmail}
        </Link>
      </Text>

    </BaseEmail>
  );
}
