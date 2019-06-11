/**
 * Scrolls to target when user clicks on certain button that is associated with this function.
 * @param {Element} target - the desired location of the page
 */
window.scrollDown = function(target) {
  var scrolldiv = target;
  do { 
      scrolldiv = scrolldiv.parentNode;
      if (!scrolldiv) return;
      scrolldiv.scrollTop += 1;
  } while (scrolldiv.scrollTop == 0);

  var targetY = 0;
  do { 
      if (target == scrolldiv) break;
      targetY += target.offsetTop;
  } while (target = target.offsetParent);

  scroll = function(c, a, b, i) {
      i++; if (i > 30) return;
      c.scrollTop = a + (b - a) / 30 * i;
      setTimeout(function(){ scroll(c, a, b, i); }, 15);
  }
  scroll(scrolldiv, scrolldiv.scrollTop, targetY, 0);
}

/**
 * Round number to 2 decimal places
 * @param {number} num 
 * @returns {number} num rounded to 2 decimal places
 */
function fix(num) {
if (num > 0)
  return Math.floor(num * 100) / 100;
else
  return Math.ceil(num * 100) / 100;
}

/**
 * Set up contentful client
 */
const client = contentful.createClient({
  space: "xt9vmtbix1j4",
  accessToken: "RsEDoFhM4QcMTKVIivC7KyJk_SoVTvmiFow_X88UhQw"
});

/**
 * Initialize constant variables 
 */
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const cartTax = document.getElementById("tax");
const totalPrice = document.getElementById("totalNtax");

/**
 * Initialize empty arrays
 */
let cart = [];
let buttonsDOM = [];

/**
 * Create Product object containing title, price, id, and image. 
 * Get product data from contentful storage.
 */
class Products {
  async getProducts() {
      try {
          let contentful = await client.getEntries({
              content_type: "electronics"
          });
          let products = contentful.items;
          products = products.map(item => {
              const {title, price} = item.fields;
              const {id} = item.sys;
              const image = item.fields.image.fields.file.url;
              return {title, price, id, image};
          });
          return products;
      } catch (error) {
          console.log(error);
      }
  }
}

/**
 * Display products in products-center div and build cart
 */
class UI {
  /**
   * Create product div containing all products from Contentful storage
   * @param {Products} products 
   */
  displayProducts(products) {
      let result = '';
      products.forEach(product => {
        result += `
          <article class="product">
            <div class="img-container">
              <img
                src=${product.image}
                alt="product"
                class="product-img"
              />
              <button class="bag-btn" data-id=${product.id}>
                <i class="fas fa-shopping-cart"></i>
                add to cart
              </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
          </article>
     `;
      });
      productsDOM.innerHTML = result;
    }

    /**
     * Add product to cart when 'Add To Cart' is clicked.
     * Change 'Add To Cart' text to 'In Cart' when item is added to cart.
     * Save cart in local storage, set cart values, display cart with new cart item.
     */
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart) {
                button.innerHTML = "In Cart";
                button.disabled = true;
            } 
              button.addEventListener('click', (event)=> {
                  event.target.innerText = "In Cart";
                  event.target.disabled = true;
                  let cartItem = {...Storage.getProduct(id), amount:1};
                  cart = [...cart,cartItem];
                  Storage.saveCart(cart);
                  this.setCartValues(cart);
                  this.addCartItem(cartItem);
                  this.showCart();
              })
        });
    }

    /**
     * Calculate subtotal, tax, and total amount when new item is added to cart.
     * @param {Element} cart 
     */
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = fix(parseFloat(tempTotal));
        cartItems.innerText = itemsTotal;
        cartTax.innerText = fix(fix(parseFloat(tempTotal)) * 0.10);
        totalNtax.innerText = fix(fix(parseFloat(tempTotal)) + fix((fix(parseFloat(tempTotal)) * 0.10)));
    }

    /**
     * Build cart item div when new item is added to the cart
     * @param {Element} item 
     */
    addCartItem(item) {
      const div = document.createElement("div");
      div.classList.add("cart-item");
      div.innerHTML = `<img src=${item.image} alt="product"/>
      <div>
          <h4>${item.title}</h4>
          <h5>$${item.price}</h5>
          <span class="remove-item" data-id=${item.id}>remove</span>
      </div> 
      <div>
          <i class="fas fa-chevron-up" data-id=${item.id}></i>
          <p class="item-amount">${item.amount}</p>
          <i class="fas fa-chevron-down" data-id=${item.id}></i>
      </div>`;
      cartContent.appendChild(div);
    }

    /**
     * Display cart
     */
    showCart() {
      cartOverlay.classList.add('transparentBcg');
      cartDOM.classList.add("showCart");
    }

    /**
     * Set up cart when user adds new item of clicks shopping cart at top-right corner.
     */
    setupAPP() {
      cart = Storage.getCart();
      this.setCartValues(cart);
      this.populateCart(cart);
      cartBtn.addEventListener('click', this.showCart);
      closeCartBtn.addEventListener('click', this.hideCart);
    }

    /**
     * Populate the cart
     * @param {Element} cart 
     */
    populateCart(cart) {
      cart.forEach(item => this.addCartItem(item));
    }

    /**
     * Hide cart
     */
    hideCart() {
      cartOverlay.classList.remove('transparentBcg');
      cartDOM.classList.remove("showCart");      
    }

    /**
     * Set up functionality for clear cart button, up and down arrows to increase/decrease number of items and prices, and remove button.
     */
    cartLogic() {
      clearCartBtn.addEventListener('click', () => {
        this.clearCart();
      });
      cartContent.addEventListener('click', event => {
        if(event.target.classList.contains('remove-item')) {
          cartContent.removeChild(event.target.parentElement.parentElement);
          this.removeItem(event.target.dataset.id);
        } else if (event.target.classList.contains("fa-chevron-up")) {
          let tempItem = cart.find(item => item.id == event.target.dataset.id);
          tempItem.amount = tempItem.amount + 1;
          Storage.saveCart(cart);
          this.setCartValues(cart);
          event.target.nextElementSibling.innerText = tempItem.amount;
        } else if (event.target.classList.contains("fa-chevron-down")) {
          let tempItem = cart.find(item => item.id === event.target.dataset.id);
          tempItem.amount = tempItem.amount - 1;
          if(tempItem.amount > 0) {
            Storage.saveCart(cart);
            this.setCartValues(cart);
            event.target.previousElementSibling.innerText = tempItem.amount;
          } else {
            cartContent.removeChild(event.target.parentElement.parentElement);
            this.removeItem(event.target.dataset.id);
          }
        }
      });
    }

    /**
     * Remove each item when user clicks clear cart button
     */
    clearCart() {
      let cartItems = cart.map(item => item.id);
      cartItems.forEach(id => this.removeItem(id));
      while(cartContent.children.length > 0) {
        cartContent.removeChild(cartContent.children[0]);
      }
    }

    /**
     * Remove cart item
     * @param {*} id 
     */
    removeItem(id) {
      cart = cart.filter(item => item.id !== id);
      this.setCartValues(cart);
      Storage.saveCart(cart);
      let button = this.getSingleButton(id);
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-shopping-cart"></i>add to cart';
    }

    /**
     * Get buttom 
     * @param {Element} id
     * @returns {Element} button 
     */
    getSingleButton(id) {
      return buttonsDOM.find(button => button.dataset.id === id);
    }
}

class Storage {
  /**
   * Save products to local storage so data stays the same even when user refreshes the webpage
   * @param {Products} products 
   */
  static saveProducts(products) {
      localStorage.setItem("products", JSON.stringify(products));
  }

  /**
   * Get product from JSON data
   * @param {Element} id 
   * @returns {Product} product
   */
  static getProduct(id) {
      let products = JSON.parse(localStorage.getItem('products'));
      return products.find(product => product.id == id);
  }

  /**
   * Save cart to local storage
   * @param {*} cart 
   */
  static saveCart(cart) {
      localStorage.setItem('cart',JSON.stringify(cart));
  }

  /**
   * Get cart
   * @returns JSON array of cart items or empty array
   */
  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}

/**
 * When page loads, display products, create cart, save products in local storage, display PayPal buttons and create PayPal order when user clicks
 * any of the checkout buttons.  
 */
document.addEventListener("DOMContentLoaded", ()=> {
  const ui = new UI();
  const products = new Products();
  ui.setupAPP();
  products.getProducts().then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
  }).then(()=>{
      ui.getBagButtons();
      ui.cartLogic();
  });
});
paypal.Buttons({

createOrder: function(data, actions) {
    return actions.order.create({
        purchase_units: [{
            amount: {
                value: totalNtax.innerText
            }
        }]
    });
},

/**
 * When user finishes making a purchase, display transaction completed alert message,
 * reload page, clear cart, and call server to save the transaction. 
 * @param {*} data 
 * @param {*} actions 
 */
onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
        alert('Transaction completed by ' + details.payer.name.given_name + '!');
        const ui = new UI();
        ui.clearCart();
        return fetch('/paypal-transaction-complete', {
          method: 'post',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            orderID: data.orderID
          })
        });
    }); 
}
}).render('#paypal-button-container');
