const { prepareFlexFunction } = require(Runtime.getFunctions()["common/helpers/prepare-function"].path);
const VoiceOperations = require(Runtime.getFunctions()[
  "common/twilio-wrappers/programmable-voice"
].path);

const requiredParameters = [
  { key: "callSid", purpose: "unique ID of call to resume recording" },
  { key: "recordingSid", purpose: "unique ID of recording to resume" },
];

exports.handler = prepareFlexFunction(requiredParameters, async (context, event, callback, response, handleError) => {
  try {
    const { callSid, recordingSid } = event;
    
    const result = await VoiceOperations.updateCallRecording({
      context,
      callSid,
      recordingSid,
      params: {
        status: 'in-progress'
      },
      attempts: 0,
    });
    
    const { success, recording, status } = result;
    
    response.setStatusCode(status);
    response.setBody({ success, recording });
    callback(null, response);
  } catch (error) {
    handleError(error);
  }
});