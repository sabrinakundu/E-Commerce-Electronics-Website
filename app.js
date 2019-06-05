window.smoothScroll = function(target) {
  var scrollContainer = target;
  do { 
      scrollContainer = scrollContainer.parentNode;
      if (!scrollContainer) return;
      scrollContainer.scrollTop += 1;
  } while (scrollContainer.scrollTop == 0);

  var targetY = 0;
  do { 
      if (target == scrollContainer) break;
      targetY += target.offsetTop;
  } while (target = target.offsetParent);

  scroll = function(c, a, b, i) {
      i++; if (i > 30) return;
      c.scrollTop = a + (b - a) / 30 * i;
      setTimeout(function(){ scroll(c, a, b, i); }, 15);
  }
  scroll(scrollContainer, scrollContainer.scrollTop, targetY, 0);
}
function fix(num) {
if (num > 0)
  return Math.floor(num * 100) / 100;
else
  return Math.ceil(num * 100) / 100;
}

const client = contentful.createClient({
  space: "xt9vmtbix1j4",
  accessToken: "RsEDoFhM4QcMTKVIivC7KyJk_SoVTvmiFow_X88UhQw"
});

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

let cart = [];
let buttonsDOM = [];

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

class UI {
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

    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        //console.log(buttons);
        buttons.forEach(button => {
            let id = button.dataset.id;
            //console.log(id);
            let inCart = cart.find(item => item.id === id);
            if(inCart) {
                button.innerHTML = "In Cart";
                button.disabled = true;
            } 
              button.addEventListener('click', (event)=> {
                  event.target.innerText = "In Cart";
                  event.target.disabled = true;
                  //get product from products
                  let cartItem = {...Storage.getProduct(id), amount:1};
                  //console.log(cartItem);
                  //add product to the cart
                  cart = [...cart,cartItem];
                  //console.log(cart);
                  //save cart in local storage
                  Storage.saveCart(cart);
                  //set cart values
                  this.setCartValues(cart);
                  //display cart item
                  this.addCartItem(cartItem);
                  //show the cart
                  this.showCart();
              })
        });
    }
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
        //console.log(cartTotal, cartItems);
    }
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
      //console.log(cartContent);
    }
    showCart() {
      cartOverlay.classList.add('transparentBcg');
      cartDOM.classList.add("showCart");
    }
    setupAPP() {
      cart = Storage.getCart();
      this.setCartValues(cart);
      this.populateCart(cart);
      cartBtn.addEventListener('click', this.showCart);
      closeCartBtn.addEventListener('click', this.hideCart);
    }
    populateCart(cart) {
      cart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
      cartOverlay.classList.remove('transparentBcg');
      cartDOM.classList.remove("showCart");      
    }
    cartLogic() {
      //clear cart button
      clearCartBtn.addEventListener('click', () => {
        this.clearCart();
      });
      // cart functionality
      cartContent.addEventListener('click', event => {
        //console.log(event.target);
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
    clearCart() {
      let cartItems = cart.map(item => item.id);
      cartItems.forEach(id => this.removeItem(id));
      //console.log(cartContent.children);
      while(cartContent.children.length > 0) {
        cartContent.removeChild(cartContent.children[0]);
      }
    }
    removeItem(id) {
      cart = cart.filter(item => item.id !== id);
      this.setCartValues(cart);
      Storage.saveCart(cart);
      let button = this.getSingleButton(id);
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-shopping-cart"></i>add to cart';
    }
    getSingleButton(id) {
      return buttonsDOM.find(button => button.dataset.id === id);
    }
}

class Storage {
  static saveProducts(products) {
      localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
      let products = JSON.parse(localStorage.getItem('products'));
      return products.find(product => product.id == id);
  }
  static saveCart(cart) {
      localStorage.setItem('cart',JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}

document.addEventListener("DOMContentLoaded", ()=> {
  //get all products
  const ui = new UI();
  const products = new Products();
  //setup app
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

onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
        alert('Transaction completed by ' + details.payer.name.given_name + '!');

        //Call server to save the transaction
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
