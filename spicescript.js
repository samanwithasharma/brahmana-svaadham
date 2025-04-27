document.addEventListener('DOMContentLoaded', function() {
    initializeImageSlider();
    setupCartFunctionality();
    setupCheckoutProcess();
});

function initializeImageSlider() {
    const images = [
        'sambar-powder.jpg',
        'rasam-powder.jpg',
        'bb-powder.jpg',
        'chutney-powder.jpg',
        'pappu-powder.jpg'
    ];

    const slider = document.querySelector('.image-slider');
    
    // Create duplicate images for infinite scroll
    images.forEach(image => {
        const img = document.createElement('img');
        img.src = `images/${image}`;
        img.alt = 'Spice Powder';
        slider.appendChild(img);
    });

    let position = 0;
    const slideWidth = slider.firstElementChild.clientWidth;

    function slide() {
        position -= 1;
        slider.style.transform = `translateX(${position}px)`;

        if (Math.abs(position) >= slideWidth) {
            position = 0;
            slider.style.transform = `translateX(${position}px)`;
        }

        requestAnimationFrame(slide);
    }

    slide();
}

let cart = [];

function setupCartFunctionality() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartIcon = document.querySelector('.cart-icon');
    const cartSection = document.getElementById('cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const productCard = e.target.closest('.product-card');
            const productId = productCard.dataset.id;
            const productName = productCard.querySelector('h3').textContent;
            const price = 500; // Fixed price for all products

            addToCart(productId, productName, price);
            updateCartDisplay();
            showNotification(`Added ${productName} to cart`);
        });
    });

    cartIcon.addEventListener('click', () => {
        cartSection.classList.toggle('hidden');
        document.getElementById('checkout').classList.add('hidden');
    });
}

function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            price,
            quantity: 1
        });
    }

    updateCartCount();
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const totalAmount = document.getElementById('totalAmount');
    
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        cartItems.innerHTML += `
            <div class="cart-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${itemTotal}</span>
                <button onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
        `;
    });

    totalAmount.textContent = `₹${total}`;
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
    updateCartCount();
}

function setupCheckoutProcess() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const orderForm = document.getElementById('orderForm');

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('Cart is empty!');
            return;
        }
        
        document.getElementById('cart').classList.add('hidden');
        document.getElementById('checkout').classList.remove('hidden');
    });

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            customerName: e.target.name.value,
            email: e.target.email.value,
            phone: e.target.phone.value,
            address: e.target.address.value,
            items: cart,
            totalAmount: calculateTotal()
        };

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Order failed');

            showNotification('Order placed successfully!');
            cart = [];
            updateCartCount();
            updateCartDisplay();
            orderForm.reset();
            document.getElementById('checkout').classList.add('hidden');

        } catch (error) {
            showNotification('Failed to place order. Please try again.');
            console.error('Error:', error);
        }
    });
}

function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--primary-color);
        color: white;
        padding: 1rem;
        border-radius: 5px;
        animation: slideIn 0.3s ease-out;
        z-index: 1001;
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}