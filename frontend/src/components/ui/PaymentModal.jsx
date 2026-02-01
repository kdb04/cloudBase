import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import Button from './Button';
import { formatPrice } from '../../utils/formatters';

export const PaymentModal = ({ onClose, onSuccess, amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + "/booking-success",
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message);
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            onSuccess(paymentIntent.id);
        } else {
            setMessage("Unexpected state.");
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Complete Payment</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Total to pay: {formatPrice(amount)}</p>

                <form onSubmit={handleSubmit}>
                    <PaymentElement />

                    {message && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                            {message}
                        </div>
                    )}

                    <div className="mt-6 flex gap-3 justify-end">
                        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !stripe || !elements}>
                            {isLoading ? "Processing..." : `Pay ${formatPrice(amount)}`}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
