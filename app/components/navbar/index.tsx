import React from "react";
import NavUI from "./NavUI";
import { auth } from "@/auth";
import CartModel from "@/app/models/cartModels";
import { Types } from "mongoose";
import UserModel from "@/app/models/userModel";
import startDb from "@/app/lib/db";

const fetchUserProfile = async () => {
  const session = await auth();
  if (!session) return null;

  await startDb();
  const user = await UserModel.findById(session.user.id);
  if (!user) return null;
  return {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar?.url,
    verified: user.verified,
  };
};
const getCartItemsCount = async () => {
  try {
    const session = await auth();
    if (!session?.user) return 0;
    const userId = session.user.id;
    const cart = await CartModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $unwind: "$items" },
      { $group: { _id: "$_id", totalQuantity: { $sum: "$items.quantity" } } },
    ]);
    if (cart.length) {
      return cart[0].totalQuantity;
    } else {
      return 0;
    }
  } catch (error) {
    console.log("Error while fetching cart items count.", error);
    return 0;
  }
};
export const dynamic = "force-dynamic";

export default async function Navbar() {
  const cartItemsCount = await getCartItemsCount();
  const profile = await fetchUserProfile();
  return (
    <div>
      <NavUI cartItemsCount={cartItemsCount} avatar={profile?.avatar} />
    </div>
  );
}
