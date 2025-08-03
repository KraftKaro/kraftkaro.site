// ✅ KraftKaro.js — Final Full Version with Sequential Order ID + Email + Firebase + Razorpay


const cartItemsElement = document.getElementById('cart-items');
const totalPriceElement = document.getElementById('total-price');
const checkoutButton = document.getElementById('checkout');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCartBtn = document.getElementById('close-cart');

let cart = [];
let totalCost = 0;

function addProductToCart(productName, price, stock) {
  const existingProduct = cart.find(item => item.name === productName);
  if (existingProduct) {
    if (existingProduct.quantity < stock) {
      existingProduct.quantity += 1;
      totalCost += price;
    } else {
      alert(`Only ${stock} items available in stock.`);
    }
  } else {
    cart.push({ name: productName, price: price, quantity: 1, stock: stock });
    totalCost += price;
  }
  updateCart();
  cartSidebar.classList.add("open");
}


function updateCart() {
  cartItemsElement.innerHTML = '';
  cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}
      <button class="increment" data-index="${index}">+</button>
      <button class="decrement" data-index="${index}">-</button>
      <button class="remove" data-index="${index}">Remove</button>
      
    `;
    cartItemsElement.appendChild(li);
  });
  totalPriceElement.textContent = `Total: ₹${totalCost}`;

  
    document.querySelectorAll('.increment').forEach(button => {
    button.addEventListener('click', () => {
        const index = button.getAttribute('data-index');
        const item = cart[index];
        if (item.quantity < item.stock) {
            item.quantity += 1;
            totalCost += item.price;
            updateCart();
        } else {
            alert(`Only ${item.stock} items available in stock.`);
        }
    });
});

  

  document.querySelectorAll('.decrement').forEach(button => {
    button.addEventListener('click', () => {
      const index = button.getAttribute('data-index');
      const item = cart[index];
      if (item.quantity > 1) {
        item.quantity -= 1;
        totalCost -= item.price;
      } else {
        totalCost -= item.price * item.quantity;
        cart.splice(index, 1);
      }
      updateCart();
    });
  });

  document.querySelectorAll('.remove').forEach(button => {
    button.addEventListener('click', () => {
      const index = button.getAttribute('data-index');
      const item = cart[index];
      totalCost -= item.price * item.quantity;
      cart.splice(index, 1);
      updateCart();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  
  closeCartBtn.addEventListener("click", () => {
    cartSidebar.classList.remove("open");
  });
function getNextOrderId() {
  return Math.floor(Math.random() * 1000000);
}

  checkoutButton.addEventListener('click', async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const formHtml = `
    <div id="checkout-form-container" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; overflow-y: auto; z-index: 10000;">
      <div style="background-color: #fff; padding: 30px; border-radius: 10px; width: 400px; max-height: 90vh; overflow-y: auto;">
        <h2 style="text-align:center;">Checkout Form</h2>
        <input type="email" id="email" placeholder="Email" required style="width:100%; padding:8px; margin-bottom:10px;"><br>
        <input type="text" id="fullName" placeholder="Full Name" required style="width:100%; padding:8px; margin-bottom:10px;"><br>
        <input type="text" id="address" placeholder="Address" required style="width:100%; padding:8px; margin-bottom:10px;"><br>
        <input type="text" id="landmark" placeholder="Landmark" required style="width:100%; padding:8px; margin-bottom:10px;"><br>
        <input type="text" id="city" placeholder="City" required style="width:100%; padding:8px; margin-bottom:10px;"><br>
        <input type="text" id="state" placeholder="State" required style="width:100%; padding:8px; margin-bottom:10px;"><br>
        <input type="text" id="pinCode" placeholder="PIN Code" required style="width:100%; padding:8px; margin-bottom:10px;"><br>
        <input type="text" id="phoneNumber" placeholder="Phone Number" required style="width:100%; padding:8px; margin-bottom:10px;"><br>
        <button id="pay-now" style="width:100%; background-color:#2ecc71; color:#fff; padding:10px; border:none; border-radius:5px;">Pay Now</button>
        <button id="close-form" style="width:100%; background-color:#e74c3c; color:#fff; padding:10px; margin-top:10px; border:none; border-radius:5px;">Close</button>
      </div>
    </div>`;

    const formContainer = document.createElement('div');
    formContainer.innerHTML = formHtml;
    document.body.appendChild(formContainer);

    document.getElementById('close-form').addEventListener('click', () => {
      formContainer.remove();
    });

    document.getElementById('pay-now').addEventListener('click', async () => {
      const email = document.getElementById('email').value;
      const fullName = document.getElementById('fullName').value;
      const address = document.getElementById('address').value;
      const landmark = document.getElementById('landmark').value;
      const city = document.getElementById('city').value;
      const state = document.getElementById('state').value;
      const pinCode = document.getElementById('pinCode').value;
      const phoneNumber = document.getElementById('phoneNumber').value;

      if (!email || !fullName || !address || !landmark || !city || !state || !pinCode || !phoneNumber) {
        alert("Please fill all fields.");
        return;
      }

      const rawId = await getNextOrderId();
      const paddedId = String(rawId).padStart(3, '0');
      const orderId = `#kraft_${paddedId}`;

      const options = {
        key: "rzp_live_YY9Xja0VlwtIbI",
        amount: totalCost * 100,
        currency: "INR",
        name: "KraftKaro",
        description: `Order ${orderId}`,

        handler: function (response) {
          console.log("✅ Payment Successful. Payment ID:", response.razorpay_payment_id);
          const orderData = {
            name: fullName,
            email,
            address,
            landmark,
            city,
            state,
            pinCode,
            phoneNumber,
            cart,
            total: `₹${totalCost}`,
            paymentId: response.razorpay_payment_id,
            orderId: orderId,
            status: "Paid",
            date: new Date().toLocaleString()
          };

          saveOrderToFirebase(orderData);
           window.location.href = "thankyou.html";

        },
        prefill: {
          name: fullName,
          email: email,
          contact: phoneNumber
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        },
        theme: {
          color: "#f26b3a"
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    });
  });
});
// Initialize Firebase (agar already initialized nahi kiya to)
const firebaseConfig = {
    apiKey: "AIzaSyAcqAWckOIAxThQcrn5YxG2Z2G97-o6CRQ",
    authDomain: "kraftkaro-orders.firebaseapp.com",
    databaseURL: "https://kraftkaro-orders-default-rtdb.firebaseio.com",
    projectId: "kraftkaro-orders",
    storageBucket: "kraftkaro-orders.firebasestorage.app",
    messagingSenderId: "458718582224",
    appId: "1:458718582224:web:40a1d5e8745994159655d5"
  };

firebase.initializeApp(firebaseConfig);

// Reference to Realtime Database
const dbRef = firebase.database().ref('products');

// Fetch and Display Products
dbRef.on('value', (snapshot) => {
    const products = snapshot.val();
    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = ''; // Clear old products

    for (let key in products) {
        const product = products[key];
        const productCard = document.createElement('div');
        productCard.className = 'product';

       productCard.innerHTML = `
    <div class="product-img-wrapper">
        <img src="${product.image}" alt="${product.name}" class="product-img">
        ${product.quantity === 0 ? '<div class="sold-out">SOLD OUT</div>' : ''}
    </div>
    <h3>${product.name}</h3>
    <p>Price: ₹${product.price}</p>
    <p class="stock">Available: ${product.quantity}</p>

    <button class="add-to-cart" ${product.quantity === 0 ? 'disabled' : ''}>Add to Cart</button>
`;

        productContainer.appendChild(productCard);
    }
    
    productContainer.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const product = button.closest('.product');
        const productName = product.querySelector('h3').textContent;
        const priceText = product.querySelector('p').textContent;
        const stockText = product.querySelector('.stock').textContent;

        const price = parseInt(priceText.replace(/[^0-9]/g, ''));
        const stock = parseInt(stockText.replace(/[^0-9]/g, ''));

        const existingProduct = cart.find(item => item.name === productName);

        if (existingProduct && existingProduct.quantity >= stock) {
            alert(`Only ${stock} items available in stock.`);
            return;
        }

        addProductToCart(productName, price, stock);
    });
});
});
// 🔍 Search Bar Functionality
document.getElementById('search-bar').addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  const products = document.querySelectorAll('.product');

  products.forEach(product => {
    const productName = product.querySelector('h3').textContent.toLowerCase();
    if (productName.includes(searchTerm)) {
      product.style.display = 'block';
    } else {
      product.style.display = 'none';
    }
  });
});

setTimeout(() => {
        document.querySelectorAll('.product').forEach(productCard => {
            const button = productCard.querySelector('button');
            const wrapper = productCard.querySelector('.product-img-wrapper');
            if (button && button.disabled && !productCard.querySelector('.sold-out')) {
                const soldOutDiv = document.createElement('div');
                soldOutDiv.className = 'sold-out';
                soldOutDiv.innerText = 'SOLD OUT';
                wrapper.appendChild(soldOutDiv);
            }
        });
    }, 500);  // slight delay to ensure DOM rendered

// Image Zoom Modal Functionality
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('product-img')) {
    const modal = document.getElementById('modal'); // yahan "modal" id use karni hai
    const modalImg = document.getElementById('modal-img');
    modal.style.display = "block";
    modalImg.src = event.target.src;
  }
});

// Close Modal on Close Button Click
document.querySelector('.close').addEventListener('click', function() {
  document.getElementById('modal').style.display = "none";
});

// Close Modal on Outside Click
window.addEventListener('click', function(event) {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    modal.style.display = "none";
  }
});
function saveOrderToFirebase(orderData) {
  const ordersRef = firebase.database().ref('orders');
  const newOrderRef = ordersRef.push();
  newOrderRef.set(orderData)
    .then(() => {
      console.log("✅ Order saved to Firebase Database");
    })
    .catch((error) => {
      console.error("❌ Error saving order to Firebase:", error);
    });
}
