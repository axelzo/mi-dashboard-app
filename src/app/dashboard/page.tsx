import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addClothingItem } from "./actions";
import { ClothingCategory } from "@/generated/prisma";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from 'next/image';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/login');
  }

  const clothingItems = await prisma.clothingItem.findMany({
    where: {
      owner: {
        email: session.user.email,
      },
    },
    orderBy: {
      id: 'desc'
    }
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Your Wardrobe</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Clothing</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={addClothingItem} className="flex flex-col gap-4">
                <Input name="name" placeholder="Item Name (e.g., Blue T-Shirt)" required />
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ClothingCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0) + category.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input name="color" placeholder="Color (e.g., Blue)" required />
                <Input name="brand" placeholder="Brand (e.g., Nike)" />
                <Input name="imageUrl" placeholder="Image URL" />
                <Button type="submit">Add to Wardrobe</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Clothing</CardTitle>
            </CardHeader>
            <CardContent>
              {clothingItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clothingItems.map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                        {item.imageUrl && (
                          <div className="relative h-40 w-full">
                            <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" className="rounded-md" />
                          </div>
                        )}
                        <p><strong>Category:</strong> {item.category}</p>
                        <p><strong>Color:</strong> {item.color}</p>
                        {item.brand && <p><strong>Brand:</strong> {item.brand}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p>Your wardrobe is empty. Add your first item!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
