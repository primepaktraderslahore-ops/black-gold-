import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductVariant {
    variant: string;
    price: number;
    prevPrice?: number;
    image?: string;
    isWholesale?: boolean;
}

export interface IProduct extends Document {
    title: string;
    description?: string;
    variants: IProductVariant[];
    banner?: string;
    benefits?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
    {
        title: { type: String, required: true }, // Changed name to title to match UI
        description: { type: String },
        variants: [
            {
                variant: { type: String, required: true }, // e.g. "250gm"
                price: { type: Number, required: true },
                prevPrice: { type: Number },
                image: { type: String },
                isWholesale: { type: Boolean, default: false }
            }
        ],
        banner: { type: String }, // Custom label like "SALE"
        benefits: { type: [String] } // Array of benefit strings
    },
    { timestamps: true }
);

// Force model rebuild in dev to handle schema changes
if (process.env.NODE_ENV !== 'production') {
    delete mongoose.models.Product;
}
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
