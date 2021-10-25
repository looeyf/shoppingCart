import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
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
      const { data: fetchProductStock } = await api.get<Stock>(`/stock/${productId}`);
      let newCart: Product[];

      const findProductIndex = cart.findIndex((item) => item.id === productId);
      if (findProductIndex !== -1) {
        if (fetchProductStock.amount < cart[findProductIndex].amount + 1) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        }
      } else {
        if (fetchProductStock.amount < 1) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        }
      }

      const foundCartItem = cart.some((item) => item.id === productId);
      if (!foundCartItem) {
        newCart = [
          ...cart,
          {
            ...fetchProductData,
            amount: 1,
          },
        ];
      } else {
        newCart = cart.map((item) =>
          item.id === productId
            ? {
                ...item,
                amount: item.amount + 1,
              }
            : item
        );
      }

      setCart(newCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      toast.success("Produto adicionado ao carrinho!");
    } catch {
      // TODO
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const productExistsInCart = cart.some((item) => item.id === productId);
      if (productExistsInCart) {
        const newCart = cart.filter((item) => item.id !== productId);

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

  const updateProductAmount = async ({ productId, amount }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount <= 0) {
        throw new Error();
      } else {
        const { data: fetchProductStock } = await api.get<Stock>(`/stock/${productId}`);

        if (fetchProductStock.amount >= amount) {
          const newCart = cart.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  amount,
                }
              : item
          );

          setCart(newCart);
          localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
          toast.success("Quantidade alterada com sucesso.");
        } else {
          toast.error("Quantidade solicitada fora de estoque");
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
