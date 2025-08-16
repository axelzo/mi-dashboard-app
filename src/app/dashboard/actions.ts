'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ClothingCategory } from "@/generated/prisma";

export async function addClothingItem(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Not authenticated" };
  }

  const name = formData.get('name') as string;
  const category = formData.get('category') as ClothingCategory;
  const color = formData.get('color') as string;
  const brand = formData.get('brand') as string | null;
  const imageUrl = formData.get('imageUrl') as string | null;

  if (!name || !category || !color) {
    return { error: "Name, category, and color are required." };
  }

  await prisma.clothingItem.create({
    data: {
      name,
      category,
      color,
      brand,
      imageUrl,
      owner: {
        connect: {
          email: session.user.email,
        },
      },
    },
  });

  revalidatePath('/dashboard');
}
