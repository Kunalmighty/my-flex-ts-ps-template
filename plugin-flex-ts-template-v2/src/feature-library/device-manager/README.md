<a  href="https://www.twilio.com">
<img  src="https://static0.twilio.com/marketing/bundles/marketing/img/logos/wordmark-red.svg"  alt="Twilio"  width="250"  />
</a>

# Device Manager

This feature is intended to demonstrate how to use web APIs to select audio devices and apply them for use within Flex, specifically with the Flex Voice Client. This plugin was built for **Flex 2.0**.

---

## Flex User Experience

The Device Manager currently provides options related to audio device selection. Utilizing Twilio Paste components, a list of audio device options is presented to the agent upon clicking the `Icon Button` in the `Main Header` of Flex.

<img  src="https://hosted-assets-2838-dev.twil.io/DeviceManagerMenu.gif"  alt="gif"  width="100%"  />

After selecting an audio device, a `Toast notification` is shown to indicate the audio device has been set successfully.

---

## Setup and Dependencies

There are no additional dependencies for setup beyond ensuring the flag is enabled within the `flex-config` attributes.

To enable the `Device Manager` feature, under the `flex-config` attributes set the `device_manager` `enabled` flag to `true`:

```json
"device_manager": {
    "enabled": true
}
```

---

## Changelog

### 1.0

**October 5, 2022**

- Upgraded [original plugin code](https://github.com/jhunter-twilio/plugin-select-audio-device) to template structure & Flex 2.0 with Twilio Paste.
