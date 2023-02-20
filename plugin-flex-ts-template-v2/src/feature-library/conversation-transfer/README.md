# Conversation Transfer

This feature implements transferring of chats between agents and multiple agents in the same chat. It supports webchat, SMS and whatsapp that use [Flex Conversations](https://www.twilio.com/docs/flex/conversations).

**Config options allows for two different options:**

- _cold_transfer:_ Enables a ‘transfer’ icon for the task header that can be used to implement cold/blind transfer
- _multi_participant:_ Enables a participants tab that is used to invite other agents to the conversation. This participants tab allows for adding and removing of agents so that multiple agents can be in the chat at the same time. This allows an agent to delay leaving the chat until another agent has joined.

The two different features can be enabled/disabled independently. In the case of both being enabled and there is an invite that has been sent to an agent or queue then the cold_transfer option is disabled until an agent joins or the invite is canceled.

### Cold Transfer
![cold transfer](screenshots/chat-transfer.gif)

### Multi participant chat
![multiple partcipants](screenshots/multi-participant.gif)

## Setup

### Config
As described above there are option flags for cold transfer and multi-participation.
The features configuration options are:
```javascript
{
 enabled: boolean;
 cold_transfer: boolean;
 multi_participant: boolean;
}
```
### Serverless
The TaskRouter workflow sid (WWxxx) should be added to the .env file in the serverless directory before deploying the service to Twilio.
```
# CHAT TRANSFER
TWILIO_FLEX_CHAT_TRANSFER_WORKFLOW_SID=WWxxx
```

### TaskRouter Workflow

A new task is created for each invite to an agent or queue. A TaskRouter workflow is used to route to the correct agent (using [Known Agent Routing](https://www.twilio.com/docs/taskrouter/workflow-configuration/known-agent-routing)) and requires a target for each queue that agents will invite agents from.
As well as indicating the transfer target in task attributes it also adds the worker sids for agents that are currently in the chat. The workflow can use this task attribute to ensure that agents already in the chat are not considered for routing for transfers to a queue.

The TaskAttributes that are set by the plugin are:
```
transferTargetType - set to either worker or queue
transferTargetSid - will be set to the worker sid in the case of target type == worker
transferQueueName - TaskRouter friendly name for the queue in the case of target type == queue
workerSidsInConversation - string array of workers in the conversation
```

A sample workflow showing how to route to the agent, queue and ignore agents in the conversation is [here](example-taskrouter-workflow.json):


## Implementation Notes

Flex 2.x used [Conversation Based Messaging (CBM)](https://www.twilio.com/docs/flex/conversations) for Chat (webchat, SMS, whatsApp). CBM makes use of the [Interactions API](https://www.twilio.com/docs/flex/developer/conversations/interactions-api) to orchestrate Conversations and Tasks.

This plugin makes use of the Interaction API [Invite](https://www.twilio.com/docs/flex/developer/conversations/interactions-api/invites-subresource) and [Participants](https://www.twilio.com/docs/flex/developer/conversations/interactions-api/interaction-channel-participants) endpoints.

When the plugin makes a request to the supporting Twilio Serverless Function it passes the details about the type of transfer and the transfer target. The Twilio Serverless Function uses the Invite endpoint to create a new task for the transfer that is linked to the underlying Conversation. The Function then uses the Participants endpoint to remove the transferring agent from the Conversation. Removing the participant completes the original task.
Note that unlike the default behavior when the agent is removed the Conversation remains active as the Conversation is waiting for the new agent to accept the reservation and join the conversation.

This plugin also copies all of the existing task attributes from the original task to the transferring task. The tasks conversations.conversations_id is updated to link the tasks for reporting purposes.

The conversations attributes are used to track outstanding invites. When the invite is created the conversations attributes are updated and when an agent joins the conversation it will remove these attributes.

## Disclaimer and important notes for production use

This is a POC feature that demonstrates how transfers and multiple participants can be implemented with the Interactions API and Conversations Based Messaging in Flex. It is important with conversations that the conversation is closed if all agents are removed and ensuring the same agent doesn't try and join the conversation multiple times.
In these scenarios you could be left with a customer chatting and the messages not being seen by an agent or for agents to end up with a task that they are unable to accept.

The plugin attempts to avoid these edge cases but there are timing conditions that can't easily be taken into account from the plugin. For example the plugin will change the *end chat* action to *leave chat* when there are multiple participants. But there could be a timing window where both agents leave the chat at the same time. This results in the participants being removed but the channel is still active.

To handle these edge cases we would recommend using TaskRouter or Conversations webhooks to a backend platform that could detect any invalid Task or Conversations states and update the chat accordingly. For example in this case marking the channel as inactive so that subsequent messages from the customer create a new conversation.

