// add-feature-script: type imports
import ActivityReservationHandlerConfig from "../../feature-library/activity-reservation-handler/types/ServiceConfiguration";
import ActivitySkillFilterConfig from "../../feature-library/activity-skill-filter/types/ServiceConfiguration";
import CallbackAndVoicemailConfig from "../../feature-library/callback-and-voicemail/types/ServiceConfiguration";
import CallerIdConfig from "../../feature-library/caller-id/types/ServiceConfiguration";
import ChatToVideoEscalationConfig from "../../feature-library/chat-to-video-escalation/types/ServiceConfiguration";
import ConferenceConfig from "../../feature-library/conference/types/ServiceConfiguration";
import ScrollableActivitiesConfig from "../../feature-library/scrollable-activities/types/ServiceConfiguration";
import SupervisorBargeCoachConfig from "../../feature-library/supervisor-barge-coach/types/ServiceConfiguration";
import OmniChannelCapacityManagementConfig from "../../feature-library/omni-channel-capacity-management/types/ServiceConfiguration";
import InternalCallConfig from "../../feature-library/internal-call/types/ServiceConfiguration";
import EnhancedCRMContainerConfig from "../../feature-library/enhanced-crm-container/types/ServiceConfiguration";
import DeviceManagerConfig from "../../feature-library/device-manager/types/ServiceConfiguration";
import DualChannelRecordingConfig from "../../feature-library/dual-channel-recording/types/ServiceConfiguration";
import PauseRecordingConfig from "../../feature-library/pause-recording/types/ServiceConfiguration";
import ConversationTransferConfig from "../../feature-library/conversation-transfer/types/ServiceConfiguration";
import TeamViewFiltersConfig from "../../feature-library/teams-view-filters/types/ServiceConfiguration";
import SupervisorCapacityConfig from "../../feature-library/supervisor-capacity/types/ServiceConfiguration";
import ScheduleManagerConfig from "../../feature-library/schedule-manager/types/ServiceConfiguration";
import MultiCallConfig from "../../feature-library/multi-call/types/ServiceConfiguration";
import ChatTransferConfig from "../../feature-library/chat-transfer/types/ServiceConfiguration";
import HangUpByConfig from "../../feature-library/hang-up-by/types/ServiceConfiguration";
import AgentAutomationConfig from "feature-library/agent-automation/types/ServiceConfiguration";
import SupervisorCompleteReservation from "feature-library/supervisor-complete-reservation/types/ServiceConfiguration";

export default interface FeatureServiceConfiguration {
  activity_reservation_handler: ActivityReservationHandlerConfig;
  activity_skill_filter: ActivitySkillFilterConfig;
  callbacks: CallbackAndVoicemailConfig;
  caller_id: CallerIdConfig;
  chat_to_video_escalation: ChatToVideoEscalationConfig;
  conference: ConferenceConfig;
  device_manager: DeviceManagerConfig;
  scrollable_activities: ScrollableActivitiesConfig;
  supervisor_barge_coach: SupervisorBargeCoachConfig;
  omni_channel_capacity_management: OmniChannelCapacityManagementConfig;
  internal_call: InternalCallConfig;
  enhanced_crm_container: EnhancedCRMContainerConfig;
  conversation_transfer: ConversationTransferConfig;
  dual_channel_recording: DualChannelRecordingConfig;
  pause_recording: PauseRecordingConfig;
  teams_view_filters: TeamViewFiltersConfig;
  supervisor_capacity: SupervisorCapacityConfig;
  schedule_manager: ScheduleManagerConfig;
  multi_call: MultiCallConfig;
  chat_transfer: ChatTransferConfig;
  hang_up_by: HangUpByConfig;
  agent_automation: AgentAutomationConfig;
  supervisor_complete_reservation: SupervisorCompleteReservation;
  // add-feature-script: add config definitions above this line
}
