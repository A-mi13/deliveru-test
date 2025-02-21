"use client";
import React, { useState } from "react";
import { XIcon } from "lucide-react";
import ProductModal from "./ProductModal";
import { useCart } from "./CartContext";

interface Product {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SearchModalProps {
  onClose: () => void;
}

const fetchSearchResults = async (query: string): Promise<Product[]> => {
  const response = await fetch(`/api/products/search?query=${query}`);
  if (!response.ok) throw new Error("Error fetching search results");
  return response.json();
};

const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart, cart } = useCart(); // Доступ к корзине

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    if (value) {
      fetchSearchResults(value).then(setResults).catch(console.error);
    } else {
      setResults([]);
    }
  };

  return (
    <>
      <div className="fixed max-w-[480px] inset-0 bg-white z-40 flex flex-col items-center pt-6 mx-auto px-3">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#70B9BE]">
          <XIcon size={28} />
        </button>
        <input
          type="text"
          placeholder="Поиск товаров..."
          className="w-full max-w-[480px] mt-12 p-4 border-2 border-[#70B9BE] rounded-lg text-center"
          autoFocus
          value={query}
          onChange={handleInputChange}
        />
        <div className="mt-4 w-full max-w-lg">
          {results.map((product) => (
            <button
              key={product.id}
              className="flex items-center gap-3 w-full px-3 py-2"
              onClick={() => setSelectedProduct(product)}
            >
              <img className="h-8 w-8 rounded-sm" src={product.imageUrl} alt={product.name} />
              <span>{product.name}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          cart={cart} // Передаем текущую корзину
          handleAddToCart={addToCart} // Функция добавления в корзину
        />
      )}
    </>
  );
};

export default SearchModal;
