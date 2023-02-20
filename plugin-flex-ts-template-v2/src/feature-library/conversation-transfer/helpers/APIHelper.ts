import { ITask, Manager, ConversationState, TaskHelper } from "@twilio/flex-ui";
import TaskService from "../../../utils/serverless/TaskRouter/TaskRouterService";
import { EncodedParams } from "../../../types/serverless";
import ApiService from "../../../utils/serverless/ApiService";

const manager: any | undefined = Manager.getInstance();

export interface RemoveParticipantRESTPayload {
  flexInteractionSid: string; //KDxxx sid for inteactions API
  flexInteractionChannelSid: string; //UOxxx sid for interactions API
  flexInteractionParticipantSid: string; // UTxxx sid for interactions API for the transferrring agent to remove
}

export interface TransferRESTPayload {
  taskSid: string; // sid of task to be transferred
  conversationId: string; // for linking transfer task in insights (CHxxx or WTxxx sid)
  jsonAttributes: string; // string representation of attributes for new task
  transferTargetSid: string; //worker or queue sid
  transferQueueName: string; // only valid if transfer to queue
  workersToIgnore: object; // {key: value} - where key is the taskrouter attribute to set and value is a string array of names of agents in conversation to make sure they don't get reservations to join again
  flexInteractionSid: string; //KDxxx sid for inteactions API
  flexInteractionChannelSid: string; //UOxxx sid for interactions API
  removeFlexInteractionParticipantSid: string; // UTxxx sid for interactions API for the transferrring agent to remove them from conversation
}

const _getMyParticipantSid = (participants: any): string => {
  const myParticipant = participants.find(
    (participant: any) =>
      participant.mediaProperties?.identity ===
      manager.conversationsClient?.user?.identity
  );

  return myParticipant ? myParticipant.participantSid : "";
};

const _getAgentsWorkerSidArray = (participants: any) => {
  const agentsWorkerSidArray = participants.reduce(
    (prevArray: string[], currentParticipant: any) => {
      if (
        currentParticipant.type === "agent" &&
        currentParticipant?.routingProperties?.workerSid
      ) {
        return [...prevArray, currentParticipant?.routingProperties?.workerSid];
      } else {
        return prevArray;
      }
    },
    []
  );

  return agentsWorkerSidArray;
};

const _queueNameFromSid = async (transferTargetSid: string) => {
  const queues = await TaskService.getQueues();
  const queueResult = queues
    ? queues.find((queue) => {
        return queue.sid === transferTargetSid;
      })
    : null;

  return queueResult?.friendlyName || "";
};

export const buildRemoveMyPartiticipantAPIPayload = async (
  conversation: ConversationState.ConversationState
): Promise<RemoveParticipantRESTPayload | null> => {
  if (!conversation.source?.sid) return null;
  const task = TaskHelper.getTaskFromConversationSid(conversation.source?.sid);
  if (!task || !TaskHelper.isCBMTask(task)) return null;

  const { flexInteractionSid = "", flexInteractionChannelSid = "" } =
    task.attributes;

  const participants = await task.getParticipants(flexInteractionChannelSid);

  const flexInteractionParticipantSid = _getMyParticipantSid(participants);

  if (!flexInteractionParticipantSid) return null;

  return {
    flexInteractionSid,
    flexInteractionChannelSid,
    flexInteractionParticipantSid,
  };
};

export const buildRemovePartiticipantAPIPayload = (
  task: ITask,
  flexInteractionParticipantSid: string
) => {
  if (!task || !TaskHelper.isCBMTask(task)) return null;

  const { flexInteractionSid = "", flexInteractionChannelSid = "" } =
    task.attributes;

  if (!flexInteractionParticipantSid) return null;

  return {
    flexInteractionSid,
    flexInteractionChannelSid,
    flexInteractionParticipantSid,
  };
};

export const buildInviteParticipantAPIPayload = async (
  task: ITask,
  targetSid: string,
  removeInvitingAgent: boolean
): Promise<TransferRESTPayload | null> => {
  const taskSid = task.taskSid;
  const conversationId =
    task.attributes?.conversations?.conversation_id || task.taskSid;
  const jsonAttributes = JSON.stringify(task.attributes);
  const transferTargetSid = targetSid;

  let transferQueueName = "";
  if (transferTargetSid.startsWith("WQ")) {
    transferQueueName = await _queueNameFromSid(transferTargetSid);
    if (!transferQueueName) {
      console.error(
        "Transfer failed. queueNameFromSid failed for",
        transferTargetSid
      );
      return null;
    }
  }

  const { flexInteractionSid = null, flexInteractionChannelSid = null } =
    task.attributes;

  if (!flexInteractionSid || !flexInteractionChannelSid) {
    console.error(
      "Transfer failed. Missing flexInteractionSid or flexInteractionChannelSid",
      task.sid
    );
    return null;
  }

  const participants = await task.getParticipants(flexInteractionChannelSid);

  const workerSidsInConversationArray = _getAgentsWorkerSidArray(participants);
  const workersToIgnore = {
    workerSidsInConversation: workerSidsInConversationArray,
  };

  let removeFlexInteractionParticipantSid = "";
  if (removeInvitingAgent) {
    removeFlexInteractionParticipantSid =
      _getMyParticipantSid(participants) || "";

    if (!removeFlexInteractionParticipantSid) {
      console.error(
        "Transfer failed. Didn't find flexInteractionPartipantSid",
        task.sid
      );
      return null;
    }
  }

  return {
    taskSid,
    conversationId,
    jsonAttributes,
    transferTargetSid,
    transferQueueName,
    workersToIgnore,
    flexInteractionSid,
    flexInteractionChannelSid,
    removeFlexInteractionParticipantSid,
  };
};

export interface TransferRESTResponse {
  success: boolean;
  invitesTaskSid: string;
}

export interface RemoveParticipantRESTResponse {
  success: boolean;
}

class ChatTransferService extends ApiService {
  sendTransferChatAPIRequest = (
    requestPayload: TransferRESTPayload
  ): Promise<TransferRESTResponse> => {
    const encodedParams: EncodedParams = {
      Token: encodeURIComponent(manager.user.token),
      taskSid: encodeURIComponent(requestPayload.taskSid),
      conversationId: encodeURIComponent(requestPayload.conversationId),
      jsonAttributes: encodeURIComponent(requestPayload.jsonAttributes),
      transferTargetSid: encodeURIComponent(requestPayload.transferTargetSid),
      transferQueueName: encodeURIComponent(requestPayload.transferQueueName),
      workersToIgnore: encodeURIComponent(
        JSON.stringify(requestPayload.workersToIgnore)
      ),
      flexInteractionSid: encodeURIComponent(requestPayload.flexInteractionSid),
      flexInteractionChannelSid: encodeURIComponent(
        requestPayload.flexInteractionChannelSid
      ),
      removeFlexInteractionParticipantSid: encodeURIComponent(
        requestPayload.removeFlexInteractionParticipantSid
      ),
    };

    return this.fetchJsonWithReject<TransferRESTResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/conversation-transfer/flex/invite-participant`,
      {
        method: "post",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: this.buildBody(encodedParams),
      }
    ).then((response): TransferRESTResponse => {
      return {
        ...response,
      };
    });
  };

  removeParticipantAPIRequest = (
    requestPayload: RemoveParticipantRESTPayload
  ): Promise<RemoveParticipantRESTResponse> => {
    const encodedParams: EncodedParams = {
      Token: encodeURIComponent(manager.user.token),
      flexInteractionSid: encodeURIComponent(requestPayload.flexInteractionSid),
      flexInteractionChannelSid: encodeURIComponent(
        requestPayload.flexInteractionChannelSid
      ),
      flexInteractionParticipantSid: encodeURIComponent(
        requestPayload.flexInteractionParticipantSid
      ),
    };

    return this.fetchJsonWithReject<TransferRESTResponse>(
      `${this.serverlessProtocol}://${this.serverlessDomain}/features/conversation-transfer/flex/remove-participant`,
      {
        method: "post",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: this.buildBody(encodedParams),
      }
    ).then((response): TransferRESTResponse => {
      return {
        ...response,
      };
    });
  };
}

export default new ChatTransferService();
