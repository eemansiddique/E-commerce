$(document).on("turbolinks:load", function () {
    setTimeout(function () {
      $(".alert").fadeOut();
    }, 3000);
  });
  
  $("#add-edit").validate({
    errorClass: "error fail-alert",
    //  validClass: "valid success-alert",
  
    rules: {
      title: {
        required: true,
        minlength: 5,
      },
      category: {
        required: true,
      },
      price: {
        required: true,
      },
      description: {
        required: true,
      },
      image: {
        extension: "jpg|jpeg|png|ico|bmp",
      },
      banner: {
        required: true,
        extension: "jpg|jpeg|png|ico|bmp",
      },
    },
    messages: {
      title: {
        required: "Add a title",
        minlength: "Title should be at least 5 characters",
      },
  
      category: {
        required: "Select a category",
      },
      price: {
        required: "Add its price",
      },
      description: {
        required: "Add description",
      },
      image: {
        extension:
          "Please upload file in these format only (jpg, jpeg, png, ico, bmp).",
      },
      banner: {
        required: "Select an image",
        extension:
          "Please upload file in these format only (jpg, jpeg, png, ico, bmp).",
      },
    },
  });
  
  $("#user-signup-form").validate({
    errorClass: "error fail-alert",
  
    rules: {
      name: {
        required: true,
        minlength: 4,
      },
      email: {
        required: true,
        email: true,
      },
      contact: {
        minlength: 10,
        maxlength:10,
        required: true,
        number: true,
      },
      password: {
        required: true,
        minlength: 6,
      },
      cpassword: {
        required: true,
        minlength: 6,
        equalTo: "#password",
      },
    },
    messages: {
      name: {
        required: "Please enter your name.",
        minlength: "Name should be at least 4 characters.",
      },
      contact: {
        required: "Please enter your Mobile no.",
      },
      email: {
        required: "Please enter your email.",
        email: "The email should be in the format: abc@domain.tld",
      },
      password: {
        required: "Please enter your Password.",
        minlength: "Password should be at least 6 characters.",
      },
      cpassword: {
        required: "Re-enter your Password.",
        equalTo: "Password is not matching!",
      },
    },
  });
  
  $("#user-login-form").validate({
    errorClass: "error fail-alert",
  
    rules: {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
      },
    },
    messages: {
      email: {
        required: "Please enter your email.",
        email: "The email should be in the format: abc@domain.tld",
      },
      password: {
        required: "Please enter your Password.",
      },
    },
  });
  
  $("#admin-login-form").validate({
    errorClass: "error fail-alert",
  
    rules: {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
      },
    },
    messages: {
      email: {
        required: "Please enter your email.",
        email: "The email should be in the format: abc@domain.tld",
      },
      password: {
        required: "Please enter your Password.",
      },
    },
  });
  
  $("#password").validate({
    errorClass: "error fail-alert",
  
    rules: {
      password: {
        required: true,
        minlength: 6,
      },
      npassword: {
        required: true,
        minlength: 6,
      },
      cpassword: {
        required: true,
        minlength: 6,
        equalTo: "#cpassword",
      },
    },
    messages: {
      password: {
        required: "Please enter your Password.",
        minlength: "Password should be at least 6 characters.",
      },
      npassword: {
        required: "Please enter your Password.",
        minlength: "Password should be at least 6 characters.",
      },
      cpassword: {
        required: "Re-enter your Password.",
        equalTo: "Password is not matching!",
      },
    },
  });
  $("#otp-form").validate({
    errorClass: "error fail-alert",
  
    rules: {
      otp: {
        required: true,
        minlength: 6,
        maxlength: 6,
      },
    },
    messages: {
      otp: {
        required: "Please enter your OTP.",
        minlength: "OTP should be  6 numbers.",
        maxlength: "OTP should be  6 numbers.",
      },
    },
  });
  $("#email-form").validate({
    errorClass: "error fail-alert",
  
    rules: {
      email: {
        required: true,
        email: true,
      },
    },
    messages: {
      email: {
        required: "Please enter your email.",
        email: "Please enter valid email",
      },
    },
  });
  
  $("#add-address").validate({
    errorClass: "error fail-alert",
    rules: {
      name: {
        required: true,
        minlength: 4,
      },
      housename: {
        required: true,
        minlength: 4,
      },
      pin: {
        required: true,
        minlength: 6,
      },
      contact: {
        required: true,
        minlength: 10,
        maxlength: 10,
      },
      district: {
        required: true,
      },
    },
    messages: {
      name: {
        required: "Enter a name",
        minlength: "Name should be at least 4 characters.",
      },
      housename: {
        required: "Enter housename",
        minlength: "Housename should be at least 4 characters.",
      },
      pin: {
        required: "Enter pincode",
        minlength: "Enter a valid pin",
      },
      contact: {
        required: "Enter contact number",
        minlength: "Contact should be 10 digits",
        maxlength: "Contact should be 10 digits",
      },
      district: {
        required: "Choose district",
      },
    },
  });
  //
  
  $("#confirmDeletion").click(function () {
    confirm("Are you sure?");
  });
  
  let searchForm = document.querySelector(".header .search-form");
  
  document.querySelector("#search-btn").onclick = () => {
    searchForm.classList.toggle("active");
    navbar.classList.remove("active");
  };
  
  let navbar = document.querySelector(".header .navbar");
  
  var container = $("#search-results");
  document.querySelector("#menu-btn").onclick = () => {
    navbar.classList.toggle("active");
    searchForm.classList.remove("active");
  };
  $(document).click(function () {
    var search = $(".header .search-form");
  
    if (!container.is(event.target) && !container.has(event.target).length) {
      container.hide();
    }
  });
  
  let slides = document.querySelectorAll(".home .slide");
  let index = 0;
  
  function next() {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }
  
  function prev() {
    slides[index].classList.remove("active");
    index = (index - 1 + slides.length) % slides.length;
    slides[index].classList.add("active");
  }
  
  function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $("#img-prvw").attr("src", e.target.result).width(100).height(100);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
  
  $("#image").change(function () {
    readURL(this);
  });
  function editProfile() {
    $("#edit-profile").toggleClass("hide");
  }
  function addAddress() {
    $("#add-address").toggleClass("hide");
  }
  function editAddress(index) {
    $("#edit-address-" + index).toggleClass("hide");
  }
  
  if ($("[data-fancybox]").length) {
    $("[data-fancybox]").fancybox();
  }

  // Get the modal
var modal = document.getElementById("id01");

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};



document.addEventListener("DOMContentLoaded", function (event) {});

//me set
//from product page click the wishlist button product added to wishlist page
function addToWishlist(proId) {
  $("#" + proId + "-heart").toggleClass("fa-like");

  $.ajax({
    url: "/wishlist/add/" + proId,
    method: "get",
    success: (response) => {
      if (response.status) {
        if (response.item == "added") {
          $("#" + proId + "-heart").css({ color: "red", background: "white" });
        } else {
          $("#" + proId + "-heart").css({ color: "white" });
        }
        location.reload();
      } else {
        location.href = "/login";
      }
    },
  });
}


//click the cross icon from the wishlist page ,product remove from wishlist page
function removeFromWishlist(proId) {
  $.ajax({
    url: "/wishlist/delete/" + proId,
    method: "get",
    success: (response) => {
      if (response.status) {
        //  let count =  $("#cart-count").html();
        //  count = parseInt(count)-1 ;
        //   $('#cart-count').html(count);
        location.reload();
      }
    },
  });
}
  
//click cart button product added to cart
function addToCart(proId, wt) {
  $.ajax({
    url: "/cart/add/" + proId,
    method: "get",
    success: (response) => {
      if (response.status) {
        console.log("succ");
        location.reload();
      } else {
        console.log("no user");
        location.href = "/login";
      }
    },
  });
}
//get products type category
function getProducts() {
  let category = $("#categoryFilter").val();
  let sort = $("#sort").val();
  console.log(sort + " sort");
  $.ajax({
    url: "/products/" + category,
    method: "get",
    data: {
      sort: sort,
    },
    success: (response) => {
      console.log("response got");
      // if (response.status) {
      //   console.log('response true');
      if (category == "All") {
        location.href = "/products";
      } else if (category == "vegan") {
        location.href = "products/vegan";
      } else {
        location.href = "/products/" + category;
      }
      // }
    },
  });
}
//cart page quantity changing time amount also changed
function getPrice(proId, proprice, cartprice, wt) {
  let qty = $("#qtyOf" + proId).text();

  $.ajax({
    url: "/cart/change-weight",
    data: {
      proId: proId,
      proprice: proprice,
      cartprice,
      cartprice,
      wt: wt,
      qty: qty,
    },
    method: "post",
    success: (response) => {
      if (response.status) {
        location.reload();
        
      }
      
    },
  });
}

function changeQuantity(proId, wt, price, count) {
  let qty = $("#qtyOf" + proId).text();

  $.ajax({
    url: "/cart/change-quantity",
    data: {
      proId: proId,
      wt: wt,
      price: price,
      count: count,
      qty: parseInt(qty),
    },
    method: "post",
    success: (response) => {
      // if(response.status){
      console.log(response);

      location.reload();
    },
  });
}
//click cross button from cart page,delete from cart
function removeFromCart(proId, wt) {
  $.ajax({
    url: "/cart/delete/" + proId + "/" + wt,
    method: "get",
    success: (response) => {
      if (response.status) {
        location.reload();
      }
    },
  });
}

function addAddress() {
  $("#add-address").toggleClass("hide");
}

function selectAddress(addressIndex) {
  $.ajax({
    url: "/cart/place-order/select-address",
    method: "post",
    data: {
      addressIndex: addressIndex,
    },
    success: (response) => {
      if (response.status) {
        location.reload();
        console.log(response);
      }
    },
  });
}

$("#payment-form").validate({
  errorClass: "error fail-alert",
  rules: {
    payment: {
      required: true,
    },
  },
  messges: {
    payment: {
      required: "Select payment method",
    },
  },
  errorPlacement: function (error, element) {
    if (element.is(":radio")) {
      error.insertBefore($(element).parents(".pay-form"));
    } else {
      // This is the default behavior
      error.insertAfter(element);
    }
  },
});

function verifyPayment(payment, order) {
  $.ajax({
    url: "/cart/verify-payment",
    data: {
      payment,
      order,
    },
    method: "post",
    success: (response) => {
      if (response.status) {
        location.href = "/cart/place-order/success";
      }
    },
  });
}

$("#payment-form").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/cart/payment",
    method: "post",
    data: $("#payment-form").serialize(),
    success: (response) => {
      // alert(response)
      if (response.codStatus == "placed") {
        console.log(response);
        console.log(response.status);

        location.href = "/cart/place-order/success";
      } else {
        console.log(response + "response");
        razorpayPayment(response);
      }
    },
  });
});

//get categorywise filter 

function getProducts() {
  let category = $("#categoryFilter").val();
  let sort = $("#sort").val();
  console.log(sort + " sort");
  $.ajax({
    url: "/products/" + category,
    method: "get",
    data: {
      sort: sort,
    },
    success: (response) => {
      console.log("response got");
      // if (response.status) {
      //   console.log('response true');
      if (category == "All") {
        location.href = "/products";
      } else if (category == "vegan") {
        location.href = "products/vegan";
      } else {
        location.href = "/products/" + category;
      }
      // }
    },
  });
}

//fiter products
function sendData(e) {
  const searchResults = document.getElementById("search-results");
  let match = e.value.match(/^[a-zA-Z ]*/);
  let match2 = e.value.match(/\s*/);
  if (match2[0] === e.value) {
    searchResults.innerHTML = "";
    return;
  }
  if (match[0] === e.value) {
    $.ajax({
      url: "/search",
      method: "post",
      data: {
        payload: e.value,
      },
      success: (response) => {
        let payload = response.payload;
        searchResults.style.display = "block";
        searchResults.html = "";
        if (payload.length < 1) {
          searchResults.innerHTML = "No Product";
          return;
        }
        payload.forEach((element, index) => {
          if (index > 0) searchResults.innerHTML = "<hr>";
          searchResults.innerHTML += `<div><a href="/products/product-details/${element._id}"><p class='h3'>${element.title}</p> <img width='50px' src='/public/images/product-img/${element.image}'> </a></div> <br>`;
        });
      },
    });
    return;
  }
  searchResults.innerHTML = "";
}

function cancelOrder(id) {
  $.ajax({
    url: "/orders/order-cancel/" + id,
    method: "get",
    success: (response) => {
      if (response.status) {
        location.reload();
      }
    },
  });
}


//for img

function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function (e) {
      $("#img-prvw").attr("src", e.target.result).width(100).height(100);
    };
    reader.readAsDataURL(input.files[0]);
  }
}

$("#image").change(function () {
  readURL(this);
});
$("#coupon-form").validate({
  errorClass: "error fail-alert",

  rules: {
    coupon: {
      required: true,
    },
  },
  messages: {
    coupon: {
      required: "Please enter your coupon name.",
    },
  },

  submitHandler: function applyCoupon(form) {
    $.ajax({
      url: form.action,
      method: form.method,
      data: $(form).serialize(),
      success: (response) => {
        location.reload();
      },
    });
  },
});

//for coupon apply
function copyToClipboard(id) {
  let text = document.getElementById("copy-code-" + id);
  let copyText = document.getElementById(id).innerText;
  navigator.clipboard.writeText(copyText);
  text.innerText = "copied";
  // window.location.reload();
}

function change_image(image) {
  var container = document.getElementById("main-image");

  container.src = image.src;
}




// function changeStatus(id) {
//   let status = $("#update-order-status").val();
//   $.ajax({
//     url: "/admin/orders/change-status/" + id,
//     method: "post",
//     data: {
//       status,
//     },
//     success: (response) => {
//       console.log("response got");
//       if (response.status) {
//         console.log("response true");
//         // Store the updated status in local storage
//         localStorage.setItem('updatedStatus', status);
//         location.reload();
//       }
//     },
//   });
// }

// // On page load, check if there's an updated status in local storage and use it
// $(document).ready(function() {
//   const updatedStatus = localStorage.getItem('updatedStatus');
//   if (updatedStatus) {
//     // Update the status on the page
//     $("#update-order-status").val(updatedStatus);
//   }
// });
// function changeStatus(orderId) {
//   const newStatus = $("#status-" + orderId).val(); // Assuming you have select elements with unique IDs for each order

//   $.ajax({
//     url: `/admin/orders/change-status/${orderId}`,
//     method: "POST",
//     data: {
//       status: newStatus,
//     },
//     success: (response) => {
//       if (response.status) {
//         // Update the status text on the page
//         $(`#status-text-${orderId}`).text(newStatus);
//       }
//     },
//     error: (error) => {
//       console.error("An error occurred while changing status");
//     },
//   });
// }
// function changeStatus(orderId) {
//   const newStatus = $("#status-" + orderId).val();
//   console.log(newStatus,"newStatus")
// $.ajax({
//   // ... (your existing code)
 
//         url: `/admin/orders/change-status/${orderId}`,
//          method: "POST",
//          data: JSON.stringify({
//           status: newStatus,
//         }),
        
//   success: (response) => {
//     if (response.status) {
//       // Update the status text on the page
//       $(`#status-text-${orderId}`).text(newStatus);
     
//     } else {
//       console.error("Server returned a non-successful response");
//     }
//   },
 
//   error: (error) => {
//     console.error("An error occurred while changing status:", error);
//   },
// });
// }   

// function changeStatus(orderId) {
//   console.log("orderId:", orderId); // Debugging line
//   const newStatus = $("#status-" + orderId).val();
//   console.log("newStatus:", newStatus); // Debugging line

//   $.ajax({
//     // ... (your existing code)
//     url: `/admin/orders/change-status/${orderId}`,
//     method: "POST",
//     contentType: "application/json",
//     data: JSON.stringify({
//       status: newStatus,
//     }),
//     success: (response) => {
//       if (response.status) {
//         // Update the status text on the page
//         $(`#status-text-${orderId}`).text(newStatus);
//       } else {
//         console.error("Server returned a non-successful response");
//       }
//     },
//     error: (error) => {
//       console.error("An error occurred while changing status:", error);
//     },
//   });
// }
// function changeStatus(orderId) {
//   // Fetch the newStatus value from the selected option
//   const newStatus =$("#status-select-" + orderId).val();
//   console.log(newStatus, "newStatus");

//   // Make an AJAX request to update the status
//   $.ajax({
//     url: `/admin/orders/change-status/${orderId}`,
//     method: "POST",
//     dataType: "json", // Specify the expected response data type
//     data: {
//       status: newStatus,
//     },
   
//     success: (response) => {
//       console.log(response,"response")
//       if (response.status) {
//         // Update the status text on the page
//         $(`#status-text-${orderId}`).text(response.status);
//       } else {
//         console.error("Server returned a non-successful response");
//       }
//     },
//     error: (error) => {
//       console.error("An error occurred while changing status:", error);
//     },
//   });
// }
function changeStatus(orderId) {
  // Fetch the newStatus value from the selected option
  const newStatus = $("#status-select-" + orderId).val();

  // Make an AJAX request to update the status
  $.ajax({
    url: `/admin/orders/change-status/${orderId}`,
    method: "POST",
    data: {
      status: newStatus,
    },
    dataType: "json", // Specify the expected response data type
    success: (response) => {
      if (response.status) {
        // Update the status text on the page
        $(`#status-text-${orderId}`).text(newStatus);
      } else {
        console.error("Server returned a non-successful response");
      }
    },
    error: (error) => {
      console.error("An error occurred while changing status:", error);
    },
  });
}
   {/* // Function to initialize the image zoom effect */} 
  function magnify(imgID, zoom) {
    var img, glass, w, h, bw;
    img = document.getElementById(imgID);

    /* Create magnifier glass: */
    glass = document.createElement("DIV");
    glass.setAttribute("class", "img-magnifier-glass");

    /* Insert magnifier glass: */
    img.parentElement.insertBefore(glass, img);

    /* Set background properties for the magnifier glass: */
    glass.style.backgroundImage = "url('" + img.src + "')";
    glass.style.backgroundRepeat = "no-repeat";
    glass.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
    bw = 3;
    w = glass.offsetWidth / 2;
    h = glass.offsetHeight / 2;

    /* Execute a function when someone moves the magnifier glass over the image: */
    glass.addEventListener("mousemove", moveMagnifier);
    img.addEventListener("mousemove", moveMagnifier);

    /* And also for touch screens: */
    glass.addEventListener("touchmove", moveMagnifier);
    img.addEventListener("touchmove", moveMagnifier);

    function moveMagnifier(e) {
        var pos, x, y;
        /* Prevent any other actions that may occur when moving over the image */
        e.preventDefault();
        /* Get the cursor's x and y positions: */
        pos = getCursorPos(e);
        x = pos.x;
        y = pos.y;
        /* Prevent the magnifier glass from being positioned outside the image: */
        if (x > img.width - (w / zoom)) {x = img.width - (w / zoom);}
        if (x < w / zoom) {x = w / zoom;}
        if (y > img.height - (h / zoom)) {y = img.height - (h / zoom);}
        if (y < h / zoom) {y = h / zoom;}
        /* Set the position of the magnifier glass: */
        glass.style.left = (x - w) + "px";
        glass.style.top = (y - h) + "px";
        /* Display what the magnifier glass "sees": */
        glass.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";
    }

    function getCursorPos(e) {
        var a, x = 0, y = 0;
        e = e || window.event;
        /* Get the x and y positions of the image: */
        a = img.getBoundingClientRect();
        /* Calculate the cursor's x and y coordinates, relative to the image: */
        x = e.pageX - a.left;
        y = e.pageY - a.top;
        /* Consider any page scrolling: */
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return {x: x, y: y};
    }
}


function changeImage(newImageUrl) {
  // Get the main product image element by ID
  var mainImage = document.getElementById('myimage');
  
  // Set the source of the main image to the clicked thumbnail image URL
  mainImage.src = newImageUrl;
}

//razorpay
// $("#payment-form").submit((e) => {
//   e.preventDefault();
//   $.ajax({
//     url: "/cart/payment",
//     method: "post",
//     data: $("#payment-form").serialize(),
//     success: (response) => {
//       // alert(response)
//       if (response.codStatus == "placed") {
//         console.log(response);
//         console.log(response.status);

//         location.href = "/cart/place-order/success";
//       } else {
//         console.log(response + "response");
//         razorpayPayment(response);
//       }
//     },
//   });
// });

function confirmWalletUse(req, res, next) {
  // Check if the user has confirmed the wallet deduction
  if (!req.body.confirmWalletUse) {
    return res.status(400).json({ status: "Wallet deduction not confirmed" });
  }
  next(); // Proceed to the next middleware or route
}







// $("#payment-form").submit((e) => {
//   e.preventDefault();
  
//   // Prompt the user for wallet deduction confirmation
//   const confirmWalletUse = confirm("Do you want to use your wallet balance for this payment?");
  
//   if (!confirmWalletUse) {
//     alert("Wallet deduction not confirmed.");
//     return;
//   }

//   // Proceed with the payment request
//   $.ajax({
//     url: "/cart/payment",
//     method: "post",
//     data: {
//       ...$("#payment-form").serializeObject(), // Convert form data to object
//       confirmWalletUse: true, // Set confirmWalletUse to true if confirmed
//     },
//     success: (response) => {
//       if (response.codStatus == "placed") {
//         console.log(response);
//         console.log(response.status);
//         location.href = "/cart/place-order/success";
//       } else {
//         console.log(response + "response");
//         razorpayPayment(response);
//       }
//     },
//   });
// });

// // Helper function to serialize form data to an object
// $.fn.serializeObject = function() {
//   var formData = {};
//   var formArray = this.serializeArray();
//   for (var i = 0, n = formArray.length; i < n; ++i) {
//     formData[formArray[i].name] = formArray[i].value;
//   }
//   return formData;
// };

$("#payment-form").submit((e) => {
  e.preventDefault();

  // Check the user's wallet balance
  const walletBalance = parseFloat($("#wallet-balance").text()); // Assuming you have an element with the user's wallet balance

  if (walletBalance > 0) {
    // Wallet balance is greater than zero, ask for confirmation
    const confirmWalletUse = confirm("Do you want to use your wallet balance for this payment?");

    if (confirmWalletUse) {
      // User confirmed wallet deduction
      proceedWithPayment(true);
    } else {
      // User did not confirm wallet deduction, proceed with normal Razorpay payment
      proceedWithPayment(false);
    }
  } else {
    // Wallet balance is zero or negative, proceed with normal Razorpay payment
    proceedWithPayment(false);
  }
});

function proceedWithPayment(useWallet) {
  // Prepare the data to send to the server
  const requestData = {
    ...$("#payment-form").serializeObject(), // Convert form data to an object
    confirmWalletUse: useWallet, // Set confirmWalletUse based on user's choice
  };

  // Proceed with the payment request
  $.ajax({
    url: "/cart/payment",
    method: "post",
    data: requestData,
    success: (response) => {
      if (response.codStatus == "placed") {
        console.log(response);
        console.log(response.status);
        location.href = "/cart/place-order/success";
      } else {
        console.log(response + "response");
        razorpayPayment(response);
      }
    },
  });
}

// Helper function to serialize form data to an object
$.fn.serializeObject = function() {
  var formData = {};
  var formArray = this.serializeArray();
  for (var i = 0, n = formArray.length; i < n; ++i) {
    formData[formArray[i].name] = formArray[i].value;
  }
  return formData;
};



function razorpayPayment(order) {
  var options = {
    key: "rzp_test_Evbm1KLpExRy2h", // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "cakes.N.bakes",
    description: "Test Transaction",
    image: "https://example.com/your_logo",
    order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {
      // alert(response.razorpay_payment_id);
      // alert(response.razorpay_order_id);
      // alert(response.razorpay_signature);
      console.log("verify fn");
      verifyPayment(response, order);
    },
    prefill: {
      name: "Gaurav Kumar",
      email: "gaurav.kumar@example.com",
      contact: "9999999999",
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#3399cc",
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.open();
}


function verifyPayment(payment, order) {
  $.ajax({
    url: "/cart/verify-payment",
    data: {
      payment,
      order,
    },
    method: "post",
    success: (response) => {
      if (response.status) {
        location.href = "/cart/place-order/success";
      }
    },
  });
}

$("#contact-form").submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:"https://script.google.com/macros/s/AKfycbxfjc_GzzXy3IrSVVWWwNdh2hPKwMM9GZ4hzwv4DvRszydAwnAWdxKeBVQ_wgq0_nE/exec",
        data:$("#contact-form").serialize(),
        method:"post",
        success:function (response){
            alert("Form submitted successfully")
            window.location.reload()
            //window.location.href="https://google.com"
        },
        error:function (err){
            alert("Something Error")

        }
    })
})


