import { prisma } from "@/prisma/prisma-client";

export async function getServerSideProps(context: any) {
  const userId = 1; // Захардкоженный userId

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productItem: {
              include: { product: true },
            },
          },
        },
      },
    });

    console.log("Cart from DB:", cart);

    if (!cart) {
      return {
        props: {
          initialCart: [],
        },
      };
    }

    const items = cart.items.map((item) => ({
      productItemId: item.productItemId,
      quantity: item.quantity,
      productItem: {
        id: item.productItem.id,
        price: item.productItem.price, // ✅ Берем цену вариации
      },
      product: {
        id: item.productItem.product.id,
        name: item.productItem.product.name,
        imageUrl: item.productItem.product.imageUrl,
        categoryId: item.productItem.product.categoryId,
      },
    }));

    console.log("Initial cart for props:", items);

    return {
      props: {
        initialCart: items,
      },
    };
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return {
      props: {
        initialCart: [],
      },
    };
  }
}