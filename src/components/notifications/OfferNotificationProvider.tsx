import { useOfferNotifications } from "@/hooks/useOfferNotifications";

export const OfferNotificationProvider = ({ children }: { children: React.ReactNode }) => {
  useOfferNotifications();
  return <>{children}</>;
};
