const express = require("express");
const paypal = require("paypal-rest-sdk");
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const alert = require('alert'); 
const morgan = require("morgan");

//let PORT = 3000

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AUo-kQDHSBws6GPcrblX_2jVzKoQrAI1tUCx9QMWVPh1E4LXDhBQprFeZo1YlrsuxtYZpil-xqn1lwg9",
  client_secret:
    "EOKjzpRyxHdOHY5mGWZEYRi-W6lluLiEPY2I90NLfzBHbvJbX-acExPMlBAXG1va0wg8E1mfpZwoFYmt",
});

const PORT = process.env.PORT || 3000

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(cors());
const handlebars = require('express-handlebars')
             .create({ defaultLayout:'main' });
 app.engine('handlebars', handlebars.engine); 
 app.set('view engine', 'handlebars');
 app.set('views', './views');


//app.get("/", (req, res) => res.sendFile(__dirname + "home"));

app.get('/', (req, res) => {
  res.render('home');
});
app.get('/home', (req, res) => {
  res.render('home');
});
app.get('/order', (req, res) => {
  res.render('order');
});





app.get('/cancel', (req, res) => {
  res.render('cancel');
});



app.post("/pay", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Chicken Bugger Meal",
              sku: "001",
              price: "13.50",
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: "13.50",
        },
        description: "Chicken Bugger Meal Full Student Lunch",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

var summary = ('yo');

app.get('/completed', (req, res) => {

  //var summary = req.query.payerId;
  res.render('completed', {summary });
       
  //res.json({ summary: 'Node.js, Express, and Postgres API' });

});


app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "13.50",
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
      // res.send('Payment Authorized');
       //alert("Payment Authorized");
      // res.send('Payment Authorized');
      
     // res.redirect('completed');
    
      res.redirect('completed');
      /*notifier.notify({
        title: 'Salutations!',
        message: 'Hey there!',
        //icon: path.join(__dirname, 'icon.jpg'),
        //sound: true,
       // wait: true
      }
      );*/
        
      }
    }
  );
});

app.get('/cancel', (req, res) => res.redirect('cancel'));

app.listen(PORT, () => console.log(`Server Started on ${PORT}`));

