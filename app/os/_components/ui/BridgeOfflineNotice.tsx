import { Notice } from "./Notice";

// Local Bridgeがオフラインのときの案内。旧OsApp.tsxでMemoryGalaxy/VaultDb/Studioの
// 3箇所に複製されていた同一文言のp要素をここへ集約する。
export function BridgeOfflineNotice() {
  return (
    <Notice variant="warning">
      Local Bridge is offline. Configure the token in Settings, then run the bridge locally.
    </Notice>
  );
}
