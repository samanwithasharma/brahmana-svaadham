let cart = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupQuantityControls();
    setupAddToCartButtons();
    setupOrderForm();
    initializeAnimations();
}

function setupQuantityControls() {
    document.querySelectorAll('.quantity-selector').forEach(selector => {
        const minusBtn = selector.querySelector('.minus');
        const plusBtn = selector.querySelector('.plus');
        const input = selector.querySelector('input');

        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(input.value);
            if (currentValue > 1) {
                input.value = currentValue - 1;
            }
        });

        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(input.value);
            if (currentValue < 20) {
                input.value = currentValue + 1;
            }
        });

        input.addEventListener('change', () => {
            if (input.value < 1) input.value = 1;
            if (input.value > 20) input.value = 20;
        });
    });
}

function setupAddToCartButtons() {
    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const productCard = e.target.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const price = parseInt(productCard.querySelector('.price').textContent.match(/\d+/)[0]);
            const quantity = parseInt(productCard.querySelector('.quantity-selector input').value);

            addToCart({
                name: productName,
                price: price,
                quantity: quantity
            });
        });
    });
}

function addToCart(product) {
    const existingItem = cart.find(item => item.name === product.name);
    
    if (existingItem) {
        existingItem.quantity += product.quantity;
    } else {
        cart.push(product);
    }

    updateCartDisplay();
    showNotification(`Added ${product.quantity} ${product.name} to cart`);
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        cartItems.innerHTML += `
            <div class="cart-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${itemTotal}</span>
            </div>
        `;
    });

    cartTotal.textContent = `₹${total}`;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--success-color);
        color: white;
        padding: 1rem;
        border-radius: 5px;
        animation: slideIn 0.3s ease-out;
        z-index: 1000;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function setupOrderForm() {
    const orderForm = document.getElementById('orderForm');
    
    orderForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (cart.length === 0) {
            showNotification('Please add items to cart first');
            return;
        }

        const formData = {
            customerName: this.name.value,
            phoneNumber: this.phone.value,
            email: this.email.value,
            address: this.address.value,
            specialInstructions: this.instructions.value,
            items: cart,
            totalAmount: calculateTotal()
        };

        try {
            showLoadingSpinner();
            
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Order submission failed');

            const result = await response.json();
            
            cart = [];
            updateCartDisplay();
            orderForm.reset();
            
            showNotification('Order placed successfully!');
        } catch (error) {
            showNotification('Failed to place order. Please try again.');
            console.error('Error:', error);
        } finally {
            hideLoadingSpinner();
        }
    });
}

function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function showLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'block';
}

function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.product-card').forEach(card => {
        observer.observe(card);
    });
}