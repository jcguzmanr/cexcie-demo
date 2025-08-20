"use client";

import { Button } from "./Button";
import { useTelemetryEvents } from "@/lib/useTelemetry";
import { CHANNEL_CONFIG } from "@/lib/thankyou-events";

interface ChannelActionButtonsProps {
  leadId?: string;
  onChannelAction: (channel: "whatsapp" | "email" | "sms") => void;
  className?: string;
}

export function ChannelActionButtons({ 
  leadId, 
  onChannelAction,
  className 
}: ChannelActionButtonsProps) {
  const { trackCustomEvent } = useTelemetryEvents();

  const handleChannelClick = (channel: "whatsapp" | "email" | "sms") => {
    // Evento: send_via_channel_clicked
    trackCustomEvent("send_via_channel_clicked", {
      leadId,
      channel
    });

    // Llamar a la función del padre
    onChannelAction(channel);
  };

  const channels = Object.entries(CHANNEL_CONFIG).map(([key, config]) => ({
    key: key as "whatsapp" | "email" | "sms",
    ...config
  }));

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${className}`}>
      {channels.map((channel) => (
        <Button
          key={channel.key}
          variant="secondary"
          onClick={() => handleChannelClick(channel.key)}
          className={`flex flex-col items-center gap-2 p-4 h-auto ${channel.color} text-white border-0 hover:scale-105 transition-all duration-200`}
        >
          <span className="text-2xl">{channel.icon}</span>
          <span className="font-medium">{channel.label}</span>
          <span className="text-xs opacity-90">{channel.description}</span>
        </Button>
      ))}
    </div>
  );
}
