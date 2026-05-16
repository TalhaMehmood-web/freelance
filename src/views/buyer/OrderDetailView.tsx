interface OrderDetailViewProps {
  orderId: string
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary">Order Details</h1>
      <p className="text-text-secondary mt-2">Order ID: {orderId}</p>
    </div>
  )
}
