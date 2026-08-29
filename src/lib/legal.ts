/**
 * The legal + SMS-compliance strings, in one place.
 *
 * WHY THIS FILE EXISTS: the SMS consent sentence has to appear identically in
 * three places, and they are owned by different layers. The form shows it, the
 * /terms page repeats it, and /api/refer stores a copy of it on the lead row so
 * that months from now we can prove what the person actually agreed to. TCPA
 * puts the burden of proving consent on the sender, so a stored record of the
 * exact wording shown is the whole defense. If the sentence lived in the JSX we
 * would change the copy one day and silently invalidate every older record.
 *
 * The SERVER, not the client, writes the stored copy: the browser posts a
 * boolean and /api/refer stamps SMS_CONSENT_TEXT from this module. A posted
 * string would be attacker-controlled, and an attacker-controlled consent record
 * is worth nothing.
 *
 * Change the wording here and the stored text changes with it, which is correct.
 * Old rows keep the sentence that was on screen when they were captured.
 */

/** Human date shown at the top of /privacy and /terms. Bump when the text changes. */
export const LEGAL_UPDATED = "August 28, 2026";

/**
 * The exact sentence next to the consent checkbox on the referral form.
 *
 * Every clause here is load-bearing for 10DLC campaign approval, so do not trim
 * it for tone: the brand name, what the messages are about, "Message and data
 * rates may apply", "Message frequency varies", and the STOP and HELP keywords
 * are each checked by carrier vetting. The links to /privacy and /terms are
 * rendered next to it rather than inside it, so this string stays plain text and
 * matches what gets stored byte for byte.
 */
export const SMS_CONSENT_TEXT =
  "I agree to receive text messages from Rebrew at the number I provided, about the buying " +
  "or selling question I am sending here. Message and data rates may apply. Message " +
  "frequency varies. Reply STOP to opt out or HELP for help.";

/** Where a recipient reaches a human for HELP. Mirrored on /terms. */
export const SMS_HELP_EMAIL = "hello@rebrew.org";
