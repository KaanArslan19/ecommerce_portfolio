import UpdatePassword from "@/app/components/updatePassword";
import startDb from "@/app/lib/db";
import PasswordResetTokenModel from "@/app/models/passwordResetToken";
import { redirect } from "next/navigation";
import React from "react";
interface Props {
  searchParams: {
    token: string;
    userId: string;
  };
}

const fetchTokenValidation = async (token: string, userId: string) => {
  await startDb();
  const resetToken = await PasswordResetTokenModel.findOne({ user: userId });
  if (!resetToken) return null;
  const matched = await resetToken.compareToken(token);
  if (!matched) return null;
  return true;
};
export default async function ResetPassword({ searchParams }: Props) {
  const { token, userId } = searchParams;
  if (!token || !userId) return redirect("/");

  const isValid = await fetchTokenValidation(token, userId);
  if (!isValid) return redirect("/");

  return <UpdatePassword token={token} userId={userId} />;
}
