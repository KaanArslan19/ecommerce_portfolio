"use client";
import React from "react";
import ProductForm, { InitialValue } from "./ProductForm";
import { NewProductInfo, ProductResponse, ProductToUpdate } from "@/app/types";
import {
  removeAndUpdateProductImage,
  removeImageFromCloud,
  updateProduct,
} from "../(admin)/products/action";
import { updateProductInfoSchema } from "../utils/validationSchema";
import { ValidationError } from "yup";
import { toast } from "react-toastify";
import { extractPublicId, uploadImage } from "../utils/helper";
import { useRouter } from "next/navigation";
interface Props {
  product: ProductResponse;
}
export default function UpdateProduct({ product }: Props) {
  const router = useRouter();

  const initialValue: InitialValue = {
    ...product,
    thumbnail: product.thumbnail.url,
    images: product.images?.map(({ url }) => url),
    mrp: product.price.base,
    salePrice: product.price.discounted,
    bulletPoints: product.bulletPoints || [],
  };
  const handleImageRemove = (source: string) => {
    const publicId = extractPublicId(source);
    removeAndUpdateProductImage(product.id, publicId);
  };

  const handleOnSubmit = async (values: NewProductInfo) => {
    const { thumbnail, images } = values;
    try {
      await updateProductInfoSchema.validate(values, { abortEarly: false });
      const dataToUpdate: ProductToUpdate = {
        title: values.title,
        description: values.description,
        bulletPoints: values.bulletPoints,
        category: values.category,
        quantity: values.quantity,
        price: {
          base: values.mrp,
          discounted: values.salePrice,
        },
      };
      if (thumbnail) {
        // await removeImageFromCloud(product.thumbnail.id);
        const { id, url } = await uploadImage(thumbnail);
        dataToUpdate.thumbnail = { id, url };
      }
      if (images.length) {
        const uploadPromise = images.map(async (imgFile) => {
          return await uploadImage(imgFile);
        });
        dataToUpdate.images = await Promise.all(uploadPromise);
      }
      updateProduct(product.id, dataToUpdate);
      router.refresh();
      router.push("/products");
    } catch (error) {
      if (error instanceof ValidationError) {
        const errors = error.inner.map((err) => {
          toast.error(err.message);
        });
        console.log(errors);
      }
    }
  };
  return (
    <ProductForm
      initialValue={initialValue}
      onImageRemove={handleImageRemove}
      onSubmit={handleOnSubmit}
    />
  );
}
