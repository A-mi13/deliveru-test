"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { useRouter } from "next/navigation";

interface Card {
  id: number;
  imageUrl: string;
  alt: string;
  content: string;
  link?: string;
}

interface Props {
  className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeContent, setActiveContent] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCards() {
      try {
        const response = await fetch("/api/cards");
        const data = await response.json();

        if (Array.isArray(data)) {
          setCards(data);
        } else {
          console.error("Ожидался массив, но получено:", data);
          setCards([]);
        }
      } catch (error) {
        console.error("Ошибка загрузки карточек:", error);
      }
    }
    fetchCards();
  }, []);

  const handleImageClick = (card: Card) => {
    if (card.link) {
      router.push(card.link);
    } else {
      setActiveContent(card.content);
      setIsModalOpen(true);
    }
  };

  return (
    <header className={cn("", className)}>
      <Container className="flex items-center justify-center py-[17px] px-[20px]">
        <div className="w-full h-[130px] overflow-x-auto whitespace-nowrap scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-scrollbar]:hidden">
          {Array.isArray(cards) && cards.length > 0 ? (
            cards.map((card) => (
              <img
                key={card.id}
                className="w-90 h-130 inline-block mr-2 cursor-pointer"
                src={card.imageUrl}
                alt={card.alt}
                onClick={() => handleImageClick(card)}
              />
            ))
          ) : null}
        </div>
      </Container>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-4 rounded-md relative">
            <button className="absolute top-2 right-2 text-xl font-bold" onClick={() => setIsModalOpen(false)}>
              &times;
            </button>
            <div className="modal-content">{activeContent}</div>
          </div>
        </div>
      )}
    </header>
  );
};
