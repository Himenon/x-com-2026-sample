import { Dialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>;
}

export function AboutDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="secondary-button">
        このサンプルについて <span aria-hidden="true">↗</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Popup className="dialog-popup">
          <Dialog.Title className="dialog-title">Stack, in the open.</Dialog.Title>
          <Dialog.Description className="dialog-description">
            このページは React のストリーミング
            SSR、Relay、GraphQL、Fastify、Watt、PostgreSQL、Redis
            の連携を一画面で確認するサンプルです。
          </Dialog.Description>
          <Dialog.Close className="primary-button">閉じる</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
