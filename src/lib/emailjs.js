import emailjs from 'emailjs/browser';

export const sendOrderConfirmation = (orderData) => {
  // Build HTML table rows for items
  const itemsHtml = orderData.items.map(item => {
    const subtotal = (item.price * item.quantity).toFixed(2);
    return `<tr>
      <td class="item">${item.name}<br><span class="qty">Qty: ${item.quantity}</span></td>
      <td class="price">₹${item.price} x ${item.quantity} = ₹${subtotal}</td>
    </tr>`;
  }).join('');

  const templateParams = {
    to_email: orderData.email,          // recipient email
    to_name: orderData.name,            // customer name
    order_id: orderData.orderId,        // order number
    total: orderData.total.toFixed(2),  // total with 2 decimals
    items: itemsHtml,                   // HTML string for items (use {{{items}}} in template)
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