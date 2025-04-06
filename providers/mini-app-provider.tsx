"use client";

import sdk, { type Context } from "@farcaster/frame-sdk";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  MiniKitContextType,
  MiniKitProviderReact,
  UpdateClientContextParams,
} from "./types";

export const emptyContext = {} as MiniKitContextType;

export const MiniKitContext = createContext<MiniKitContextType>(emptyContext);

/**
 * Provides the MiniKit React Context to the app.
 */
export function MiniKitProvider({
  children,
  notificationProxyUrl = "/api/notify",
}: MiniKitProviderReact) {
  const [context, setContext] = useState<Context.FrameContext | null>(null);

  useEffect(() => {
    sdk.on("frameAdded", ({ notificationDetails }) => {
      if (notificationDetails) {
        updateClientContext({
          details: notificationDetails,
          frameAdded: true,
        });
      }
    });

    sdk.on("frameAddRejected", ({ reason }) => {
      console.error("Frame add rejected", reason);
    });

    sdk.on("frameRemoved", () => {
      updateClientContext({
        details: undefined,
        frameAdded: false,
      });
    });

    sdk.on("notificationsEnabled", ({ notificationDetails }) => {
      updateClientContext({
        details: notificationDetails,
      });
    });

    sdk.on("notificationsDisabled", () => {
      updateClientContext({
        details: undefined,
      });
    });

    async function fetchContext() {
      try {
        // if not running in a frame, context resolves as undefined
        const context = await sdk.context;
        setContext(context);
      } catch (error) {
        console.error("Error fetching context:", error);
      }
    }

    fetchContext();

    return () => {
      sdk.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateClientContext = useCallback(
    ({ details, frameAdded }: UpdateClientContextParams) => {
      setContext((prevContext) => {
        if (!prevContext) {
          return null;
        }
        return {
          ...prevContext,
          client: {
            ...prevContext.client,
            notificationDetails: details ?? undefined,
            added: frameAdded ?? prevContext.client.added,
          },
        };
      });
    },
    [],
  );


  const value = useMemo(() => {
    return {
      context,
      updateClientContext,
      notificationProxyUrl,
    };
  }, [updateClientContext, notificationProxyUrl, context]);

  return (
    <MiniKitContext.Provider value={value}>
      <div
        style={{
          paddingTop: context?.client.safeAreaInsets?.top ?? 0,
          paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
          paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
          paddingRight: context?.client.safeAreaInsets?.right ?? 0,
        }}
      >
        {children}
      </div>
    </MiniKitContext.Provider>
  );
}
