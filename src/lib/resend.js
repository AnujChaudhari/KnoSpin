export const sendOrderConfirmationViaResend = async (orderData) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("Resend API key not set. Skipping.");
    return;
  }

  const itemsHtml = orderData.items.map(item => {
    const subtotal = (item.price * item.quantity).toFixed(2);
    return `<tr><td>${item.name} x ${item.quantity}</td><td>₹${subtotal}</td></tr>`;
  }).join('');

  const html = `
    <h2>Order Confirmed! #${orderData.orderId}</h2>
    <p>Hi ${orderData.to_name},</p>
    <p>Your order for ₹${orderData.total} has been placed successfully.</p>
    <h3>Items</h3>
    <table border="1" cellpadding="5">${itemsHtml}</table>
    <p><strong>Shipping Address:</strong><br>
    ${orderData.address_name}, ${orderData.address_phone}<br>
    ${orderData.address_street}, ${orderData.address_city} – ${orderData.address_pincode}</p>
    <p>Track your order in your <a href="https://quickshoppro.vercel.app/dashboard/orders">dashboard</a>.</p>
    <hr>
    <p>📱 <a href="https://wa.me/91${orderData.address_phone}?text=Order%20${orderData.orderId}%20confirmed!%20Total:%20₹${orderData.total}">View on WhatsApp</a></p>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: orderData.to_email,
        subject: `Order Confirmed! #${orderData.orderId}`,
        html: html,
      }),
    });
    if (!res.ok) {
      const error = await res.json();
      console.error("Resend error:", error);
    }
  } catch (err) {
    console.error("Resend send failed:", err);
  }
};
