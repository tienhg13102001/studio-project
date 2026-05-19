import {
  DeviceMobileCameraIcon,
  MicrophoneIcon,
  PhoneIcon,
  QuestionIcon,
  TelevisionSimpleIcon,
} from "@phosphor-icons/react";
import type { ElementType } from "react";

const iconMap: Record<string, ElementType> = {
  TelevisionSimple: TelevisionSimpleIcon,
  DeviceMobileCamera: DeviceMobileCameraIcon,
  Phone: PhoneIcon,
  Microphone: MicrophoneIcon,
};

export const getIcon = (name: string): ElementType =>
  iconMap[name] ?? QuestionIcon;
