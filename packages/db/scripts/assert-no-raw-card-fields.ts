import { readFileSync } from "fs";
import { join } from "path";

/**
 * PCI-SAQ-A schema guard (US3 — T063).
 *
 * Verifies that schema.prisma contains no forbidden raw card data fields.
 * Run as part of CI to prevent accidental introduction of PCI-violating columns.
 */

const FORBIDDEN_FIELDS = [
  "cardNumber",
  "card_number",
  "cvv",
  "cvc",
  "pan",
  "fullCardNumber",
  "rawCard",
];

const schemaPath = join(__dirname, "../schema.prisma");
const schema = readFileSync(schemaPath, "utf-8");

let hasViolation = false;

for (const field of FORBIDDEN_FIELDS) {
  if (new RegExp(`\\b${field}\\b`).test(schema)) {
    console.error(
      `ERROR: Forbidden field "${field}" found in schema.prisma — PCI-SAQ-A violation`
    );
    hasViolation = true;
  }
}

if (hasViolation) {
  process.exit(1);
}

console.log("✓ No raw card fields found in schema.prisma");
