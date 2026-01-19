import ProductDetailsScreen from "@/src/features/sales/presentation/view/components/sales/product-details";
import PhysicalSidebar from "@/src/components/ui/physical-sidebar";

// In Next.js, params are directly passed as an object, not a Promise
interface PageProps {
  params: Promise<{
    id: string  // This should match your folder name [id]
  }>
}

const ProductDetailsPage = async ({ params }: PageProps) => {
  // Need to await the params since it's a Promise
  const resolvedParams = await params;
  const productID = resolvedParams.id;

  return (
    <PhysicalSidebar>
      <ProductDetailsScreen productID={productID} />
    </PhysicalSidebar>
  )
}

export default ProductDetailsPage;