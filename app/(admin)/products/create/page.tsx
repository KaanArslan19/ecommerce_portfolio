"use client";
import ProductForm from "@/app/components/ProductForm";
import { NewProductInfo } from "@/app/types";
import { uploadImage } from "@/app/utils/helper";
import { newProductInfoSchema } from "@/app/utils/validationSchema";
import React from "react";
import { toast } from "react-toastify";
import { ValidationError } from "yup";
import { createProduct } from "../action";
import { useRouter } from "next/navigation";

export default function Create() {
  const router = useRouter();
  const handleCreateProduct = async (values: NewProductInfo) => {
    const { thumbnail, images } = values;
    try {
      await newProductInfoSchema.validate(values, { abortEarly: false });
      const thumbnailRes = await uploadImage(thumbnail!);
      let productImages: { url: string; id: string }[] = [];
      if (images) {
        const uploadPromise = images.map(async (imageFile) => {
          const { url, id } = await uploadImage(imageFile);
          return { url, id };
        });
        productImages = await Promise.all(uploadPromise);
      }

      await createProduct({
        ...values,
        price: {
          base: values.mrp,
          discounted: values.salePrice,
        },
        thumbnail: thumbnailRes,
        images: productImages,
      });
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
    <div>
      <ProductForm onSubmit={handleCreateProduct} />
    </div>
  );
}
