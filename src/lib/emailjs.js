import emailjs from '@emailjs/browser';

export const sendOrderConfirmation = (orderData) => {
  const itemsHtml = orderData.items.map(item => {
    const subtotal = (item.price * item.quantity).toFixed(2);
    return `<tr>
      <td class="item">${item.name}<br><span class="qty">Qty: ${item.quantity}</span></td>
      <td class="price">₹${item.price} x ${item.quantity} = ₹${subtotal}</td>
    </tr>`;
  }).join('');

  const templateParams = {
    to_email: orderData.email,          // ✅ अब यह मिलेगा
    to_name: orderData.address?.name || 'Customer',
    order_id: orderData.orderId,
    total: orderData.total.toFixed(2),
    items: itemsHtml,
    address_name: orderData.address?.name || '',
    address_phone: orderData.address?.phone || '',
    address_street: orderData.address?.street || '',
    address_city: orderData.address?.city || '',
    address_pincode: orderData.address?.pincode || '',
  };

  return emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    templateParams,
    process.env.NEXT_PUBLIC_EMAILJS_USER_ID
  );
};
