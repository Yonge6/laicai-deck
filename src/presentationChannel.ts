import type { Language } from "./data/deck";
import type { PollState } from "./data/interactions";

export const presentationChannelName = "jarvis-presentation";

export type PresentationMessage =
  | {
      type: "STATE_SYNC";
      currentIndex: number;
      language: Language;
      isRunning: boolean;
      startedAt: number | null;
      totalElapsedMs?: number;
      pageStartedAt?: number | null;
      pageElapsedMs?: number;
    }
  | {
      type: "GO_TO";
      index: number;
    }
  | {
      type: "NEXT";
    }
  | {
      type: "PREV";
    }
  | {
      type: "TIMER_START";
    }
  | {
      type: "TIMER_PAUSE";
    }
  | {
      type: "TIMER_RESET";
    }
  | {
      type: "REQUEST_STATE";
    }
  | {
      type: "INTERACTION_STEP";
      slideId: number;
      step: number;
    }
  | {
      type: "INTERACTION_RESET";
      slideId: number;
    }
  | {
      type: "POLL_UPDATE";
      poll: PollState;
    }
  | {
      type: "POLL_RESET";
    }
  | {
      type: "OPEN_CASE";
      caseId: string;
    }
  | {
      type: "CLOSE_MODAL";
    }
  | {
      type: "INTERACTION_STATE_SYNC";
      steps: Record<number, number>;
      poll: PollState;
      finaleActive: boolean;
    }
  | {
      type: "SAFE_MODE";
      enabled: boolean;
    }
  | {
      type: "PREFLIGHT_PING";
    }
  | {
      type: "PREFLIGHT_PONG";
    }
  | {
      type: "REHEARSAL_EVENT";
      event: string;
      slideId: number;
    };

type WireMessage = PresentationMessage & {
  senderId: string;
  sentAt: number;
};

const storageMessageKey = "jarvis-presentation.message";

function makeSenderId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

export function createPresentationChannel(onMessage: (message: PresentationMessage) => void) {
  const senderId = makeSenderId();
  const channel = "BroadcastChannel" in window ? new BroadcastChannel(presentationChannelName) : null;

  const receive = (message: WireMessage) => {
    if (message.senderId === senderId) return;
    onMessage(message);
  };

  channel?.addEventListener("message", (event: MessageEvent<WireMessage>) => receive(event.data));

  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageMessageKey || !event.newValue) return;
    try {
      receive(JSON.parse(event.newValue) as WireMessage);
    } catch {
      // ponytail: bad cross-window payload is ignored; add diagnostics if this ever needs ops visibility.
    }
  };
  window.addEventListener("storage", onStorage);

  return {
    post(message: PresentationMessage) {
      const wireMessage: WireMessage = { ...message, senderId, sentAt: Date.now() };
      channel?.postMessage(wireMessage);
      localStorage.setItem(storageMessageKey, JSON.stringify(wireMessage));
    },
    close() {
      channel?.close();
      window.removeEventListener("storage", onStorage);
    },
  };
}
