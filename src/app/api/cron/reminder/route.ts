import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { Resend } from "resend";
import { env } from "~/env";
import { ReminderEmailTemplate } from "~/server/emails/ReminderEmail";

const resend = new Resend(env.AUTH_RESEND_KEY);

export async function POST() {
  try {
    // Optional: Add authentication/authorization here
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days ago
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    console.log("Starting reminder cron job at:", now.toISOString());
    console.log(
      "Looking for invites created after:",
      fourteenDaysAgo.toISOString(),
    );
    console.log(
      "Looking for invites with last reminder before:",
      twentyFourHoursAgo.toISOString(),
    );

    // Find all incomplete invites that need reminders
    // Note: Since lastReminderSentAt might not be in the current schema yet,
    // we'll get all pending invites and filter in code for now
    const invitesToRemind = await db.invite.findMany({
      where: {
        status: "PENDING", // Not completed
        createdAt: {
          gte: fourteenDaysAgo, // Created within last 14 days
        },
      },
      include: {
        team: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`Found ${invitesToRemind.length} invites that need reminders`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Send reminder emails
    for (const invite of invitesToRemind) {
      try {
        // Check if we should send a reminder (filtering in code since lastReminderSentAt might not be in schema)
        const lastReminderSent = (invite as any).lastReminderSentAt;
        if (lastReminderSent && new Date(lastReminderSent) > twentyFourHoursAgo) {
          console.log(`Skipping invite ${invite.id} - reminder sent recently`);
          continue;
        }
        // Calculate days remaining (14 days from creation)
        const inviteAge = Math.floor(
          (now.getTime() - invite.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        const daysRemaining = Math.max(0, 14 - inviteAge);

        // Skip if expired (shouldn't happen due to query filter, but safety check)
        if (daysRemaining <= 0) {
          console.log(`Skipping expired invite ${invite.id}`);
          continue;
        }

        // Construct the survey URL
        const surveyUrl = `${env.BASE_URL}/survey/${invite.inviteToken}`;

        console.log(
          `Sending reminder to ${invite.email} for team ${invite.team.name}`,
        );

        // Send the reminder email
        const emailResult = await resend.emails.send({
          from: env.EMAIL_FROM,
          to: invite.email,
          subject: `Reminder: Complete your team survey for ${invite.team.name}`,
          react: ReminderEmailTemplate({
            teamName: invite.team.name,
            url: surveyUrl,
            daysRemaining,
          }) as any, // Temporary cast to fix React component type issue
        });

        if (emailResult.error) {
          console.error(
            `Failed to send reminder to ${invite.email}:`,
            emailResult.error,
          );
          errors.push(`${invite.email}: ${emailResult.error.message}`);
          errorCount++;
          continue;
        }

        // Update the lastReminderSentAt timestamp (if field exists in schema)
        try {
          await db.invite.update({
            where: { id: invite.id },
            data: { lastReminderSentAt: now } as any, // Cast to any since field might not be in types yet
          });
        } catch (dbError) {
          console.warn(`Could not update lastReminderSentAt for invite ${invite.id}:`, dbError);
          // Continue anyway - the email was sent successfully
        }

        console.log(`Successfully sent reminder to ${invite.email}`);
        successCount++;
      } catch (error) {
        console.error(`Error processing invite ${invite.id}:`, error);
        errors.push(
          `${invite.email}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        errorCount++;
      }
    }

    const summary = {
      timestamp: now.toISOString(),
      totalInvitesChecked: invitesToRemind.length,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("Reminder cron job completed:", summary);

    return NextResponse.json({
      success: true,
      message: `Reminder cron job completed. Sent ${successCount} reminders, ${errorCount} errors.`,
      summary,
    });
  } catch (error) {
    console.error("Fatal error in reminder cron job:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// Also support GET for testing purposes
export async function GET() {
  return POST();
}
