import mongoose from "mongoose"

const orderItemSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  lineTotal: {
    type: Number,
    required: true,
    min: 0,
  },
})

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer is required"],
    },
    items: [orderItemSchema],
    total: {
      type: Number,
      required: [true, "Total is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Fulfilled", "Cancelled"],
      default: "Pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    paidAt: {
      type: Date,
    },
    fulfilledAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Calculate total before saving
orderSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.total = this.items.reduce((sum, item) => sum + item.lineTotal, 0)
  }
  next()
})

export default mongoose.model("Order", orderSchema)
