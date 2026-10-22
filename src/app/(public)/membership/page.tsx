import type { Metadata } from "next";
import { MembershipPageView } from "@/features/memberships/components/membership-page-view";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "Who can join Malappuram Youth Business Forum, and what members actually get: referrals, mentorship, partnerships and a place in the programme.",
};

export default function MembershipPage() {
  return <MembershipPageView />;
}
