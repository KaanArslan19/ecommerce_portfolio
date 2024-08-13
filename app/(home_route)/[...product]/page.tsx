import ProductView from "@/app/components/ProductView";
import ReviewsList from "@/app/components/ReviewsList";
import startDb from "@/app/lib/db";
import ReviewModel from "@/app/models/ReviewModel";
import ProductModel from "@/app/models/productModel";
import { ObjectId, isValidObjectId } from "mongoose";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
interface Props {
  params: {
    product: string[];
  };
}

const fetchProduct = async (productId: string) => {
  if (!isValidObjectId(productId)) return redirect("/404");
  await startDb();
  const product = await ProductModel.findById(productId);
  if (!product) return redirect("/404");

  return JSON.stringify({
    id: product._id.toString(),
    title: product.title,
    description: product.description,
    thumbnail: product.thumbnail.url,
    rating: product.rating,
    images: product.images?.map(({ url }) => url),
    bulletPoints: product.bulletPoints,
    price: product.price,
    sale: product.sale,
  });
};
const fetchProductReviews = async (productId: string) => {
  await startDb();
  const reviews = await ReviewModel.find({ product: productId }).populate<{
    userId: { _id: ObjectId; name: string; avatar?: { url: string } };
  }>({
    path: "userId",
    select: "name avatar.url",
  });
  const result = reviews.map((r) => ({
    id: r._id.toString(),
    rating: r.rating,
    comment: r.comment,
    date: r.createdAt,
    userInfo: {
      id: r.userId._id.toString(),
      name: r.userId.name,
      avatar: r.userId.avatar?.url,
    },
  }));
  return JSON.stringify(result);
};
export default async function Product({ params }: Props) {
  const { product } = params;
  const productId = product[1];
  const productDetails = JSON.parse(await fetchProduct(productId));
  let productImages = [productDetails.thumbnail];
  if (productDetails.images) {
    productImages = productImages.concat(productDetails.images);
  }
  const reviews = await fetchProductReviews(productId);
  return (
    <div className="p-4">
      <ProductView
        title={productDetails.title}
        description={productDetails.description}
        price={productDetails.price}
        sale={productDetails.sale}
        images={productImages}
        points={productDetails.bulletPoints}
        rating={productDetails.rating}
      />
      <div className="py-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold mb-2">Reviews</h1>
          <Link href={`/add-review/${productDetails.id}`}>Add Review</Link>
        </div>
        <ReviewsList reviews={JSON.parse(reviews)} />
      </div>
    </div>
  );
}
