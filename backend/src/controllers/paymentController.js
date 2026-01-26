const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../connection/db.js");

const createPaymentIntent = async (req, res) => {
    const { flight_id, passenger_count } = req.body;

    const query = "SELECT price FROM flights WHERE flight_id = ?";
    
    db.query(query, [flight_id], async (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ message: "Flight not found" });

        const pricePerSeat = results[0].price;
        const totalAmount = pricePerSeat * passenger_count * 100; 

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: totalAmount,
                currency: "inr",
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: { flight_id: flight_id.toString() }
            });

            res.status(200).json({
                clientSecret: paymentIntent.client_secret,
                amount: totalAmount / 100 
            });
        } catch (error) {
            console.error("Stripe Error:", error);
            res.status(500).json({ message: "Payment initialization failed", error: error.message });
        }
    });
};

module.exports = { createPaymentIntent };
