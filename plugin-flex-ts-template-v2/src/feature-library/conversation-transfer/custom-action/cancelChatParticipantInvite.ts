import { Actions, Notifications, ConversationState } from "@twilio/flex-ui";
import TaskService from "../../../utils/serverless/TaskRouter/TaskRouterService";
import { removeInvitedParticipant } from "../helpers/inviteTracker";
import { NotificationIds } from "../flex-hooks/notifications/TransferResult";
import { CancelChatParticipantInviteActionPayload } from "../types/ActionPayloads";

export const registerCancelChatParticipantInvite = () => {
  Actions.registerAction("CancelChatParticipantInvite", (payload: any) =>
    handleCancelChatParticipantInvite(
      payload as CancelChatParticipantInviteActionPayload
    )
  );
};

const handleCancelChatParticipantInvite = async (
  payload: CancelChatParticipantInviteActionPayload
) => {
  const { conversation, invitesTaskSid } = payload;
  console.log(
    "handleCancelChatParticipantInvite",
    conversation,
    invitesTaskSid
  );

  try {
    await TaskService.updateTaskAssignmentStatus(invitesTaskSid, "canceled");
    await removeInvitedParticipant(conversation, invitesTaskSid);

    Notifications.showNotification(
      NotificationIds.ChatCancelParticipantInviteSuccess
    );
  } catch (error) {
    console.error(
      "handleCancelChatParticipantInvite API request failed",
      error
    );
    Notifications.showNotification(
      NotificationIds.ChatCancelParticipantInviteFailed
    );
  }
};
