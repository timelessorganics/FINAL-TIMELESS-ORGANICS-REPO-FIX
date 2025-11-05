import mailchimp from "@mailchimp/mailchimp_marketing";

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER = process.env.MAILCHIMP_SERVER;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;

let isConfigured = false;

if (MAILCHIMP_API_KEY && MAILCHIMP_SERVER && MAILCHIMP_LIST_ID) {
  mailchimp.setConfig({
    apiKey: MAILCHIMP_API_KEY,
    server: MAILCHIMP_SERVER,
  });
  isConfigured = true;
  console.log("[Mailchimp] Integration configured");
} else {
  console.log("[Mailchimp] Not configured - add MAILCHIMP_API_KEY, MAILCHIMP_SERVER, MAILCHIMP_LIST_ID");
}

export interface MailchimpSubscriber {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
}

export async function addSubscriberToMailchimp(subscriber: MailchimpSubscriber): Promise<boolean> {
  if (!isConfigured || !MAILCHIMP_LIST_ID) {
    console.log("[Mailchimp] Skipping - not configured");
    return false;
  }

  try {
    const mergeFields: any = {};
    if (subscriber.firstName) mergeFields.FNAME = subscriber.firstName;
    if (subscriber.lastName) mergeFields.LNAME = subscriber.lastName;
    if (subscriber.phone) mergeFields.PHONE = subscriber.phone;

    await mailchimp.lists.addListMember(MAILCHIMP_LIST_ID, {
      email_address: subscriber.email,
      status: "subscribed",
      merge_fields: mergeFields,
      tags: subscriber.tags || [],
    });

    console.log(`[Mailchimp] Added subscriber: ${subscriber.email}`);
    return true;
  } catch (error: any) {
    if (error.response?.body?.title === "Member Exists") {
      console.log(`[Mailchimp] Subscriber already exists: ${subscriber.email}`);
      
      if (subscriber.tags && subscriber.tags.length > 0) {
        try {
          const crypto = await import("crypto");
          const subscriberHash = crypto.createHash("md5").update(subscriber.email.toLowerCase()).digest("hex");
          await mailchimp.lists.updateListMemberTags(MAILCHIMP_LIST_ID, subscriberHash, {
            tags: subscriber.tags.map(tag => ({ name: tag, status: "active" })),
          });
          console.log(`[Mailchimp] Updated tags for existing subscriber: ${subscriber.email}`);
        } catch (tagError) {
          console.error("[Mailchimp] Error updating tags:", tagError);
        }
      }
      return true;
    }
    
    console.error("[Mailchimp] Error adding subscriber:", error.response?.body || error.message);
    return false;
  }
}

export async function bulkSyncToMailchimp(subscribers: MailchimpSubscriber[]): Promise<{ success: number; failed: number }> {
  if (!isConfigured) {
    throw new Error("Mailchimp not configured");
  }

  let success = 0;
  let failed = 0;

  for (const subscriber of subscribers) {
    const result = await addSubscriberToMailchimp(subscriber);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}
