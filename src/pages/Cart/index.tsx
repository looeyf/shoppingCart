import { Link } from "react-router-dom";
import { MdDelete, MdAddCircleOutline, MdRemoveCircleOutline } from "react-icons/md";

import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";
import { Container, EmptyCart, ProductTable, Total } from "./styles";

interface Product {
  productId: number;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map((product) => {
    return {
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      amount: product.amount,
      priceFormatted: formatPrice(product.price),
      subTotal: formatPrice(product.price * product.amount),
    };
  });

  const total = formatPrice(
    cart.reduce((sumTotal, product) => {
      sumTotal += product.price * product.amount;
      return sumTotal;
    }, 0)
  );

  function handleProductIncrement(product: Product) {
    updateProductAmount({
      ...product,
      amount: product.amount + 1,
    });
  }

  function handleProductDecrement(product: Product) {
    updateProductAmount({
      ...product,
      amount: product.amount - 1,
    });
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      {cartFormatted.length > 0 ? (
        <>
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
                            })
                          }
                        >
                          <MdAddCircleOutline size={20} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <strong>{cartProduct.subTotal}</strong>
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
        </>
      ) : (
        <EmptyCart>
          <p>Seu carrinho está vazio!</p>
          <Link to="/">
            <button>Voltar às compras</button>
          </Link>
        </EmptyCart>
      )}
    </Container>
  );
};

export default Cart;
