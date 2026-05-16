import { useCart } from "@/context/CartContext";
import { HiMinus, HiPlus, HiTrash } from "react-icons/hi";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="card flex items-center gap-4">
      <img src={item.image} className="w-20 h-20 object-cover rounded-lg" />
      <div className="flex-grow">
        <h4 className="font-semibold">{item.name}</h4>
        <p className="text-primary-600 font-bold">₹{item.price}</p>
        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1} className="p-1 border rounded"><HiMinus /></button>
          <span>{item.quantity}</span>
          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 border rounded"><HiPlus /></button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold">₹{item.price * item.quantity}</p>
        <button onClick={() => removeFromCart(item.productId)} className="text-red-500 mt-2"><HiTrash /></button>
      </div>
    </div>
  );
}