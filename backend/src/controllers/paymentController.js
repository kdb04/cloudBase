const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../connection/db.js");

const CLASS_MULTIPLIERS = { economy: 1.0, business: 1.5, first: 2.0 };

const createPaymentIntent = async (req, res) => {
    const { flight_id, passenger_count, class: travelClass } = req.body;

    if (!flight_id || !Number.isInteger(passenger_count) || passenger_count < 1) {
        return res.status(400).json({ message: "Invalid flight_id or passenger_count" });
    }

    const validClass = CLASS_MULTIPLIERS[travelClass] ? travelClass : 'economy';
    console.log(`[PAYMENT] Creating payment intent - Flight: ${flight_id}, Passengers: ${passenger_count}, Class: ${validClass}`);

    const query = "SELECT price FROM flights WHERE flight_id = ?";

    db.query(query, [flight_id], async (err, results) => {
        if (err || results.length === 0) {
            console.log(`[PAYMENT] FAILED - Flight ${flight_id} not found`);
            return res.status(500).json({ message: "Flight not found" });
        }

        const pricePerSeat = results[0].price;
        const multiplier = CLASS_MULTIPLIERS[validClass];
        const adjustedPrice = Math.round(pricePerSeat * multiplier);
        const totalAmount = adjustedPrice * passenger_count * 100;

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: totalAmount,
                currency: "inr",
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                     flight_id: flight_id.toString(),
                     passenger_count: passenger_count.toString(),
                     travel_class: validClass
                }
            });

            console.log(`[PAYMENT] SUCCESS - Payment intent created for ₹${totalAmount / 100} (${multiplier}x multiplier)`);
            res.status(200).json({
                clientSecret: paymentIntent.client_secret,
                amount: totalAmount / 100,
                adjustedPrice
            });
        } catch (error) {
            console.error("Stripe Error:", error);
            res.status(500).json({ message: "Payment initialization failed", error: error.message });
        }
    });
};

const createRoundTripPaymentIntent = async (req, res) => {
    const { outbound_flight_id, return_flight_id, passenger_count, class: travelClass } = req.body;

    if (!outbound_flight_id || !return_flight_id || !Number.isInteger(passenger_count) || passenger_count < 1) {
        return res.status(400).json({ message: "Invalid flight IDs or passenger_count" });
    }

    const validClass = CLASS_MULTIPLIERS[travelClass] ? travelClass : 'economy';
    const multiplier = CLASS_MULTIPLIERS[validClass];
    console.log(`[PAYMENT] Creating round-trip payment intent - Outbound: ${outbound_flight_id}, Return: ${return_flight_id}, Passengers: ${passenger_count}, Class: ${validClass}`);

    db.query(
        "SELECT flight_id, price FROM flights WHERE flight_id IN (?, ?)",
        [outbound_flight_id, return_flight_id],
        async (err, results) => {
            if (err || results.length < 2)
                console.log(`[PAYMENT] FAILED - Round-trip flights not found or DB error: outbound=${outbound_flight_id}, return=${return_flight_id}, error=${err}`);
                return res.status(500).json({ message: "One or both flights not found" });

            const prices = {};
            results.forEach(r => { prices[String(r.flight_id)] = r.price; });

            const outboundAdj = Math.round(prices[String(outbound_flight_id)] * multiplier);
            const returnAdj   = Math.round(prices[String(return_flight_id)]   * multiplier);
            const totalAmount = (outboundAdj + returnAdj) * passenger_count * 100;

            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: totalAmount,
                    currency: "inr",
                    automatic_payment_methods: { enabled: true },
                    metadata: {
                        outbound_flight_id: outbound_flight_id.toString(),
                        return_flight_id: return_flight_id.toString(),
                        passenger_count: passenger_count.toString(),
                        travel_class: validClass
                    }
                });
                res.status(200).json({
                    clientSecret: paymentIntent.client_secret,
                    amount: totalAmount / 100,
                    outboundAdjustedPrice: outboundAdj,
                    returnAdjustedPrice: returnAdj
                });
            } catch (error) {
                console.error("Stripe Error:", error);
                res.status(500).json({ message: "Payment initialization failed", error: error.message });
            }
        }
    );
};

module.exports = { createPaymentIntent, createRoundTripPaymentIntent };
