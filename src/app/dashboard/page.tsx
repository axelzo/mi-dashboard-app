'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getClothingItems, addClothingItem, updateClothingItem, deleteClothingItem } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'; // Assuming you have a Dialog component

// Define the type for a clothing item based on your schema
interface ClothingItem {
  id: string; // Changed to string to match potential UUIDs from DB
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

  // State for the edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      fetchItems();
    }
  }, [isAuthenticated, router]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await getClothingItems();
      setClothingItems(response);
    } catch (error) {
      console.error("Failed to fetch clothing items", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await addClothingItem(formData);
      fetchItems(); // Refetch items after adding a new one
      (event.target as HTMLFormElement).reset(); // Reset form
    } catch (error) {
      console.error("Failed to add item", error);
      alert("Failed to add item. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteClothingItem(id);
        setClothingItems(clothingItems.filter(item => item.id !== id));
      } catch (error) {
        console.error('Failed to delete item', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const handleEditClick = (item: ClothingItem) => {
    setSelectedItem(item);
    setImagePreview(item.imageUrl ?? null);
    setIsModalOpen(true);
  };

  const handleUpdateItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedItem) return;

    const formData = new FormData(event.currentTarget);

    try {
      const updatedItem = await updateClothingItem(selectedItem.id, formData);
      setClothingItems(clothingItems.map(item => item.id === selectedItem.id ? updatedItem : item));
      setIsModalOpen(false);
      setSelectedItem(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Failed to update item', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return '';
    const normalizedPath = path.replace(/\\/g, '/');
    if (normalizedPath.startsWith('blob:')) {
      return normalizedPath;
    }
    // Use the environment variable for the base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    return `${baseUrl}/${normalizedPath}`;
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <>
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
                  <Input type="file" name="image" />
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
                              <Image src={getImageUrl(item.imageUrl)} alt={item.name} layout="fill" objectFit="cover" className="rounded-md" />
                            </div>
                          )}
                          <p><strong>Category:</strong> {item.category}</p>
                          <p><strong>Color:</strong> {item.color}</p>
                          {item.brand && <p><strong>Brand:</strong> {item.brand}</p>}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>Edit</Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                        </CardFooter>
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

      {/* Edit Item Modal */}
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        setIsModalOpen(isOpen);
        if (!isOpen) {
          setImagePreview(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Clothing Item</DialogTitle>
            <DialogDescription>Make changes to your item here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateItem} className="flex flex-col gap-4 py-4">
            <Input name="name" defaultValue={selectedItem?.name} placeholder="Item Name" required />
             <Select name="category" defaultValue={selectedItem?.category} required>
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
            <Input name="color" defaultValue={selectedItem?.color} placeholder="Color" required />
            <Input name="brand" defaultValue={selectedItem?.brand ?? ''} placeholder="Brand" />
            <Input type="file" name="image" onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImagePreview(URL.createObjectURL(e.target.files[0]));
              }
            }} />
            {imagePreview && <Image src={getImageUrl(imagePreview)} alt="Image Preview" width={100} height={100} />}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
