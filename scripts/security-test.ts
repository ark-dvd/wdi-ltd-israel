/**
 * Security Penetration Test Script
 * Run: npx tsx scripts/security-test.ts
 *
 * Tests unauthenticated access to admin endpoints, public endpoint validation,
 * and admin page redirect behavior against a running local dev server.
 *
 * Configure: BASE_URL env var (default: http://localhost:3000)
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

// ── ANSI color codes ─────────────────────────────────────────
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

// ── Types ────────────────────────────────────────────────────
interface TestResult {
  name: string;
  passed: boolean;
  status: number;
  expected: number;
  details?: string;
}

// ── Test functions ───────────────────────────────────────────

async function testUnauthGetLeads(): Promise<TestResult> {
  const name = "Unauthenticated GET /api/admin/leads";
  const expected = 401;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/leads`);
    const body = await res.json();
    const passed =
      res.status === expected &&
      body.category === "auth" &&
      body.code === "UNAUTHORIZED";
    return {
      name,
      passed,
      status: res.status,
      expected,
      details: passed ? undefined : `body.code=${body.code}`,
    };
  } catch (err) {
    return {
      name,
      passed: false,
      status: 0,
      expected,
      details: `Fetch error: ${(err as Error).message}`,
    };
  }
}

async function testUnauthPostTeam(): Promise<TestResult> {
  const name = 'Unauthenticated POST /api/admin/team';
  const expected = 401;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/team`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test" }),
    });
    const body = await res.json();
    const passed =
      res.status === expected &&
      body.category === "auth" &&
      body.code === "UNAUTHORIZED";
    return {
      name,
      passed,
      status: res.status,
      expected,
      details: passed ? undefined : `body.code=${body.code}`,
    };
  } catch (err) {
    return {
      name,
      passed: false,
      status: 0,
      expected,
      details: `Fetch error: ${(err as Error).message}`,
    };
  }
}

async function testUnauthDeleteProject(): Promise<TestResult> {
  const name = "Unauthenticated DELETE /api/admin/projects/test-id";
  const expected = 401;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/projects/test-id`, {
      method: "DELETE",
    });
    const body = await res.json();
    const passed =
      res.status === expected &&
      body.category === "auth" &&
      body.code === "UNAUTHORIZED";
    return {
      name,
      passed,
      status: res.status,
      expected,
      details: passed ? undefined : `body.code=${body.code}`,
    };
  } catch (err) {
    return {
      name,
      passed: false,
      status: 0,
      expected,
      details: `Fetch error: ${(err as Error).message}`,
    };
  }
}

async function testPublicLeadsMissingTurnstile(): Promise<TestResult> {
  const name = "POST /api/public/leads without Turnstile token";
  const expected = 400;
  try {
    const res = await fetch(`${BASE_URL}/api/public/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Security Test",
        email: "test@example.com",
        message: "Testing missing turnstile",
      }),
    });
    const body = await res.json();
    const passed =
      res.status === expected &&
      body.category === "validation" &&
      body.fieldErrors !== undefined;
    return {
      name,
      passed,
      status: res.status,
      expected,
      details: passed
        ? undefined
        : `category=${body.category}, fieldErrors=${JSON.stringify(body.fieldErrors)}`,
    };
  } catch (err) {
    return {
      name,
      passed: false,
      status: 0,
      expected,
      details: `Fetch error: ${(err as Error).message}`,
    };
  }
}

async function testPublicLeadsInvalidData(): Promise<TestResult> {
  const name = "POST /api/public/leads with invalid data";
  const expected = 400;
  try {
    const res = await fetch(`${BASE_URL}/api/public/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "",
        email: "not-an-email",
        message: "",
        turnstileToken: "x",
      }),
    });
    const body = await res.json();
    const passed =
      res.status === expected &&
      body.category === "validation" &&
      body.fieldErrors !== undefined;
    return {
      name,
      passed,
      status: res.status,
      expected,
      details: passed
        ? undefined
        : `category=${body.category}, fieldErrors=${JSON.stringify(body.fieldErrors)}`,
    };
  } catch (err) {
    return {
      name,
      passed: false,
      status: 0,
      expected,
      details: `Fetch error: ${(err as Error).message}`,
    };
  }
}

async function testAdminRedirect(): Promise<TestResult> {
  const name = "GET /admin (no session) -> 307 redirect";
  const expected = 307;
  try {
    const res = await fetch(`${BASE_URL}/admin`, { redirect: "manual" });
    const location = res.headers.get("location") ?? "";
    const passed = res.status === expected && location.includes("/admin/login");
    return {
      name,
      passed,
      status: res.status,
      expected,
      details: passed ? undefined : `Location: ${location}`,
    };
  } catch (err) {
    return {
      name,
      passed: false,
      status: 0,
      expected,
      details: `Fetch error: ${(err as Error).message}`,
    };
  }
}

// ── Runner ───────────────────────────────────────────────────

function padRight(str: string, len: number): string {
  return str.length >= len ? str : str + " ".repeat(len - str.length);
}

function padLeft(str: string, len: number): string {
  return str.length >= len ? str : " ".repeat(len - str.length) + str;
}

async function main(): Promise<void> {
  console.log(
    `\n${BOLD}${CYAN}=== Security Penetration Tests ===${RESET}`
  );
  console.log(`${DIM}Target: ${BASE_URL}${RESET}\n`);

  // Connectivity check
  try {
    await fetch(`${BASE_URL}`, { method: "HEAD" });
  } catch {
    console.error(
      `${RED}ERROR: Cannot reach ${BASE_URL}. Is the dev server running?${RESET}`
    );
    process.exit(2);
  }

  const tests = [
    testUnauthGetLeads,
    testUnauthPostTeam,
    testUnauthDeleteProject,
    testPublicLeadsMissingTurnstile,
    testPublicLeadsInvalidData,
    testAdminRedirect,
  ];

  const results: TestResult[] = [];

  for (const testFn of tests) {
    const result = await testFn();
    results.push(result);

    const icon = result.passed ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;
    const statusStr =
      result.status === result.expected
        ? `${GREEN}${result.status}${RESET}`
        : `${RED}${result.status}${RESET}`;

    console.log(
      `  ${icon}  ${padRight(result.name, 52)} ${DIM}status:${RESET} ${padLeft(statusStr, 13)} ${DIM}expected:${RESET} ${result.expected}${
        result.details ? `  ${YELLOW}${result.details}${RESET}` : ""
      }`
    );
  }

  // ── Summary ──────────────────────────────────────────────
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(
    `\n${BOLD}${CYAN}--- Summary ---${RESET}`
  );
  console.log(
    `  Total:  ${total}`
  );
  console.log(
    `  ${GREEN}Passed: ${passed}${RESET}`
  );
  if (failed > 0) {
    console.log(
      `  ${RED}Failed: ${failed}${RESET}`
    );
  }

  if (failed > 0) {
    console.log(
      `\n${RED}${BOLD}Security tests FAILED.${RESET} ${failed} test(s) did not pass.\n`
    );
    process.exit(1);
  } else {
    console.log(
      `\n${GREEN}${BOLD}All security tests passed.${RESET}\n`
    );
    process.exit(0);
  }
}

main();
