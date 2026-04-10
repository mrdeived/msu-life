import Pusher from "pusher";

let _pusher: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
    return null;
  }
  if (!_pusher) {
    _pusher = new Pusher({ appId: PUSHER_APP_ID, key: PUSHER_KEY, secret: PUSHER_SECRET, cluster: PUSHER_CLUSTER, useTLS: true });
  }
  return _pusher;
}
