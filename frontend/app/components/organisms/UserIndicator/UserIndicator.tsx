import { useQuery } from "@tanstack/react-query";
import { WelcomeTag } from "~/components/atoms/WelcomeTag/WelcomeTag";
import { fetchCurrentUser } from "~/lib/api";
import { nicknameToShow } from "./UserIndicator.utils";

export function UserIndicator() {
  const { data } = useQuery({ queryKey: ["me"], queryFn: fetchCurrentUser, staleTime: 60_000, retry: false });
  const nickname = data ? nicknameToShow(data) : null;

  return nickname ? <WelcomeTag nickname={nickname} /> : null;
}
