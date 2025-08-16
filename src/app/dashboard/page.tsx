'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from 'next/image';

// Define the type for a clothing item based on your schema
interface ClothingItem {
  id: number;
  name: string;
  category: string;
  color: string;
  brand?: string | null;
  imageUrl?: string | null;
}

const ClothingCategory = ['SHIRT', 'PANTS', 'SHOES', 'JACKET', 'ACCESSORY', 'OTHER'];

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      fetchClothingItems();
    }
  }, [isAuthenticated, router]);

  const fetchClothingItems = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/clothing');
      setClothingItems(response.data);
    } catch (error) {
      console.error("Failed to fetch clothing items", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await api.post('/clothing', data);
      fetchClothingItems(); // Refetch items after adding a new one
      (event.target as HTMLFormElement).reset(); // Reset form
    } catch (error) {
      console.error("Failed to add item", error);
      alert("Failed to add item. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

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
              <form onSubmit={handleAddItem} className="flex flex-col gap-4">
                <Input name="name" placeholder="Item Name (e.g., Blue T-Shirt)" required />
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ClothingCategory.map((category) => (
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
