import { useState, useEffect } from "react";
import { MdDelete, MdAddCircleOutline, MdRemoveCircleOutline } from "react-icons/md";

import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";
import { Container, ProductTable, Total } from "./styles";

interface Product {
  productId: number;
  amount: number;
  type: "increase" | "decrease";
}

interface CartFormatted {
  id: number;
  title: string;
  image: string;
  price: number;
  amount: number;
  priceFormatted: string;
  subTotal: string;
}

const Cart = (): JSX.Element => {
  const [cartFormatted, setCartFormatted] = useState<CartFormatted[]>([]);
  const [total, setTotal] = useState(formatPrice(0));
  const { cart, removeProduct, updateProductAmount } = useCart();

  useEffect(() => {
    setCartFormatted(
      cart.map((product) => {
        return {
          id: product.id,
          title: product.title,
          image: product.image,
          price: product.price,
          amount: product.amount,
          priceFormatted: formatPrice(product.price),
          subTotal: formatPrice(product.price * product.amount),
        };
      })
    );

    setTotal(
      formatPrice(
        cart.reduce((sumTotal, product) => {
          sumTotal += product.price;
          return sumTotal;
        }, 0)
      )
    );
  }, [cart]);

  function handleProductIncrement(product: Product) {
    updateProductAmount(product);
  }

  function handleProductDecrement(product: Product) {
    updateProductAmount(product);
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map((cartProduct) => {
            return (
              <tr key={cartProduct.id} data-testid="product">
                <td>
                  <img src={cartProduct.image} alt={cartProduct.title} />
                </td>
                <td>
                  <strong>{cartProduct.title}</strong>
                  <span>{cartProduct.priceFormatted}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      disabled={cartProduct.amount <= 1}
                      onClick={() =>
                        handleProductDecrement({
                          productId: cartProduct.id,
                          amount: cartProduct.amount,
                          type: "decrease",
                        })
                      }
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={cartProduct.amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      onClick={() =>
                        handleProductIncrement({
                          productId: cartProduct.id,
                          amount: cartProduct.amount,
                          type: "increase",
                        })
                      }
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>R$ 359,80</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    onClick={() => handleRemoveProduct(cartProduct.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
