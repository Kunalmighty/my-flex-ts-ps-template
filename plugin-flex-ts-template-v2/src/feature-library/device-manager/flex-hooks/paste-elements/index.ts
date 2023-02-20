import { PasteCustomCSS } from "@twilio-paste/customization";

const customPasteElements = {
  DEVICE_MGR_BUTTON: {
    backgroundColor: "transparent",
    borderRadius: "borderRadiusCircle",
    padding: "space20",
    ":hover": {
      backgroundColor: "colorBackgroundInverseStrong",
    }
  },
  DEVICE_MGR_BUTTON_OPEN: {
    backgroundColor: "colorBackgroundInverseStrong",
    borderRadius: "borderRadiusCircle",
    padding: "space20",
  },
} as {[key: string]: PasteCustomCSS};

export default customPasteElements;
