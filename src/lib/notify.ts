import { toast } from "sonner";

const DURATION = 3000;

const guard = new Map<string, number>();
function dedupe(key: string): boolean {
  const now = Date.now();
  const last = guard.get(key) ?? 0;
  if (now - last < 600) return false;
  guard.set(key, now);
  return true;
}

export const notify = {
  success(message: string, description?: string) {
    if (!dedupe("s:" + message)) return;
    toast.success(message, { description, duration: DURATION });
  },
  error(message: string, description?: string) {
    if (!dedupe("e:" + message)) return;
    toast.error(message, { description, duration: DURATION });
  },
  warning(message: string, description?: string) {
    if (!dedupe("w:" + message)) return;
    toast.warning(message, { description, duration: DURATION });
  },
  info(message: string, description?: string) {
    if (!dedupe("i:" + message)) return;
    toast(message, { description, duration: DURATION });
  },
};

export default notify;
