import mongoose, { Schema, Document, Model } from 'mongoose';

export enum OrderStatus {
    ACCEPTED = 'Accepted',
    READY_FOR_DELIVERY = 'Ready for Delivery',
    IN_DELIVERY = 'In Delivery',
    DELIVERED = 'Delivered',
    CANCELLED = 'Cancelled',
}

interface ICartItem {
    variant: string; // 10g, 20g, 30g
    price: number;
    quantity: number;
}

export interface IOrder extends Document {
    orderId?: string; // Custom numeric ID
    customer: {
        name: string; // Added name
        email: string;
        phone: string;
        address: string;
        address2?: string;

        postalCode: string;
        province: string;
        city: string;
    };
    items: ICartItem[];
    // ...
}

const OrderSchema: Schema = new Schema(
    {
        orderId: { type: String, unique: true },
        customer: {
            name: { type: String, required: true }, // Added name match
            email: {
                type: String,
                required: true,
                match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
            },
            phone: {
                type: String,
                required: true,
                validate: {
                    validator: function (v: string) {
                        return /^\d{11}$/.test(v);
                    },
                    message: (props: any) => `${props.value} is not a valid 11-digit phone number!`
                }
            },
            address: { type: String, required: true },
            address2: { type: String },

            postalCode: { type: String, required: true },
            province: { type: String, required: true },
            city: { type: String, required: true },
        },
        items: [
            {
                variant: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true, default: 1 },
            },
        ],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.ACCEPTED,
        },
        isWholesale: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
