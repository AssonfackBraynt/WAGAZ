
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

// Product category can be "gas", "oil", "snack", "drink", etc.
const productCategories = [
  { value: "gas", label: "Gas" },
  { value: "oil", label: "Oil" },
  { value: "snack", label: "Snack" },
  { value: "drink", label: "Drink" },
  { value: "service", label: "Service" },
  { value: "other", label: "Other" }
];

type NewProductDialogProps = {
  onAdd: (product: { name: string; category: string; amount: number; unitPrice: number }) => void;
};

const NewProductDialog: React.FC<NewProductDialogProps> = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("gas");
  const [amount, setAmount] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !category) return;
    onAdd({ name, category, amount, unitPrice });
    setName("");
    setCategory("gas");
    setAmount(1);
    setUnitPrice(0);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 font-medium">
          <Plus className="w-4 h-4" />
          New Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Enter details for the new product.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="prod-name">Product Name</Label>
            <Input id="prod-name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="prod-category">Category</Label>
            <select
              id="prod-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-border rounded focus:outline-none"
              required
            >
              {productCategories.map(cat => (
                <option value={cat.value} key={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="prod-amount">Amount</Label>
            <Input
              id="prod-amount"
              type="number"
              min={1}
              value={amount}
              onChange={e => setAmount(parseInt(e.target.value, 10) || 1)}
              required
            />
          </div>
          <div>
            <Label htmlFor="prod-unit-price">Unit Price</Label>
            <Input
              id="prod-unit-price"
              type="number"
              min={0}
              value={unitPrice}
              onChange={e => setUnitPrice(parseInt(e.target.value, 10) || 0)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-1" />
              Add Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewProductDialog;
