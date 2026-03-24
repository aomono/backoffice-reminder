import { describe, it, expect } from "vitest";
import { shouldSendReminder, buildReminderMessage } from "@/lib/reminder";

describe("shouldSendReminder", () => {
  it("should return true when today is within reminder window", () => {
    const deadline = new Date("2026-03-28");
    const today = new Date("2026-03-25");
    expect(shouldSendReminder(deadline, today, 3)).toBe(true);
  });

  it("should return false when today is before reminder window", () => {
    const deadline = new Date("2026-03-28");
    const today = new Date("2026-03-24");
    expect(shouldSendReminder(deadline, today, 3)).toBe(false);
  });

  it("should return true on deadline day", () => {
    expect(
      shouldSendReminder(new Date("2026-03-28"), new Date("2026-03-28"), 3)
    ).toBe(true);
  });

  it("should return true when past deadline", () => {
    expect(
      shouldSendReminder(new Date("2026-03-28"), new Date("2026-03-30"), 3)
    ).toBe(true);
  });
});

describe("buildReminderMessage", () => {
  it("should include days remaining", () => {
    const msg = buildReminderMessage(
      "請求書発行",
      "○○社",
      new Date("2026-03-28"),
      new Date("2026-03-25")
    );
    expect(msg).toContain("あと3日");
    expect(msg).toContain("○○社");
    expect(msg).toContain("請求書発行");
  });

  it("should show urgent message on deadline day", () => {
    const msg = buildReminderMessage(
      "請求書発行",
      "○○社",
      new Date("2026-03-28"),
      new Date("2026-03-28")
    );
    expect(msg).toContain("本日期限");
  });

  it("should show overdue message when past deadline", () => {
    const msg = buildReminderMessage(
      "請求書発行",
      "○○社",
      new Date("2026-03-28"),
      new Date("2026-03-30")
    );
    expect(msg).toContain("期限超過");
  });
});
