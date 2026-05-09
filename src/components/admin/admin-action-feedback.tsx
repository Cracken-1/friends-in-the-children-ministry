import { AdminNotice } from "@/components/admin/admin-ui";

type FeedbackProps = {
  entityLabel: string;
  success?: string | string[];
  error?: string | string[];
};

function readParam(param?: string | string[]) {
  return Array.isArray(param) ? param[0] : param;
}

export function AdminListFeedback({ entityLabel, success, error }: FeedbackProps) {
  const successValue = readParam(success);
  const errorValue = readParam(error);

  if (successValue === "created") {
    return (
      <AdminNotice
        tone="success"
        title={`${entityLabel} created`}
        body={`The ${entityLabel.toLowerCase()} has been added successfully.`}
      />
    );
  }

  if (successValue === "updated") {
    return (
      <AdminNotice
        tone="success"
        title={`${entityLabel} updated`}
        body={`The ${entityLabel.toLowerCase()} changes have been saved.`}
      />
    );
  }

  if (successValue === "deleted") {
    return (
      <AdminNotice
        tone="success"
        title={`${entityLabel} deleted`}
        body={`The ${entityLabel.toLowerCase()} has been removed.`}
      />
    );
  }

  if (successValue === "promoted") {
    return (
      <AdminNotice
        tone="success"
        title="Lesson draft created"
        body="The Telegram import has been promoted into a draft lesson with its matched attachments."
      />
    );
  }

  if (successValue === "bulk-promoted") {
    return (
      <AdminNotice
        tone="success"
        title="Imports promoted"
        body="The selected Telegram imports were promoted into lesson drafts."
      />
    );
  }

  if (errorValue === "database-not-configured") {
    return (
      <AdminNotice
        tone="warning"
        title="Database unavailable"
        body="The requested action could not run because the database is not configured in this environment."
      />
    );
  }

  if (errorValue === "telegram-import-not-found") {
    return (
      <AdminNotice
        tone="warning"
        title="Import not found"
        body="That Telegram import could not be located anymore."
      />
    );
  }

  if (errorValue === "telegram-import-already-mapped") {
    return (
      <AdminNotice
        tone="warning"
        title="Already promoted"
        body="This Telegram import is already mapped to a lesson."
      />
    );
  }

  if (errorValue === "telegram-import-selection-required") {
    return (
      <AdminNotice
        tone="warning"
        title="No imports selected"
        body="Select at least one Telegram import before running the bulk promotion action."
      />
    );
  }

  return null;
}

export function AdminEditorFeedback({ entityLabel, success, error }: FeedbackProps) {
  const successValue = readParam(success);
  const errorValue = readParam(error);

  if (successValue === "uploaded") {
    return (
      <AdminNotice
        tone="success"
        title="File uploaded"
        body={`The ${entityLabel.toLowerCase()} file has been uploaded and is ready to save.`}
      />
    );
  }

  if (successValue === "attachment-added") {
    return (
      <AdminNotice
        tone="success"
        title="Attachment added"
        body="The lesson attachment has been added and is ready for learners and teachers to access."
      />
    );
  }

  if (successValue === "attachment-deleted") {
    return (
      <AdminNotice
        tone="success"
        title="Attachment removed"
        body="The lesson attachment has been removed from this lesson."
      />
    );
  }

  if (errorValue === "title-required") {
    return <AdminNotice tone="warning" title="Title required" body={`Add a title before saving this ${entityLabel.toLowerCase()}.`} />;
  }

  if (errorValue === "email-required") {
    return <AdminNotice tone="warning" title="Email required" body="Enter a valid email address before saving this user." />;
  }

  if (errorValue === "password-too-short") {
    return <AdminNotice tone="warning" title="Password too short" body="Use at least 8 characters for the password." />;
  }

  if (errorValue === "database-not-configured") {
    return (
      <AdminNotice
        tone="warning"
        title="Database unavailable"
        body="This action cannot be completed until the database is configured."
      />
    );
  }

  if (errorValue === "attachment-url-required") {
    return (
      <AdminNotice
        tone="warning"
        title="Attachment required"
        body="Upload or paste an attachment file URL before adding it to the lesson."
      />
    );
  }

  return null;
}
