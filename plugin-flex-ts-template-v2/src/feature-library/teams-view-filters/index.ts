import { getFeatureFlags } from '../../utils/configuration';

const { 
  enabled = false, 
  logFilters = false,
  department_options = [],
  team_options = []
} = getFeatureFlags().features?.teams_view_filters || {};
const {
  email = false,
  department = false,
  queue_no_worker_data = false,
  queue_worker_data = false,
  team = false,
  agent_skills = false
  } = getFeatureFlags().features?.teams_view_filters?.applied_filters || {};

export const isFeatureEnabled = () => {
  return enabled;
};

export const shouldLogFilters = () => {
  return enabled && logFilters;
};

export const isExtensionsFilterEnabled = () => {
  return enabled && email;
}

export const isDepartmentFilterEnabled = () => {
  return enabled && department;
}

export const isQueueNoWorkerDataFilterEnabled = () => {
  return enabled && queue_no_worker_data;
}

export const isQueueWorkerDataFilterEnabled = () => {
  return enabled && queue_worker_data;
}

export const isTeamFilterEnabled = () => {
  return enabled && team;
}

export const isAgnetSkillsFilterEnabled = () => {
  return enabled && agent_skills;
}

export const getDepartmentOptions = () => {
  return department_options;
}

export const getTeamOptions = () => {
  return team_options;
}
