import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

export interface BaseEmailProps {
  /** EN/PT locale for bilingual copy decisions. */
  locale?: "en" | "pt";
  /** Short preview text shown in the inbox. */
  previewText?: string;
  children: ReactNode;
}

const brand = {
  primary: "#143323",
  support: "#967553",
  bg: "#f1f1f1",
  text: "#202020",
  textSecondary: "#5f5a55",
  fontDisplay: "'Cormorant Garamond', Georgia, serif",
  fontBody: "'Manrope', 'Segoe UI', Arial, sans-serif",
};

/**
 * Base React Email layout for all Brazilian Haven Beauty transactional emails.
 *
 * Provides consistent header (logo), footer (address, legal links),
 * and brand typography.
 *
 * Accepts a `locale` prop so bilingual copy decisions can be made in
 * child templates.
 */
export function BaseEmail({
  locale = "en",
  previewText,
  children,
}: BaseEmailProps) {
  const isPt = locale === "pt";

  return (
    <Html lang={locale}>
      <Head />
      {previewText && <Preview>{previewText}</Preview>}
      <Body
        style={{
          backgroundColor: brand.bg,
          fontFamily: brand.fontBody,
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Section
            style={{
              backgroundColor: brand.primary,
              padding: "24px 32px",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                fontFamily: brand.fontDisplay,
                fontSize: "22px",
                fontWeight: "700",
                color: "#f7f3ee",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Brazilian Haven Beauty
            </Text>
          </Section>

          {/* Content */}
          <Section style={{ padding: "32px" }}>{children}</Section>

          {/* Divider */}
          <Hr style={{ borderColor: "rgba(32,32,32,0.08)", margin: "0 32px" }} />

          {/* Footer */}
          <Section
            style={{
              padding: "24px 32px",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                fontSize: "12px",
                color: brand.textSecondary,
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              Brazilian Haven Beauty · New York, NY
              <br />
              <a
                href="https://brazilianhaven.com"
                style={{ color: brand.support }}
              >
                brazilianhaven.com
              </a>
            </Text>
            <Text
              style={{
                fontSize: "11px",
                color: "rgba(95,90,85,0.6)",
                margin: "8px 0 0",
              }}
            >
              {isPt
                ? "Você está recebendo este email pois tem uma conta na plataforma."
                : "You are receiving this email because you have an account on our platform."}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
