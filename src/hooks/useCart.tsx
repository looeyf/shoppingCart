import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
  type: "increase" | "decrease";
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount, type }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const { data: fetchProductData } = await api.get(`/products/${productId}`);
      const { data: fetchProductStock } = await api.get(`/stock/${productId}`);
      let newCart: Product[];

      if (fetchProductStock.amount > 0) {
        await api.put(`/stock/${productId}`, {
          id: productId,
          amount: fetchProductStock.amount - 1,
        });

        const foundCartItem = cart.some((item) => item.id === productId);
        if (!foundCartItem) {
          newCart = [
            ...cart,
            {
              id: fetchProductData.id,
              title: fetchProductData.title,
              price: fetchProductData.price,
              image: fetchProductData.image,
              amount: 1,
            },
          ];
        } else {
          newCart = cart.map((item) => {
            if (item.id === productId) {
              return {
                ...item,
                amount: item.amount + 1,
              };
            } else {
              return { ...item };
            }
          });
        }

        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
        toast.success("Produto adicionado ao carrinho!");
      } else {
        toast.error("Quantidade solicitada fora de estoque");
      }
    } catch {
      // TODO
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      // TODO
      const productExistsInCart = cart.some((item) => item.id === productId);
      if (productExistsInCart) {
        const { data: fetchProductStock } = await api.get(`/stock/${productId}`);
        const productToRemove = cart.filter((item) => item.id === productId);
        const newCart = cart.filter((item) => item.id !== productId);

        await api.put(`/stock/${productId}`, {
          id: productId,
          amount: fetchProductStock.amount + productToRemove[0].amount,
        });

        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
        toast.success("Produto removido com sucesso!");
      } else {
        throw new Error();
      }
    } catch {
      // TODO
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({ productId, amount, type }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount <= 0) {
        throw new Error();
      } else {
        const { data: fetchProductStock } = await api.get(`/stock/${productId}`);

        if (type === "increase") {
          if (fetchProductStock.amount > 0) {
            await api.put(`/stock/${productId}`, {
              id: productId,
              amount: fetchProductStock.amount - 1,
            });
            const newCart = cart.map((item) =>
              item.id === productId
                ? {
                    ...item,
                    amount: amount + 1,
                  }
                : item
            );

            setCart(newCart);
            localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
            toast.success("Quantidade alterada com sucesso.");
          } else {
            toast.error("Quantidade solicitada fora de estoque");
          }
        } else {
          await api.put(`/stock/${productId}`, {
            id: productId,
            amount: fetchProductStock.amount + amount,
          });
          const newCart = cart.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  amount: amount - 1,
                }
              : item
          );

          setCart(newCart);
          localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
          toast.success("Quantidade alterada com sucesso.");
        }
      }
    } catch {
      // TODO
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider value={{ cart, addProduct, removeProduct, updateProductAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
