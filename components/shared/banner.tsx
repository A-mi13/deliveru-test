"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Container } from "./container";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface BannerProps {
  className?: string;
}

interface Banner {
  id: number;
  imageUrl: string;
  alt: string;
  content?: string;
  link?: string;
}

export const Banner: React.FC<BannerProps> = ({ className }) => {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeContent, setActiveContent] = useState<React.ReactNode | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Загрузка баннеров с сервера
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/banners");
        if (!response.ok) throw new Error("Failed to fetch banners");
        const data = await response.json();
        setBanners(data);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, []);

  const handleImageClick = (banner: Banner) => {
    if (banner.link) {
      router.push(banner.link);
    } else if (banner.content) {
      setActiveContent(banner.content);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveContent(null);
  };

  const closeBanner = () => {
    setIsVisible(false);
  };

  if (!isVisible || banners.length === 0) return null;

  const banner = banners[0]; // Используем первый баннер

  return (
    <div className={cn("", className)}>
      <Container className="flex items-center justify-center px-[19px] relative overflow-hidden">
        <div className="w-[390px] h-[90px] overflow-hidden relative cursor-grab">
          <img
            className="w-[390px] h-[90px] flex-shrink-0"
            src={banner.imageUrl}
            alt={banner.alt}
            onClick={() => handleImageClick(banner)}
          />
        </div>
        <X
          className="absolute top-[9px] right-[30px] w-4 h-4 text-black cursor-pointer"
          onClick={closeBanner}
        />
      </Container>

      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-4 rounded-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-xl font-bold"
              onClick={closeModal}
            >
              &times;
            </button>
            <div className="modal-content">{activeContent}</div>
          </div>
        </div>
      )}
    </div>
  );
};