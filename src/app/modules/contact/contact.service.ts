import { randomUUID } from "crypto";
import { USER_ROLES } from "../../../enums/user";
import { emailTemplate } from "../../../shared/emailTemplate";
import { User } from "../user/user.model";
import { ContactModel, IContact } from "./contact.interface";
import { Contact } from "./contact.model";
import { emailProducer } from "../../../services/email.producer";

const contactWithAdmin = async (payload: IContact) => {
  const admin = await User.findOne({ role: USER_ROLES.SUPER_ADMIN }).select(
    "email",
  );
  const contactTemplate = emailTemplate.contactEmailTemp(payload);

  const emailData = {
    jobId: randomUUID(),
    to: admin?.email,
    subject: contactTemplate.subject,
    html: contactTemplate.html,
    type: "contact_admin",
  };

  await emailProducer.sendEmailEvent(emailData);
  // also need to feedback to user
  const feedbackTemplate = emailTemplate.feedbackEmailTemp(payload);
  const feedbackData = {
    jobId: randomUUID(),
    to: payload.email,
    subject: feedbackTemplate.subject,
    html: feedbackTemplate.html,
    type: "contact_feedback",
  };
  await emailProducer.sendEmailEvent(feedbackData);
  const contact = await Contact.create(payload);
  return contact;
};

export const ContactServices = {
  contactWithAdmin,
};
