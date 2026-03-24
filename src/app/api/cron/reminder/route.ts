export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shouldSendReminder, buildReminderMessage } from "@/lib/reminder";
import { sendSlackMessage } from "@/lib/slack";
import { sendEmail } from "@/lib/email";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // Auto-generate MonthlyDeadline records for active tasks that don't have one for current month
  const activeTasks = await prisma.recurringTask.findMany({
    where: { isActive: true, defaultDayOfMonth: { not: null } },
    include: { client: true },
  });

  for (const task of activeTasks) {
    const existing = await prisma.monthlyDeadline.findUnique({
      where: {
        recurringTaskId_year_month: {
          recurringTaskId: task.id,
          year,
          month,
        },
      },
    });

    if (!existing && task.defaultDayOfMonth) {
      const deadlineDate = new Date(year, month - 1, task.defaultDayOfMonth);
      await prisma.monthlyDeadline.create({
        data: {
          recurringTaskId: task.id,
          clientId: task.clientId,
          year,
          month,
          type: task.type,
          deadlineDate,
          status: "pending",
        },
      });
    }
  }

  // Query active tasks with non-completed deadlines for current month
  const deadlines = await prisma.monthlyDeadline.findMany({
    where: {
      year,
      month,
      status: { not: "completed" },
      recurringTask: { isActive: true },
    },
    include: {
      recurringTask: { include: { client: true } },
      client: true,
    },
  });

  let sentCount = 0;

  for (const deadline of deadlines) {
    const task = deadline.recurringTask;
    if (
      !shouldSendReminder(
        deadline.deadlineDate,
        today,
        task.reminderDaysBefore
      )
    ) {
      continue;
    }

    const message = buildReminderMessage(
      task.title,
      task.client?.name ?? null,
      deadline.deadlineDate,
      today
    );

    // Send Slack notification
    if (task.slackChannel) {
      try {
        await sendSlackMessage(task.slackChannel, message);
        await prisma.notificationLog.create({
          data: {
            recurringTaskId: task.id,
            monthlyDeadlineId: deadline.id,
            channel: "slack",
            message,
          },
        });
      } catch (error) {
        console.error(`Slack notification failed for task ${task.id}:`, error);
      }
    }

    // Send email notification
    if (task.emailTo) {
      try {
        await sendEmail(task.emailTo, message, message);
        await prisma.notificationLog.create({
          data: {
            recurringTaskId: task.id,
            monthlyDeadlineId: deadline.id,
            channel: "email",
            message,
          },
        });
      } catch (error) {
        console.error(`Email notification failed for task ${task.id}:`, error);
      }
    }

    // Update status to reminded
    if (deadline.status === "pending") {
      await prisma.monthlyDeadline.update({
        where: { id: deadline.id },
        data: { status: "reminded" },
      });
    }

    sentCount++;
  }

  return NextResponse.json({ ok: true, sent: sentCount });
}
